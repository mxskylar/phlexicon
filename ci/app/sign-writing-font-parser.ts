import * as fs from 'fs';
import opentype from 'opentype.js';
import { SIGN_WRITING_SYMBOLS_TABLE } from '../../src/db/tables';
import { SignWritingSymbol } from "../../src/phonemes/sign/sign-writing-symbol";
import { DataParser, DataType, DataWarning } from "./data-parser";
import { getJsonData, getPercent } from "./parse-utils";

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
    number: number | null,
    character: string | null
};

type Symbol = {
    glyph: opentype.Glyph,
    character: string
};

type SymbolMap = {[index: number]: Symbol};

export class SignWritingFontParser implements DataParser {
    warnings: DataWarning[] = [];
    private alphabets: Alphabet[] = [];
    private symbols: SymbolMap = {};

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

    private getGlyphNumber(glyph: opentype.Glyph): number | null {
        const match = glyph.name.match(/S(\d+)/);
        if (match) {
            try {
                return new Number(match[1]) as number;
            } catch (ex) {
                //console.log(`=> WARNING: Unable to get number of glyph ${glyph.name} due to exception:`);
                //console.log(ex);
            }
        } else {
            //console.log(`=> WARNING: Unable to extract number of glyph ${glyph.name}`);
        }
        return null;
    }

    private getUnicodeCharacter(glyph: opentype.Glyph): string | null {
        try {
           return String.fromCodePoint(glyph.unicode);
        } catch (ex) {
            //console.log(`=> WARNING: Unable to get unicode character for glyph ${glyph.name} due to exception:`);
            //console.log(ex);
        }
        return null;
    }

    private getSymbolBestEffort(glyph: opentype.Glyph): ParsedSymbol {
        return {
            glyph,
            number: this.getGlyphNumber(glyph),
            character: this.getUnicodeCharacter(glyph)
        }
    }

    private setSymbols(fontFilePath: string): void {
        console.log(`Parsing: ${fontFilePath}`);
        const font = this.getFont(fontFilePath);
        const parsedSymbolsBestEffort = Object.values(font.glyphs.glyphs)
            .map(glyph => this.getSymbolBestEffort(glyph));
        const parsedSymbols = parsedSymbolsBestEffort
            .filter(symbol => symbol.number && symbol.character);
        // Log warning if not able to get numbers and unicode characters for too many glyphs
        const numGlyphs = parsedSymbolsBestEffort.length;
        const numNotFound = numGlyphs - parsedSymbols.length;
        const percentCharsRetrieved = getPercent(numNotFound, numGlyphs);
        console.log(`=> Retrieved numbers and unicode characters for ${percentCharsRetrieved}% (${numNotFound}/${numGlyphs}) of SignWriting font glyphs`);
        const MAX_PERCENT_SYMBOLS_NOT_PARSED = 2;
        if (percentCharsRetrieved > MAX_PERCENT_SYMBOLS_NOT_PARSED) {
            this.warnings.push({
                dataName: SIGN_WRITING_SYMBOLS_TABLE.name,
                dataType: DataType.TABLE,
                message: `Unable to retrieve numbers or unicode characters for more than ${MAX_PERCENT_SYMBOLS_NOT_PARSED}% of SignWriting font glyphs`
            })
        }
        parsedSymbols.forEach(symbol => {
            this.symbols[symbol.number as number] = {
                glyph: symbol.glyph,
                character: symbol.character as string
            };
        });
    }

    public getSymbols(): SignWritingSymbol[] {
        return Object.values(this.symbols).map(symbol => {
            return {
                symbol: symbol.character
            }
        })
    }
}