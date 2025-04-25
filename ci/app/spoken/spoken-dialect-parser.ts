import { SpokenDialectPhoneme } from "../../../src/phonemes/spoken/spoken-phoneme";
import { DataParser, DataWarning } from "../data-parser";
import { getUniqueValues } from "../parse-utils";
import { SpokenDialect } from "../../../src/phonemes/spoken/spoken-dialect";
import { getSeperatedValueData } from "../../utils";

type RawData = {
    language: string,
    langcode: string,
    family: string,
    location: string,
    'core inventory': string,
    'marginal inventory': string,
    reference: string
};

export class SpokenDialectParser implements DataParser {
    warnings: DataWarning[] = [];
    private rawData: RawData[]

    constructor(filePath: string) {
        console.log(`Parsing: ${filePath}`);
        this.rawData = getSeperatedValueData(filePath, {delimiter: "\t"});
    }

    public getDialects(): SpokenDialect[] {
        console.log("Parsing spoken dialects...");
        return this.rawData.map(dialect => {
            return {
                id: dialect.langcode,
                name: dialect.language
            }
        });
    }

    public getDialectPhonemes(): SpokenDialectPhoneme[] {
        console.log("Parsing spoken dialect phonemes...");
        const dialectPhonemes: SpokenDialectPhoneme[] = [];
        this.rawData.forEach(row => {
            const phonemes = row['core inventory'].split(",")
                .concat(row['marginal inventory'].split(","))
                .filter(phoneme => phoneme !== "");
            getUniqueValues(phonemes).forEach(symbol => {
                dialectPhonemes.push({
                    dialect_id: row.langcode,
                    symbol
                });
            });
        });
        return dialectPhonemes;
    }
}