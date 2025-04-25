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
    // Example: https://www.signbank.org/iswa/15a/15a_bs.html
    DEFAULT_ORIENTATIONS = 96,
    // Example: https://www.signbank.org/iswa/15b/15b_bs.html
    INBETWEEN_ORIENTATIONS = 64,
    // Example: https://www.signbank.org/iswa/15c/15c_bs.html
    HORIZONTAL_ORIENTATIONS = 16,
}

const HAND_SYMBOL_BLOCK_LENGTHS = [
    HandSymbolBlockLength.DEFAULT_ORIENTATIONS,
    HandSymbolBlockLength.INBETWEEN_ORIENTATIONS,
    HandSymbolBlockLength.HORIZONTAL_ORIENTATIONS,
];

type PalmDirection = {
    palm_towards: boolean,
    palm_away: boolean,
    palm_sideways: boolean,
};

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
        let handshape = baseSymbols[0];
        baseSymbols.forEach(baseSymbol => {
            const symbols = handSymbols.filter(symbol => symbol.baseSymbol === baseSymbol);
            const blockLength = symbols.length as HandSymbolBlockLength;
            if (!HAND_SYMBOL_BLOCK_LENGTHS.includes(blockLength)) {
                throw new Error(
                    `Hand symbol block ${baseSymbol} has ${blockLength} symbols. `
                    + `Expected number of symbols to be one of: ${HAND_SYMBOL_BLOCK_LENGTHS.join(", ")}`
                );
            }
            // Some handshapes have multiple base symbols. The first base symbol will always have default palm orientations.
            // In these cases, the first base symbol will be used as the handshape.
            if (blockLength === HandSymbolBlockLength.DEFAULT_ORIENTATIONS) {
                handshape = baseSymbol;       
            }
            let isRightHanded = true;
            const isHorizontalOrientation = blockLength === HandSymbolBlockLength.HORIZONTAL_ORIENTATIONS;
            let isVertical = isHorizontalOrientation ? false : true;
            let palmDirection = this.getPalmDirection(blockLength, 0);
            const numIterationsMade = (i: number, n: number): boolean => i > 0 && i % n === 0;
            symbols.forEach((symbol, i) => {
                // Hand switches every 8 characters
                if (numIterationsMade(i, 8)) {
                    isRightHanded = !isRightHanded;
                }
                const fingerDirections = isRightHanded
                    ? COUNTER_CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS
                    : CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS;
                const symbolRotation = fingerDirections[i % 8]; // Starts at beginning of list every 8 characters
                // First half of the characters are vertical, except when all are horizontal
                if (!isHorizontalOrientation && numIterationsMade(i, blockLength / 2)) {
                    isVertical = !isVertical;
                }
                // Palm directions change every 16 characters, unless symbol only represents horizontal orientations.
                // In that case, it changes with every symbol, which each have a unique rotation that represents the exact orientation.
                if (numIterationsMade(i, 16) || isHorizontalOrientation) {
                    palmDirection = this.getPalmDirection(blockLength, i);
                }
                // Base symbols with only horizontal orientations have pictures for 6/8 of the symbol rotations
                // (that each represent 6/8 palm orientations) for the right hand only.
                if (isHorizontalOrientation && isRightHanded) {
                    handSymbolRotationPictures.push({
                        base_symbol: symbol.baseSymbol,
                        symbol_rotation: symbolRotation,
                    });
                }
                // Other symbols have 6 pictures for each 6 palm directions.
                // Palm directions switch every 16 characters.
                if (!isHorizontalOrientation && (numIterationsMade(i, 16) || i === 0)) {
                    handOrientationPictures.push({
                        base_symbol: symbol.baseSymbol,
                        vertical: isVertical,
                        ...palmDirection
                    });
                }
                hands.push({
                    symbol: symbol.character,
                    handshape,
                    base_symbol: symbol.baseSymbol,
                    symbol_rotation: symbolRotation,
                    rotatable_finger_direction: !isHorizontalOrientation,
                    right_handed: isRightHanded,
                    vertical: isVertical,
                    ...palmDirection,
                });
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

    private getPalmDirection(blockLength: HandSymbolBlockLength, i: number): PalmDirection {
        switch (blockLength) {
            case HandSymbolBlockLength.HORIZONTAL_ORIENTATIONS:
                return this.getHorizontalPalmDirection(i);
            case HandSymbolBlockLength.INBETWEEN_ORIENTATIONS:
                return this.getInbetweenPalmDirection(i);
            case HandSymbolBlockLength.DEFAULT_ORIENTATIONS:
                return this.getDefaultPalmDirection(i);
        }
    }

    private getDefaultPalmDirection(i: number): PalmDirection {
        switch(i) {
            case 32:
            case 80:
                return {
                    palm_towards: false,
                    palm_away: false,
                    palm_sideways: true,
                };
            case 16:
            case 64:
                return {
                    palm_towards: false,
                    palm_away: true,
                    palm_sideways: false,
                };
            // 0 or 48
            default:
                return {
                    palm_towards: true,
                    palm_away: false,
                    palm_sideways: false,
                };
        }
    }

    private getInbetweenPalmDirection(i: number): PalmDirection {
        switch(i) {
            case 16:
            case 48:
                return {
                    palm_towards: false,
                    palm_away: true,
                    palm_sideways: true,
                };
            // 0 or 32
            default:
                return {
                    palm_towards: true,
                    palm_away: false,
                    palm_sideways: true,
                };
        }
    }

    private getHorizontalPalmDirection(i: number): PalmDirection {
        switch(i) {
            case 4:
            case 12:
                return {
                    palm_towards: false,
                    palm_away: true,
                    palm_sideways: false,
                };
            case 3:
            case 11:
            case 5:
            case 13:
                return {
                    palm_towards: false,
                    palm_away: true,
                    palm_sideways: true,
                };
            case 2:
            case 10:
            case 6:
            case 14:
                return {
                    palm_towards: false,
                    palm_away: false,
                    palm_sideways: true,
                };
            case 1:
            case 9:
            case 7:
            case 15:
                return {
                    palm_towards: true,
                    palm_away: false,
                    palm_sideways: true,
                };
            // 0 or 8
            default:
                return {
                    palm_towards: true,
                    palm_away: false,
                    palm_sideways: false
                };
            }
    }
}