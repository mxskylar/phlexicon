import { SpokenDialect, SpokenDialectPhoneme } from "../../src/db/tables";
import { getSeperatedValueData, getUniqueValues } from "./parse-utils";

type RawData = {
    language: string,
    langcode: string,
    family: string,
    location: string,
    'core inventory': string,
    'marginal inventory': string,
    reference: string
};

export class SpokenDialectParser {
    private rawData: RawData[]

    constructor(rawDataFilePath: string) {
        this.rawData = getSeperatedValueData(rawDataFilePath, {delimiter: "\t"});
    }

    public getDialects(): SpokenDialect[] {
        console.log("Parsing spoken dialects");
        return this.rawData.map(dialect => {
            return {
                id: dialect.langcode,
                name: dialect.language
            }
        });
    }

    public getDialectPhonemes(): SpokenDialectPhoneme[] {
        console.log("Parsing spoken dialect phonemes");
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