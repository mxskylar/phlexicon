import * as fs from 'fs';
import opentype from 'opentype.js';
import { HANDS_TABLE } from '../../../src/db/tables';
import { Hand, HandOrientationPicture, HandSymbolRotationPicture } from '../../../src/phonemes/sign/hand';
import {
    CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS,
    COUNTER_CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS,
    SignWritingCategory
} from "../../../src/phonemes/sign/sign-writing";
import { DataParser, DataType, DataWarning } from "../data-parser";
import { getPercent, getSeperatedValueData, getUniqueValues, sortAscending } from "../parse-utils";
import { SignWritingBlock, SignWritingCategoryBlock } from '../../sign-writing-block';

type ParsedGlyph = {
    glyph: opentype.Glyph,
    character: string | null,
    number: number | null,
};

export type SignWritingSymbol = {
    glyph: opentype.Glyph,
    character: string,
    number: number,
    category: SignWritingCategory,
    symbolGroup: string,
    baseSymbol: string,
};

enum HandSymbolBlockLength {
    DEFAULT_ORIENTATIONS = 96,
    INBETWEEN_ORIENTATIONS = 64,
    HORIZONTAL_ORIENTATIONS = 16,
}

const HAND_SYMBOL_BLOCK_LENGTHS = [
    HandSymbolBlockLength.DEFAULT_ORIENTATIONS,
    HandSymbolBlockLength.INBETWEEN_ORIENTATIONS,
    HandSymbolBlockLength.HORIZONTAL_ORIENTATIONS,
];

export class SignWritingFontParser implements DataParser {
    warnings: DataWarning[] = [];
    symbols: SignWritingSymbol[] = [];
    categories: SignWritingCategoryBlock[];
    symbolGroups: SignWritingBlock[];
    baseSymbols: SignWritingBlock[];

    constructor(
        fontFilePath: string,
        categoriesFilePath: string,
        symbolGroupsFilePath: string,
        baseSymbolsFilePath: string,
    ) {
        const TSV_OPTIONS = {delimiter: "\t"};
        // Symbol Categories
        console.log(`Parsing: ${categoriesFilePath}`);
        this.categories = getSeperatedValueData(categoriesFilePath, TSV_OPTIONS);
        // Symbol Groups
        console.log(`Parsing: ${symbolGroupsFilePath}`);
        this.symbolGroups = getSeperatedValueData(symbolGroupsFilePath, TSV_OPTIONS);
        // Base Symbols
        console.log(`Parsing: ${baseSymbolsFilePath}`);
        this.baseSymbols = getSeperatedValueData(baseSymbolsFilePath, TSV_OPTIONS);
        // Symbols
        console.log(`Parsing: ${fontFilePath}`);
        this.symbols = this.getSymbols(fontFilePath);
    }

    private getSymbols(fontFilePath: string): SignWritingSymbol[]  {
        // PARSE GLYPHS
        const font = this.getFont(fontFilePath);
        const parsedGlyphsBestEffort = Object.values(font.glyphs.glyphs)
            .map(glyph => this.getSymbolBestEffort(glyph));
        const parsedGlyphs = parsedGlyphsBestEffort.filter(symbol => symbol.number && symbol.character);
        // Log warning if not able to get numbers and unicode characters for too many glyphs
        const numGlyphs = parsedGlyphsBestEffort.length;
        const numNotFound = numGlyphs - parsedGlyphs.length;
        const percentCharsRetrieved = getPercent(numNotFound, numGlyphs);
        console.log(`=> Retrieved number and unicode characters for ${100 - percentCharsRetrieved}% (${numGlyphs - numNotFound}/${numGlyphs}) of SignWriting font glyphs`);
        const MAX_PERCENT_SYMBOLS_NOT_PARSED = 2;
        if (percentCharsRetrieved > MAX_PERCENT_SYMBOLS_NOT_PARSED) {
            this.warnings.push({
                dataName: HANDS_TABLE.name,
                dataType: DataType.TABLE,
                message: `Unable to parse number or unicode characters for more than ${MAX_PERCENT_SYMBOLS_NOT_PARSED}% of SignWriting font glyphs`
            });
        }
        // PARSE SYMBOLS
        const symbols: SignWritingSymbol[] = parsedGlyphs.map(symbol => {
            const number = symbol.number as number;
            return {
                glyph: symbol.glyph,
                character: symbol.character as string,
                number,
                category: this.getCategoryName(number, this.categories),
                symbolGroup: this.getBlockSymbol(number, this.symbolGroups),
                baseSymbol: this.getBlockSymbol(number, this.baseSymbols)
            };
        });
        symbols.sort((a, b) => sortAscending(a.glyph.index, b.glyph.index)); // Sort symbols by glyph index
        return symbols;
    }

    private getFont(fontFilePath: string): opentype.Font {
        const fontFileBuffer = fs.readFileSync(fontFilePath);
        const toArrayBuffer = (buffer: Buffer): ArrayBuffer => {
            const arrayBuffer = new ArrayBuffer(buffer.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < buffer.length; i++) {
                view[i] = buffer[i];
            }
            return arrayBuffer;
        };
        return opentype.parse(toArrayBuffer(fontFileBuffer));
    }

    private getUnicodeCharacter(glyph: opentype.Glyph): string | null {
        try {
           return String.fromCodePoint(glyph.unicode);
        } catch (ex) {
            console.log(`=> WARNING: Unable to get unicode character for glyph ${glyph.name} due to exception:`);
            console.log(ex);
        }
        return null;
    }

    private getGlyphNumber(glyph: opentype.Glyph): number | null {
        const match = glyph.name.match(/S([0-9a-fA-F]+)/);
        if (match) {
            return new Number(`0x${match[1]}`) as number;
        }
        return null;
    }

    private getSymbolBestEffort(glyph: opentype.Glyph): ParsedGlyph {
        return {
            glyph,
            character: this.getUnicodeCharacter(glyph),
            number: this.getGlyphNumber(glyph),
        }
    }

    private getBlockSymbol(symbolNumber: number, blocks: SignWritingBlock[]): string {
        for (let i = blocks.length - 1; i >= 0; i--) {
            const block = blocks[i];
            if (symbolNumber >= block.startNumber) {
                return block.symbol;
            }
        }
        throw new Error(`No SignWriting font block found for symbol number ${symbolNumber}`);
    }

    private getCategoryName(symbolNumber: number, categories: SignWritingCategoryBlock[]): SignWritingCategory {
        for (let i = categories.length - 1; i >= 0; i--) {
            const category = categories[i];
            if (symbolNumber >= category.startNumber) {
                return category.name;
            }
        }
        throw new Error(`No SignWriting category found for symbol number ${symbolNumber}`);
    }

    // https://www.signbank.org/iswa/cat_1.html
    public getHandData(): {
        hands: Hand[],
        handOrientationPictures: HandOrientationPicture[],
        handSymbolRotationPictures: HandSymbolRotationPicture[],
    } {
        const handSymbols = this.getSymbolsWithCategory(SignWritingCategory.HANDS);
        const baseSymbols = this.getBaseSymbols(handSymbols);
        const hands: Hand[] = [];
        const handOrientationPictures: HandOrientationPicture[] = [];
        const handSymbolRotationPictures: HandSymbolRotationPicture[] = [];
        baseSymbols.forEach(baseSymbol => {
            const symbols = handSymbols.filter(symbol => symbol.baseSymbol === baseSymbol);
            const blockLength = symbols.length as HandSymbolBlockLength;
            if (!HAND_SYMBOL_BLOCK_LENGTHS.includes(blockLength)) {
                throw new Error(
                    `Hand symbol block ${baseSymbol} has ${blockLength} symbols. `
                    + `Expected number of symbols to be one of: ${HAND_SYMBOL_BLOCK_LENGTHS.join(", ")}`
                );
            }
            let isRightHanded = true;
            const isHorizontalOrientation = blockLength === HandSymbolBlockLength.HORIZONTAL_ORIENTATIONS;
            let isVertical = isHorizontalOrientation ? false : true;
            const isInbetweenOrientation = blockLength === HandSymbolBlockLength.INBETWEEN_ORIENTATIONS;
            let palmOrientations = isInbetweenOrientation
                ? {palm_towards: true, palm_away: false, palm_sideways: true}
                : {palm_towards: true, palm_away: false, palm_sideways: false};
            const numIterationsMade = (i: number, n: number): boolean =>
                i > 0 && i % n === 0;
            symbols.forEach((symbol, i) => {
                // Switches every 8 characters
                if (numIterationsMade(i, 8)) {
                    isRightHanded = !isRightHanded;
                }
                const fingerDirections = isRightHanded
                    ? COUNTER_CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS
                    : CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS;
                // First half of the characters are vertical, except when all are horizontal
                if (!isHorizontalOrientation && numIterationsMade(i, blockLength / 2)) {
                    isVertical = !isVertical;
                }
                const getPalmOrientations = (): {
                    palm_towards: boolean | null,
                    palm_away: boolean | null,
                    palm_sideways: boolean | null,
                } => {
                    // Horizontal orientations are encoded with symbol rotation
                    // rather than palm orientation indicators
                    if (isHorizontalOrientation) {
                        return {
                            palm_towards: null,
                            palm_away: null,
                            palm_sideways: null,
                        };
                    }
                    if (numIterationsMade(i, 16)) {
                        if (isInbetweenOrientation) {
                            if (palmOrientations.palm_towards) {
                                palmOrientations.palm_towards = false;
                                palmOrientations.palm_away = true;
                            }
                            if (palmOrientations.palm_away) {
                                palmOrientations.palm_away = false;
                                palmOrientations.palm_towards = true;
                            }
                        } else {
                            if (palmOrientations.palm_towards) {
                                palmOrientations.palm_towards = false;
                                palmOrientations.palm_sideways = true;
                            }
                            if (palmOrientations.palm_sideways) {
                                palmOrientations.palm_sideways = false;
                                palmOrientations.palm_away = true;
                            }
                            if (palmOrientations.palm_away) {
                                palmOrientations.palm_away = false;
                                palmOrientations.palm_towards = true;
                            }
                        }
                    }
                    return palmOrientations;
                }
                hands.push({
                    symbol: symbol.character,
                    handshape: "d", // TODO: Get handshape
                    base_symbol: symbol.baseSymbol,
                    symbol_rotation: fingerDirections[i % 8], // Starts at beginning of list every 8 characters
                    // Orientation
                    right_handed: isRightHanded,
                    vertical: isVertical,
                    ...getPalmOrientations(),
                });
                /*if (isHorizontalOrientation) {
                    handOrientationPictures.push({

                    });
                } else {
                    handSymbolRotationPictures.push({

                    });
                }*/
            });
        });
        return {hands, handOrientationPictures, handSymbolRotationPictures};
    }

    private getSymbolsWithCategory(category: SignWritingCategory) {
        return this.symbols.filter(symbol => symbol.category === category);
    }

    private getBaseSymbols(symbols: SignWritingSymbol[]): string[] {
        return getUniqueValues(symbols.map(symbol => symbol.baseSymbol));
    }
}