import * as os from 'os';
import { Vowel, VOWEL_ATTRIBUTES, VowelAttribute } from "../../src/spoken/vowel";
import { getSeperatedValueData, getUniqueValues } from "./parse-utils";

enum PhonemeType {
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
    positions: string[]
};

type AttributeType = {
    name: PhonemeType,
    xAxis: RawDataAxis,
    yAxis: RawDataAxis
};

const VOWEL: AttributeType = {
    name: PhonemeType.VOWEL,
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
        positions: VOWEL_ATTRIBUTES.xAxis.attributes
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
        positions: VOWEL_ATTRIBUTES.yAxis.attributes
    }
};

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

    private verifyAttributeParsing(axis: RawDataAxis, data: string[][]): void {
        const attributesAccountedFor =
            Object.keys({...axis.otherColumnMapping, ...axis.columnMapping})
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
                ? `=> WARNING: Invalid ${axis.category} attributes were defined: ${os.EOL}- ${invalidAttributes.join(`${os.EOL}- `)}`
                : `=> All defined ${axis.category} attributes were valid!`
        );
        const ignoredAttributes = uniqueAttributeValues
            .filter(attribute => !attributesAccountedFor.includes(attribute));
        console.log(
            ignoredAttributes.length > 0
                ? `=> WARNING: Ignoring unrecognized ${axis.category} attributes: ${os.EOL}- ${ignoredAttributes.join(`${os.EOL}- `)}`
                : `=> All ${axis.category} attributes recognized!`
        );
}

    public getAttributes(type: AttributeType): {[index: string]: any}[] {
        const {name, xAxis, yAxis} = type;
        console.log(`Parsing ${name} attributes...`);
        const parsedData = this.rawData
            .filter(row => row.chart === PhonemeType.VOWEL)
            .map(row => {
                return {
                    symbol: row.ipa,
                    xAxis: this.parseAttributes(row["place/color"]),
                    yAxis: this.parseAttributes(row["height/manner"])
                }
            });
        this.verifyAttributeParsing(xAxis, parsedData.map(row => row.xAxis));
        this.verifyAttributeParsing(yAxis, parsedData.map(row => row.yAxis));
        // TODO: Set column flag to true for all attributes maped to string value,
        // As well as all column flags within a rang of attributes both set to true
        // Concat the lists pulled from the maps above to the parsed attributes,
        // Then get the range by pulling the max & min of the resulting list
        return [];
    }

    public getVowels(): Vowel[] {
        return this.getAttributes(VOWEL) as Vowel[];
    }
}