import { DataParser, DataWarning } from "../data-parser";
import { getJsonData } from "../parse-utils";
import { SignPhoneme } from "../../../src/phonemes/sign/sign-phoneme";

type Alphabet = {
    name: string,
    "last-modified": string,
    data: {[index: string]: string[]}
};

export class SignPhonemeParser implements DataParser {
    warnings: DataWarning[] = [];
    private alphabets: Alphabet[];

    constructor(filePath: string) {
        console.log(`Parsing: ${filePath}`);
        this.alphabets = getJsonData(filePath);
    }

    public getPhonemes(): SignPhoneme[] {
        const phonemes: SignPhoneme[] = [];
        this.alphabets.forEach(alphabet => {
            const nameParts = alphabet.name.split("-");
            const isoCode = nameParts[0];
            const region = nameParts[1];
            Object.keys(alphabet.data).forEach(symbolGroup => {
                const block = alphabet.data[symbolGroup];
                block.forEach(baseSymol => phonemes.push({
                    base_symbol: baseSymol,
                    iso_code: isoCode,
                    region,
                }));
            });
        });
        return phonemes;
    }
}