import * as fs from 'fs';
import opentype from 'opentype.js';
import { SIGN_WRITING_SYMBOLS_TABLE } from '../../src/db/tables';
import { CLOCKWISE_FINGER_DIRECTIONS, COUNTER_CLOCKWISE_FINGER_DIRECTIONS, PALM_DIRECTIONS } from '../../src/phonemes/sign/hands';
import { SignWritingCategory, SignWritingSymbol } from "../../src/phonemes/sign/sign-writing";
import { DataParser, DataType, DataWarning } from "./data-parser";
import { getJsonData, getPercent, sortAscending } from "./parse-utils";
import { SignWritingFontSymbol } from './sign-writing-font-glyph';

type RawAlphabetData = {
    name: string,
    "last-modified": string,
    data: {[index: string]: string[]}
};

type Alphabet = {
    dialectId: string,
    symbolTree: {[index: string]: string[]}
};

type ParsedSymbol = {
    glyph: opentype.Glyph,
    character: string | null,
    number: number | null,
};

export class SignWritingFontParser implements DataParser {
    warnings: DataWarning[] = [];
    private alphabets: Alphabet[] = [];
    private symbols: SignWritingFontSymbol[] = [];

    constructor(
        alphabetFilePath: string,
        dictNameDialectIdMap: {[index: string]: string},
        fontFilePath: string
    ) {
        this.setAlphabets(alphabetFilePath, dictNameDialectIdMap);
        this.setSymbols(fontFilePath);
    }

    private setAlphabets(
        alphabetFilePath: string,
        dictNameDialectIdMap: {[index: string]: string}
    ): void {
        console.log(`Parsing: ${alphabetFilePath}`);
        const rawAlphabetData: RawAlphabetData[] = getJsonData(alphabetFilePath);
        rawAlphabetData.forEach(alphabet => {
            this.alphabets.push({
                dialectId: dictNameDialectIdMap[alphabet.name],
                symbolTree: alphabet.data
            });
        });
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

    private setSymbols(fontFilePath: string): void {
        console.log(`Parsing: ${fontFilePath}`);
        const font = this.getFont(fontFilePath);
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
                dataName: SIGN_WRITING_SYMBOLS_TABLE.name,
                dataType: DataType.TABLE,
                message: `Unable to parse number or unicode characters for more than ${MAX_PERCENT_SYMBOLS_NOT_PARSED}% of SignWriting font glyphs`
            })
        } 

        parsedSymbols.forEach(symbol => {
            this.symbols.push(new SignWritingFontSymbol(
                symbol.glyph,
                symbol.character as string,
                symbol.number as number
            ));
        });
        // TODO: Verify that the category, symbol group, & base symbol was determined for ALL symbols

        // Sort symbols by glyph index
        this.symbols.sort((a, b) => sortAscending(a.glyph.index, b.glyph.index));
    }

    public getSymbols(): SignWritingSymbol[] {
        return this.symbols.map(symbol => {
            return {
                symbol: symbol.character
            }
        })
    }

    // https://www.signbank.org/iswa/cat_1.html
    public getHands() {
        const symbols = this.symbols.filter(symbol => symbol.category === SignWritingCategory.HANDS);
        const handshapes = symbols.map(symbol => {
            return {symbol: symbol.character}
        });
        let i = 0;
        while (i < handshapes.length) {
            const nextHandshape = i + 96;
            let p = 0;
            while (i < nextHandshape) {
                const nextPalmDirection = i + 16;
                let fingerDirections = COUNTER_CLOCKWISE_FINGER_DIRECTIONS;
                let isRightHanded = true;
                while (i < nextPalmDirection) {
                    const nextHand = i + 8;
                    let f = 0;
                    while (i < nextHand) {
                        handshapes[i]["palmDirection"] = PALM_DIRECTIONS[p];
                        handshapes[i]["fingerDirection"] = fingerDirections[f];
                        handshapes[i]["isRightHanded"] = isRightHanded;
                        f++;
                        i++;
                    }
                    fingerDirections = CLOCKWISE_FINGER_DIRECTIONS;
                    isRightHanded = false;
                }
                p++;
                // This extra check is necessary because the last handshape
                // does not have 96 characters: https://www.signbank.org/iswa/204/204_bs.html
                if (i >= handshapes.length) {
                    break;
                }
            }
        }
        return handshapes;
    }
}