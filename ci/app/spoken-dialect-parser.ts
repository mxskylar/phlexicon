import { Table } from "../../src/db/table";
import { getSeperatedValueData, getUniqueValues } from "./parse-utils";

export class SpokenDialectParser {
    private rawData: {
        language: string,
        langcode: string,
        family: string,
        location: string,
        'core inventory': string,
        'marginal inventory': string,
        reference: string
    }[]

    constructor(rawDataFilePath: string) {
        this.rawData = getSeperatedValueData(rawDataFilePath, {delimiter: "\t"});
    }

    public getDialects(): {
        id: string,
        name: string
    }[] {
        return this.rawData.map(dialect => {
            return {
                id: dialect.langcode,
                name: dialect.language
            }
        });
    }

    public getDialectPhonemes(): {
        dialect_id: string,
        symbol: string
    }[] {
        const dialectPhonemes: {dialect_id: string, symbol: string}[] = [];
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