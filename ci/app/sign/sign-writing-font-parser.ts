import * as fs from 'fs';
import opentype from 'opentype.js';
import { HANDS_TABLE } from '../../../src/db/tables';
import { Hand } from '../../../src/phonemes/sign/hand';
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
        handPicturesPerOrientation: [],
        handPicturesPerSymbolRotation: [],
    } {
        const handSymbols = this.getSymbolsWithCategory(SignWritingCategory.HANDS)
            .filter(symbol => !["񂈱"].includes(symbol.baseSymbol)); // TODO: Account for these handshapes
        const baseSymbols = this.getBaseSymbols(handSymbols);
        const hands: Hand[] = [];
        baseSymbols.forEach(baseSymbol => {
            // Fist Heel is the only handshape with a different pattern
            // https://www.signbank.org/iswa/204/204_bs.html
            // TODO: Verify the assmed properties, especially palm & finger directions, are correct for these
            const isFistHeel = ["񆆑", "񁳱", "񁶱", "񁹱", "񂊑", "񂍑", "񅱑"].includes(baseSymbol);
            const symbols = this.getSymbolsWithBaseSymbol(
                handSymbols,
                baseSymbol,
                isFistHeel ? 16 : 96
            );
            let isRightHanded = true;
            let p = 0;
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
                // Switches every 6 characters
                if (numIterationsMade(i, 16)) {
                    p++;
                }
                /*const palmDirection = isFistHeel
                    ? PalmDirection.TOP_VIEW_UP
                    : PALM_DIRECTIONS[p];
                hands.push({
                    symbol: symbol.character,
                    handshape: symbol.baseSymbol,
                    palm_direction: palmDirection,
                    // Starts at beginning of list every 8 characters
                    symbol_rotation: fingerDirections[i % 8],
                    right_handed: isRightHanded,
                });*/
            });
        });
        return {
            hands,
            handPicturesPerOrientation: [],
            handPicturesPerSymbolRotation: [],
        };
    }

    private getSymbolsWithCategory(category: SignWritingCategory) {
        return this.symbols.filter(symbol => symbol.category === category);
    }

    private getBaseSymbols(symbols: SignWritingSymbol[]): string[] {
        return getUniqueValues(symbols.map(symbol => symbol.baseSymbol));
    }

    private getSymbolsWithBaseSymbol(
        symbols: SignWritingSymbol[],
        baseSymbol: string,
        numExpected: number,
    ): SignWritingSymbol[] {
        const filteredSymbols = symbols.filter(symbol => symbol.baseSymbol === baseSymbol);
        const numFound = filteredSymbols.length;
        if (numFound !== numExpected) {
            throw new Error(
                `Found ${numFound} symbols with the base symbol ${baseSymbol} but expected ${numExpected}`
            );
        }
        return filteredSymbols;
    }
}