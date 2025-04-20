import * as fs from 'fs';
import opentype from 'opentype.js';
import { BODY_TABLE, DYNAMICS_TABLE, HANDS_TABLE, HEAD_AND_FACES_TABLE, MOVEMENT_TABLE } from '../../../src/db/tables';
import { CLOCKWISE_FINGER_DIRECTIONS, COUNTER_CLOCKWISE_FINGER_DIRECTIONS, Hand, PALM_DIRECTIONS, PalmDirection } from '../../../src/phonemes/sign/hand';
import { SignWritingBaseSymbol, SignWritingCategory } from "../../../src/phonemes/sign/sign-writing";
import { DataParser, DataType, DataWarning } from "../data-parser";
import { getPercent, getUniqueValues, sortAscending } from "../parse-utils";
import { SignWritingSymbol } from './sign-writing-symbol';

type ParsedSymbol = {
    glyph: opentype.Glyph,
    character: string | null,
    number: number | null,
};

export class SignWritingFontParser implements DataParser {
    warnings: DataWarning[] = [];
    symbols: SignWritingSymbol[] = [];

    constructor(filePath: string) {
        console.log(`Parsing: ${filePath}`);
        const font = this.getFont(filePath);
        const parsedSymbolsBestEffort = Object.values(font.glyphs.glyphs)
            .map(glyph => this.getSymbolBestEffort(glyph));
        const parsedSymbols = parsedSymbolsBestEffort.filter(symbol => symbol.character);
        // Log warning if not able to get numbers and unicode characters for too many glyphs
        const numGlyphs = parsedSymbolsBestEffort.length;
        const numNotFound = numGlyphs - parsedSymbols.length;
        const percentCharsRetrieved = getPercent(numNotFound, numGlyphs);
        console.log(`=> Retrieved number and unicode characters for ${100 - percentCharsRetrieved}% (${numGlyphs - numNotFound}/${numGlyphs}) of SignWriting font glyphs`);
        const MAX_PERCENT_SYMBOLS_NOT_PARSED = 2;
        if (percentCharsRetrieved > MAX_PERCENT_SYMBOLS_NOT_PARSED) {
            this.warnings.push({
                dataName: [
                    HANDS_TABLE.name,
                    MOVEMENT_TABLE.name,
                    DYNAMICS_TABLE.name,
                    HEAD_AND_FACES_TABLE.name,
                    BODY_TABLE.name,
                ].join(", "),
                dataType: DataType.TABLE,
                message: `Unable to parse number or unicode characters for more than ${MAX_PERCENT_SYMBOLS_NOT_PARSED}% of SignWriting font glyphs`
            })
        } 
        // Identify category, symbol group, & base symbols
        const symbolsBestEfort = parsedSymbols.map(symbol => {
            return new SignWritingSymbol(symbol.glyph, symbol.character as string, symbol.number as number);
        });
        this.symbols = symbolsBestEfort.filter(symbol =>
            symbol.category && symbol.symbolGroup && symbol.baseSymbol
        );
        // Sort symbols by glyph index
        this.symbols.sort((a, b) => sortAscending(a.glyph.index, b.glyph.index));
        // TODO: Verify that the category, symbol group, & base symbol was determined for ALL symbols
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

    private getSymbolBestEffort(glyph: opentype.Glyph): ParsedSymbol {
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
        const handSymbols = this.getSymbolsWithCategory(SignWritingCategory.HANDS);
        const baseSymbols = this.getBaseSymbols(handSymbols);
        const hands: Hand[] = [];
        baseSymbols.forEach(baseSymbol => {
            // Fist Heel is the only handshape with a different pattern
            // https://www.signbank.org/iswa/204/204_bs.html
            const isFistHeel = baseSymbol === SignWritingBaseSymbol.FIST_HEEL;
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
                    symbol_group: symbol.symbolGroup,
                    base_symbol: symbol.baseSymbol,
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