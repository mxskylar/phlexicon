import { Table } from "../../src/db/table";
import { getSeperatedValueData } from "./parse-utils";

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
}