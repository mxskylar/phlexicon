import * as os from 'os';
import { Vowel, VowelAttribute } from "../../src/db/tables";
import { getSeperatedValueData, getUniqueValues } from "./parse-utils";
import { COLOR_COLUMN_MAP, HEIGHT_COLUMN_MAP } from './vowel-constants';

export class IpaParser {
    private rawData: {
        non_ipa: string,
        ipa: string,
        chart: string,
        "height/manner": string,
        "place/color": string,
        misc1: string,
        misc2: string
    }[];

    constructor(rawDataFilePath: string){
        const rawData = getSeperatedValueData(
            rawDataFilePath,
            // This is necessary because an invalid row has an additional column
            {relax_column_count: true}
        );
        // Correct invalid row with an additional column
        const INVALID_INDEX = 1781;
        const invalidRow = rawData[INVALID_INDEX];
        rawData[INVALID_INDEX] = {
            non_ipa: invalidRow.non_ipa,
            ipa: invalidRow.ipa,
            chart: invalidRow["height/manner"],
            "height/manner": invalidRow["place/color"],
            "place/color": invalidRow.misc1,
            misc1: invalidRow.misc2,
            // These happen to be the same value
            // That said, the CSV parser ignores the additional column
            // when options.columns is true
            misc2: invalidRow.misc2
        };
        this.rawData = rawData;
    }

    private parseAttributes(rawString: string): string[] {
        let attributes: string[] = [];
        rawString.split("_")
            .map(str => str.split("-to-"))
            .forEach(a => {
                attributes = attributes.concat(a);
            });
        return attributes;
    }

    private logAttributeAccuracy(
        attributeName: string,
        data: {[index: string]: string | string[]}[], // attributeName must be a key to a string[] value
        valueColumnMap: {[index: string]: string[]},
        otherAttributesAccountedFor: string[] = []
    ): void {
        const attributesAccountedFor = Object.keys(valueColumnMap)
            .concat(otherAttributesAccountedFor);
        let allAttributes: string[] = [];
        data.map(row => row[attributeName]).forEach(row => {
            allAttributes = allAttributes.concat(row);
        });
        const uniqueAttributeValues = getUniqueValues(allAttributes);
        const invalidAttributes = attributesAccountedFor
            .filter(attribute => !uniqueAttributeValues.includes(attribute));
        console.log(
            invalidAttributes.length > 0
                ? `=> Invalid ${attributeName} attributes were defined: ${os.EOL}- ${invalidAttributes.join(`${os.EOL}- `)}`
                : `=> All defined ${attributeName} attributes were valid!`
        );
        const ignoredAttributes = uniqueAttributeValues
            .filter(attribute => !attributesAccountedFor.includes(attribute));
        console.log(
            ignoredAttributes.length > 0
                ? `=> Ignoring unrecognized ${attributeName} attributes: ${os.EOL}- ${ignoredAttributes.join(`${os.EOL}- `)}`
                : `=> All ${attributeName} attributes recognized!`
        );
}

    public getVowels(): Vowel[] {
        console.log("Parsing vowels...");
        const parsedData = this.rawData
            .filter(row => row.chart === "vowel")
            .map(row => {
                return {
                    symbol: row.ipa,
                    color: this.parseAttributes(row["place/color"]),
                    height: this.parseAttributes(row["height/manner"])
                }
            });
        this.logAttributeAccuracy("color", parsedData, COLOR_COLUMN_MAP, ["unrounded"]);
        this.logAttributeAccuracy("height", parsedData, HEIGHT_COLUMN_MAP);
        // TODO: Set column flag to true for all attributes maped to string value,
        // As well as all column flags within a rang of attributes both set to true
        // Concat the lists pulled from the maps above to the parsed attributes,
        // Then get the range by pulling the max & min of the resulting list
        return [];
    }
}