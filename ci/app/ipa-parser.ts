import * as os from 'os';
import { Vowel, VOWEL_ATTRIBUTES, VowelAttribute } from "../../src/phonemes/spoken/vowel";
import { Consonant } from "../../src/phonemes/spoken/consonant"
import { getSeperatedValueData, getUniqueValues } from "./parse-utils";

enum PhonemeName {
    VOWEL = "vowel",
    CONSONANT = "consonant"
}

type RawDataAxis = {
    // Name the raw data gives for the attributes on or associated with the axis
    category: string,
    // Map values in raw data to columns in table
    columnMapping: {[index: string]: string[]}, // Mappings for attributes along axis
    otherColumnMapping: {[index: string]: string[]}, // Mappings for attributes associated with axis
    // Values in raw data that are accounted for by checking for another key
    // e.g. "unrounded" is ignored for vowels because the parser only checks for
    // the presece of the value "rounded"
    ignored: string[],
    // Ordered list of the attributes on the axis
    attributes: string[],
    // Attributes associated with axis but not directly on the axis
    otherAttributes: string[]
};

type PhonemeType = {
    name: PhonemeName,
    xAxis: RawDataAxis,
    yAxis: RawDataAxis
};

const VOWEL: PhonemeType = {
    name: PhonemeName.VOWEL,
    xAxis: {
        category: "color",
        columnMapping: {
            "advanced-front": [VowelAttribute.FRONT],
            front: [VowelAttribute.FRONT],
            "retracted-front": [VowelAttribute.FRONT],
            "centralized-front": [VowelAttribute.FRONT, VowelAttribute.CENTRAL],
            "advanced-central": [VowelAttribute.CENTRAL],
            central: [VowelAttribute.CENTRAL],
            "centralized-central": [VowelAttribute.CENTRAL],
            "retracted-central": [VowelAttribute.CENTRAL],
            "centralized-back": [VowelAttribute.CENTRAL, VowelAttribute.BACK],
            back: [VowelAttribute.BACK],
            "retracted-back": [VowelAttribute.BACK]
        },
        otherColumnMapping: {
            rounded: [VowelAttribute.ROUNDED],
            palatal: [VowelAttribute.PALATAL],
            labiovelar: [VowelAttribute.LABIOVELAR]
        },
        ignored: ["unrounded"],
        attributes: VOWEL_ATTRIBUTES.xAxis.attributes,
        otherAttributes: VOWEL_ATTRIBUTES.xAxis.otherAttributes
    },
    yAxis: {
        category: "height",
        columnMapping: {
            higher: [VowelAttribute.CLOSE],
            "raised-high": [VowelAttribute.CLOSE],
            high: [VowelAttribute.CLOSE],
            "lowered-lower-high": [VowelAttribute.NEAR_CLOSE],
            "lower-high": [VowelAttribute.NEAR_CLOSE],
            "lowered-high": [VowelAttribute.NEAR_CLOSE],
            "raised-lower-high": [VowelAttribute.NEAR_CLOSE],
            "raised-higher-mid": [VowelAttribute.CLOSE_MID],
            "higher-mid": [VowelAttribute.CLOSE_MID],
            "lowered-higher-mid": [VowelAttribute.CLOSE_MID],
            "raised-mid": [VowelAttribute.MID],
            mid: [VowelAttribute.MID],
            "raised-lower-mid": [VowelAttribute.OPEN_MID],
            "lower-mid": [VowelAttribute.OPEN_MID],
            "lowered-mid": [VowelAttribute.OPEN_MID],
            "lowered-lower-mid": [VowelAttribute.OPEN_MID],
            "raised-higher-low": [VowelAttribute.OPEN_MID],
            "higher-low": [VowelAttribute.NEAR_OPEN],
            "lowered-higher-low": [VowelAttribute.NEAR_OPEN],
            "raised-low": [VowelAttribute.OPEN],
            "low": [VowelAttribute.OPEN],
            "lowered-low": [VowelAttribute.OPEN],
            lower: [VowelAttribute.OPEN]
        },
        otherColumnMapping: {glide: [VowelAttribute.GLIDE]},
        ignored: [],
        attributes: VOWEL_ATTRIBUTES.yAxis.attributes,
        otherAttributes: VOWEL_ATTRIBUTES.yAxis.otherAttributes
    }
};

type RawData = {
    non_ipa: string,
    ipa: string,
    chart: string,
    "height/manner": string,
    "place/color": string,
    misc1: string,
    misc2: string
};

export class IpaParser {
    private rawData: RawData[];

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

    private verifyAttributeParsing(axis: RawDataAxis, data: string[][]): void {
        const attributesAccountedFor = Object.keys({...axis.otherColumnMapping, ...axis.columnMapping})
            .concat(axis.ignored);
        let allAttributes: string[] = [];
        data.forEach(row => {
            allAttributes = allAttributes.concat(row);
        });
        const uniqueAttributeValues = getUniqueValues(allAttributes);
        const invalidAttributes = attributesAccountedFor
            .filter(attribute => !uniqueAttributeValues.includes(attribute));
        console.log(
            invalidAttributes.length > 0
                ? `==> WARNING: Invalid ${axis.category} attributes were defined: ${os.EOL}- ${invalidAttributes.join(`${os.EOL}- `)}`
                : `==> All defined ${axis.category} attributes were valid!`
        );
        const ignoredAttributes = uniqueAttributeValues
            .filter(attribute => !attributesAccountedFor.includes(attribute));
        console.log(
            ignoredAttributes.length > 0
                ? `==> WARNING: Ignoring unrecognized ${axis.category} attributes: ${os.EOL}- ${ignoredAttributes.join(`${os.EOL}- `)}`
                : `==> All ${axis.category} attributes recognized!`
        );
    }

    private getAttributeRows(
        rawRows: string[][],
        columnMapping: {[index: string]: string[]},
        columnNames: string[],
        isRange: boolean = false
    ): {[index: string]: string}[] {
        const flagRows = rawRows
            .map(rawRow => rawRow.filter(
                rawValue => columnMapping.hasOwnProperty(rawValue)
            ))
            .map(rawRow => {
                let flags: string[] = [];
                rawRow.forEach(rawValue => {
                    flags = flags.concat(columnMapping[rawValue]);
                });
                return flags;
            });
        if (isRange) {
            return flagRows.map(flags => {
                const positions = flags.map(flag => columnNames.indexOf(flag));
                const start = Math.min(...positions);
                const end = Math.max(...positions);
                const row = {};
                columnNames.forEach((columnName, i) => {
                    row[columnName] = i >= start || i <= end;
                });
                return row;
            })
        }
        return flagRows.map(flags => {
            const row = {};
            columnNames.forEach(columnName => {
                row[columnName] = flags.includes(columnName);
            });
            return row;
        });
    }

    private mergeObjectArrays(arr1: {}[], arr2: {}[]): {[index: string]: string}[] {
        return arr1.map((obj1, i) => {
            return {...obj1, ...arr2[i]}
        });
    }

    private parseAxis(
        rawData: RawData[],
        rawColumnName: string,
        axis: RawDataAxis
    ): {[index: string]: string}[] {
        console.log(`=> Parsing ${axis.category} rows...`);
        const rawRows = rawData.map(row => this.parseAttributes(row[rawColumnName]));
        this.verifyAttributeParsing(axis, rawRows);
        return this.mergeObjectArrays(
            this.getAttributeRows(rawRows, axis.columnMapping, axis.attributes, true),
            this.getAttributeRows(rawRows, axis.otherColumnMapping, axis.otherAttributes)
        );
    }

    private getAttributes(phonemeType: PhonemeType): Vowel[] | Consonant[] {
        const {name: name, xAxis, yAxis} = phonemeType;
        console.log(`Parsing ${name} attributes...`);
        const data: RawData[] = this.rawData.filter(rawRow => rawRow.chart === name);
        const attributeRows = this.mergeObjectArrays(
            this.parseAxis(data, "place/color", xAxis),
            this.parseAxis(data, "height/manner", yAxis)
        );
        const nonUniqueRows = this.mergeObjectArrays(
            data.map(rawRow => {
                return {symbol: rawRow.ipa}
            }),
            attributeRows
        );
        // De-duplicate rows
        const symbolAttributes = {}
        nonUniqueRows.forEach(row => {
            symbolAttributes[row.symbol] = {};
        });
        nonUniqueRows.forEach(row => {
            const {symbol} = row;
            const attributes = symbolAttributes[symbol]
            Object.keys(row).forEach(attribute => {
                if (!attributes.hasOwnProperty(attribute) || !attribute[attribute]) {
                    attributes[attribute] = row[attribute];
                }
            });
        });
        return Object.keys(symbolAttributes).map(symbol => {
            return {
                symbol,
                ...symbolAttributes[symbol]
            }
        })
    }

    public getVowels(): Vowel[] {
        return this.getAttributes(VOWEL) as Vowel[];
    }

    public getOtherSymbols(): {[index: string]: string}[] {
        return this.rawData.filter(rawRow => 
            !Object.values(PhonemeName).map(name => name.valueOf()).includes(rawRow.chart)
        ).map(rawRow => {
            return {symbol: rawRow.ipa};
        });
    }
}