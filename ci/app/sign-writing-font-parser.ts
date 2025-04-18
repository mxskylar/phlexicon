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
}

export class SignWritingFontParser implements DataParser {
    warnings: DataWarning[] = [];
    private alphabets: Alphabet[] = [];
    private font: opentype.Font;

    constructor(
        alphabetFilePath: string,
        fontFilePath: string,
        dictNameDialectIdMap: {[index: string]: string}
    ) {
        // Parse SignWriting alphabets
        const rawAlphabetData: RawAlphabetData[] = getJsonData(alphabetFilePath);
        rawAlphabetData.forEach(alphabet => {
            this.alphabets.push({
                dialectId: dictNameDialectIdMap[alphabet.name],
                symbolTree: alphabet.data
            });
        });
        // Parse SignWriting font
        const fontFileBuffer = fs.readFileSync(fontFilePath);
        const toArrayBuffer = (buffer: Buffer): ArrayBuffer => {
            const arrayBuffer = new ArrayBuffer(buffer.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < buffer.length; i++) {
                view[i] = buffer[i];
            }
            return arrayBuffer;
        };
        this.font = opentype.parse(toArrayBuffer(fontFileBuffer));
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

    public getSymbols(): SignWritingSymbol[] {
        console.log("Parsing SignWriting symbols...");
        const charactersBestEffort = Object.values(this.font.glyphs.glyphs)
            .map(glyph => this.getUnicodeCharacter(glyph));
        // Using two filters here to make TypeScript happy about the inferred types
        const characters = charactersBestEffort
            .filter(symbol => symbol !== null)
            .filter(symbol => symbol); // Ensure there are no blank strings, just in case
        // Log warning if not able to get unicode characters for too many glyphs
        const numGlyphs = charactersBestEffort.length;
        const numNotFound = numGlyphs - characters.length;
        const percentCharsRetrieved = getPercent(numNotFound, numGlyphs);
        console.log(`=> Retrieved unicode characters for ${percentCharsRetrieved}% (${numNotFound}/${numGlyphs}) of SignWriting font glyphs`);
        const MAX_PERCENT_CHARS_NOT_FOUND = 1;
        if (percentCharsRetrieved > MAX_PERCENT_CHARS_NOT_FOUND) {
            this.warnings.push({
                dataName: SIGN_WRITING_SYMBOLS_TABLE.name,
                dataType: DataType.TABLE,
                message: `Unable to retrieve unicode characters for more than ${MAX_PERCENT_CHARS_NOT_FOUND}% of SignWriting font glyphs`
            })
        }
        return characters.map(symbol => {
            return {symbol};
        });
    }
}