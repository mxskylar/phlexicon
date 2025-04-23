import * as fs from 'fs';
import opentype from 'opentype.js';
import { HANDS_TABLE } from '../../../src/db/tables';
import { CLOCKWISE_FINGER_DIRECTIONS, COUNTER_CLOCKWISE_FINGER_DIRECTIONS, Hand, PALM_DIRECTIONS, PalmDirection } from '../../../src/phonemes/sign/hand';
import { SignWritingCategory } from "../../../src/phonemes/sign/sign-writing-category";
import { DataParser, DataType, DataWarning } from "../data-parser";
import { getJsonData, getPercent, getSeperatedValueData, getUniqueValues, sortAscending } from "../parse-utils";
import { SignWritingBlock } from '../../sign-writing-block';
import { RawAlphabetData } from './sign-phoneme-parser';

type ParsedGlyph = {
    glyph: opentype.Glyph,
    character: string | null,
    number: number | null,
};

type PasrsedSymbol = {
    glyph: opentype.Glyph,
    character: string,
    number: number,
    category: SignWritingCategory,
    symbolGroupName: string,
    baseSymbolName: string,
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
    categories: SignWritingBlock[];
    symbolGroupBlocks: SignWritingBlock[];
    symbolGroups: string[];
    baseSymbolBlocks: SignWritingBlock[];
    baseSymbols: string[] = [];

    constructor(
        fontFilePath: string,
        categoriesFilePath: string,
        symbolGroupsFilePath: string,
        baseSymbolsFilePath: string,
        iswaFilePath: string,
    ) {
        const OPTIONS = {delimiter: "\t"};
        console.log(`Parsing: ${categoriesFilePath}`);
        this.categories = getSeperatedValueData(categoriesFilePath, OPTIONS);
        console.log(`Parsing: ${symbolGroupsFilePath}`);
        this.symbolGroupBlocks = getSeperatedValueData(symbolGroupsFilePath, OPTIONS);
        console.log(`Parsing: ${baseSymbolsFilePath}`);
        this.baseSymbolBlocks = getSeperatedValueData(baseSymbolsFilePath, OPTIONS);
        console.log(`Parsing ${iswaFilePath}`);
        const iswaAlphabet: RawAlphabetData = getJsonData(iswaFilePath);
        this.symbolGroups = Object.keys(iswaAlphabet.data);
        Object.values(iswaAlphabet.data).forEach(symbols => symbols.forEach(symbol => this.baseSymbols.push(symbol)));
        console.log(`Parsing: ${fontFilePath}`);
        this.symbols = this.getSymbols(fontFilePath);
    }

    private getBlockName(symbolNumber: number, blocks: SignWritingBlock[]): string {
        for (let i = blocks.length - 1; i >= 0; i--) {
            const block = blocks[i];
            if (symbolNumber >= block.startNumber) {
                return block.name;
            }
        }
        throw new Error(`No SignWriting font block found for symbol number ${symbolNumber}`);
    }

    private getBlockSymbol(symbols: string[], blockSymbols: string[]) {
        for (const i in blockSymbols) {
            const blockSymbol = blockSymbols[i];
            if (symbols.includes(blockSymbol)) {
                return blockSymbol;
            }
        }
        throw new Error(`None of the block symbols ${blockSymbols.join(", ")} were found in block of symbols ${symbols.join(", ")}`);
    }

    private getBlockNameMap(
        key: string,
        parsedSymbols: PasrsedSymbol[],
        blockSymbols: string[],
    ): {[index: string]: string} {
        const blockNameMap = {};
        const names = getUniqueValues(parsedSymbols.map(parsedSymbol => parsedSymbol[key]));
        names.forEach(name => {
            const characters = parsedSymbols
                .filter(parsedSymbol => parsedSymbol[key] === name)
                .map(parsedSymbol => parsedSymbol.character);
            blockNameMap[name] = this.getBlockSymbol(characters, blockSymbols);
        });
        return blockNameMap;
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
        const parsedSymbols: PasrsedSymbol[] = parsedGlyphs.map(symbol => {
            const number = symbol.number as number;
            return {
                glyph: symbol.glyph,
                character: symbol.character as string,
                number,
                category: this.getBlockName(number, this.categories) as SignWritingCategory,
                symbolGroupName: this.getBlockName(number, this.symbolGroupBlocks),
                baseSymbolName: this.getBlockName(number, this.baseSymbolBlocks)
            };
        });
        const symbolGroupNameMap = this.getBlockNameMap("symbolGroupName", parsedSymbols, this.symbolGroups);
        const baseSymbolNameMap = this.getBlockNameMap("baseSymbolName", parsedSymbols, this.baseSymbols);
        const symbols: SignWritingSymbol[] = parsedSymbols.map(parsedSymbol => {
            return {
                glyph: parsedSymbol.glyph,
                character: parsedSymbol.character,
                number: parsedSymbol.number,
                category: parsedSymbol.category,
                symbolGroup: symbolGroupNameMap[parsedSymbol.symbolGroupName],
                baseSymbol: baseSymbolNameMap[parsedSymbol.baseSymbolName],
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

    // https://www.signbank.org/iswa/cat_1.html
    public getHands(): Hand[] {
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
                    ? COUNTER_CLOCKWISE_FINGER_DIRECTIONS
                    : CLOCKWISE_FINGER_DIRECTIONS;
                // Switches every 6 characters
                if (numIterationsMade(i, 16)) {
                    p++;
                }
                const palmDirection = isFistHeel
                    ? PalmDirection.TOP_VIEW_UP
                    : PALM_DIRECTIONS[p];
                hands.push({
                    symbol: symbol.character,
                    handshape: symbol.baseSymbol,
                    palm_direction: palmDirection,
                    // Starts at beginning of list every 8 characters
                    finger_direction: fingerDirections[i % 8],
                    is_right_handed: isRightHanded,
                });
            });
        });
        return hands;
    }
}