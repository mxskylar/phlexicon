import { DataParser, DataWarning } from "./data-parser";
import { getJsonData } from "./parse-utils";
import { SignWritingFontSymbol } from "./sign-writing-font-glyph";

type RawAlphabetData = {
    name: string,
    "last-modified": string,
    data: {[index: string]: string[]}
};

type Alphabet = {
    dialectId: string,
    symbolTree: {[index: string]: string[]}
};

export class SignPhonemeParser implements DataParser {
    warnings: DataWarning[] = [];
    private symbols: SignWritingFontSymbol[];
    private alphabets: Alphabet[] = [];

    constructor(
        symbols: SignWritingFontSymbol[],
        dictNameDialectIdMap: {[index: string]: string},
        filePath: string,
    ) {
        this.symbols = symbols;
        console.log(`Parsing: ${filePath}`);
        const rawAlphabetData: RawAlphabetData[] = getJsonData(filePath);
        rawAlphabetData.forEach(alphabet => {
            this.alphabets.push({
                dialectId: dictNameDialectIdMap[alphabet.name],
                symbolTree: alphabet.data
            });
        });
    }
}