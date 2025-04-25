import * as os from 'os';
import { Consonant, ConsonantAttribute } from "../../../src/phonemes/spoken/consonant";
import { Vowel, VowelAttribute } from "../../../src/phonemes/spoken/vowel";
import { DataParser, DataType, DataWarning } from '../data-parser';
import { getUniqueValues, getPercent } from "../parse-utils";
import { CONSONANTS_TABLE, VOWELS_TABLE } from '../../../src/db/tables';
import { IpaSymbol } from "../../../src/phonemes/spoken/ipa-symbol"
import { CONSONANT_ATTRIBUTES } from './consonant';
import { VOWEL_ATTRIBUTES } from './vowels';
import { getSeperatedValueData } from '../../utils';

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
    tableName: string,
    xAxis: RawDataAxis,
    yAxis: RawDataAxis
};

type Attributes = {
    isRange: boolean,
    values: string[]
};

const VOWEL: PhonemeType = {
    name: PhonemeName.VOWEL,
    tableName: VOWELS_TABLE.name,
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
            "advanced-back": [VowelAttribute.BACK],
            back: [VowelAttribute.BACK],
            "retracted-back": [VowelAttribute.BACK]
        },
        otherColumnMapping: {
            rounded: [VowelAttribute.ROUNDED],
            palatal: [VowelAttribute.PALATAL],
            labiovelar: [VowelAttribute.LABIOVELAR]
        },
        ignored: ["unrounded", "advanced"],
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
        ignored: ["raised"],
        attributes: VOWEL_ATTRIBUTES.yAxis.attributes,
        otherAttributes: VOWEL_ATTRIBUTES.yAxis.otherAttributes
    }
};

const CONSONANT = {
    name: PhonemeName.CONSONANT,
    tableName: CONSONANTS_TABLE.name,
    xAxis: {
        category: "place",
        columnMapping: {
            bilabial: [ConsonantAttribute.BILABIAL],
            labiodental: [ConsonantAttribute.LABIODENTAL],
            dental: [ConsonantAttribute.DENTAL],
            interdental: [ConsonantAttribute.DENTAL],
            prevelar: [ConsonantAttribute.ALVEOLAR],
            labiovelar: [ConsonantAttribute.ALVEOLAR],
            alveolar: [ConsonantAttribute.ALVEOLAR],
            "laminal-alveolar": [ConsonantAttribute.ALVEOLAR],
            alveolopalatal: [ConsonantAttribute.ALVEOLAR, ConsonantAttribute.PALATAL],
            palatoalveolar: [ConsonantAttribute.ALVEOLAR, ConsonantAttribute.PALATAL],
            "advanced-alveolar": [ConsonantAttribute.ALVEOLAR],
            postalveolar: [ConsonantAttribute.POSTALVEOLAR],
            postvelar: [ConsonantAttribute.POSTALVEOLAR],
            "laminal-postalveolar": [ConsonantAttribute.POSTALVEOLAR],
            retroflex: [ConsonantAttribute.RETROFLEX],
            palatal: [ConsonantAttribute.PALATAL],
            labiopalatal: [ConsonantAttribute.PALATAL],
            velar: [ConsonantAttribute.VELAR],
            uvular: [ConsonantAttribute.UVULAR],
            pharyngeal: [ConsonantAttribute.PHARYNGEAL],
            epiglottal: [ConsonantAttribute.EPIGLOTTAL],
            glottal: [ConsonantAttribute.GLOTTAL]
        },
        otherColumnMapping: {},
        ignored: [
            "lateral",
            "retroflex-lateral",
            "laminal-lateral",
            "advanced-lateral",
            "central",
            "placeless",
            "retracted",
            "unrounded",
            "central"
        ],
        attributes: CONSONANT_ATTRIBUTES.xAxis.attributes,
        otherAttributes: CONSONANT_ATTRIBUTES.xAxis.otherAttributes
    },
    yAxis: {
        category: "manner",
        columnMapping: {
            nasal: [ConsonantAttribute.NASAL],
            affricate: [ConsonantAttribute.AFFRICATE],
            "implosive-affricate": [ConsonantAttribute.AFFRICATE],
            fricative: [ConsonantAttribute.FRICATIVE],
            approximant: [ConsonantAttribute.APPROXIMANT],
            "lax-approximant": [ConsonantAttribute.APPROXIMANT],
            "low-approximant": [ConsonantAttribute.APPROXIMANT],
            "mid-approximant": [ConsonantAttribute.APPROXIMANT],
            "lateral-approximant": [ConsonantAttribute.LATERAL_APPROXIMANT],
            flap: [ConsonantAttribute.FLAP],
            trill: [ConsonantAttribute.TRILL],
            implosive: [ConsonantAttribute.IMPLOSIVE],
            stop: [ConsonantAttribute.STOP],
            "lateral-stop": [ConsonantAttribute.LATERAL_STOP],
            click: [ConsonantAttribute.CLICK]
        },
        otherColumnMapping: {glide: [ConsonantAttribute.GLIDE]},
        ignored: [
            "high",
            "ejective",
            "nasal-spirant"
        ],
        attributes: CONSONANT_ATTRIBUTES.yAxis.attributes,
        otherAttributes: CONSONANT_ATTRIBUTES.yAxis.otherAttributes
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

export class IpaParser implements DataParser {
    warnings: DataWarning[] = [];
    private rawData: RawData[];

    constructor(filePath: string){
        console.log(`Parsing: ${filePath}`);
        const rawData = getSeperatedValueData(
            filePath,
            // This is necessary because an invalid row has an additional column
            {relax_column_count: true}
        );
        // Correct invalid row with an additional column
        const INVALID_INDEX = 1781;
        const invalidRow = rawData[INVALID_INDEX];
        if (invalidRow.chart === "") {
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
        } else {
            this.warnings.push({
                dataName: filePath,
                dataType: DataType.FILE,
                message: `Data in CSV row ${INVALID_INDEX + 1} different than expected. `
                    + "The format of this row was previously invalid because it contained an extra column, "
                    + "which made the 'chart' column blank. This is no longer the case. "
                    + "Verify if the row's format still requires a hardcoded fix."
            });
        }
        this.rawData = rawData;
    }

    public getOtherSymbols(): IpaSymbol[] {
        console.log("Parsing other IPA symbols...")
        return this.rawData.filter(rawRow => 
            !Object.values(PhonemeName).map(name => name.valueOf()).includes(rawRow.chart)
        ).map(rawRow => {
            return {symbol: rawRow.ipa};
        });
    }

    private parseAttributes(rawString: string): Attributes {
        const values: string[] = [];
        const attribute = {
            values,
            isRange: false
        };
        rawString.split("_")
            .map(str => {
                const nestedValues = str.split("-to-");
                attribute.isRange = nestedValues.length > 1;
                return nestedValues;
            })
            .forEach(nestedValues => {
                nestedValues.forEach(value => attribute.values.push(value));
            });
        return attribute;
    }

    private verifyAttributeParsing(
        axis: RawDataAxis,
        data: string[][],
        tableName: string
    ): void {
        const attributesAccountedFor = Object.keys({...axis.otherColumnMapping, ...axis.columnMapping})
            .concat(axis.ignored);
        const allAttributes: string[] = [];
        data.forEach(row => {
            row.forEach(value => allAttributes.push(value));
        });
        const uniqueAttributeValues = getUniqueValues(allAttributes);
        const invalidAttributes = attributesAccountedFor
            .filter(attribute => !uniqueAttributeValues.includes(attribute));
        const getWarningMessage = (prefix: string, attributes: string[]) => {
            return `${prefix}: ${os.EOL}- ${attributes.join(`${os.EOL}- `)}`;
        }
        if (invalidAttributes.length > 0) {
            this.warnings.push({
                dataName: tableName,
                dataType: DataType.TABLE,
                message: getWarningMessage(
                    `Invalid ${axis.category} attributes were defined`,
                    invalidAttributes
                )
            });
        }
        const ignoredAttributes = uniqueAttributeValues
            .filter(attribute =>
                !attributesAccountedFor.includes(attribute) && attribute !== "" && attribute !== "to"
            );
        if (ignoredAttributes.length > 0) {
            this.warnings.push({
                dataName: tableName,
                dataType: DataType.TABLE,
                message: getWarningMessage(
                    `These ${axis.category} attribute were ignored in the raw data`,
                    ignoredAttributes
                )
            });
        }
    }

    private getAttributeRows(
        rawRows: Attributes[],
        columnMapping: {[index: string]: string[]},
        columnNames: string[]
    ): {[index: string]: string}[] {
        return rawRows
            .map(attributes => {
                return {
                    isRange: attributes.isRange,
                    values: attributes.values.filter(value => columnMapping.hasOwnProperty(value))
                }
            })
            .map(attributes => {
                const flags: string[] = [];
                attributes.values.forEach(value => {
                    columnMapping[value].forEach(flag => flags.push(flag));
                });
                return {
                    isRange: attributes.isRange,
                    values: flags
                };
            })
            .map(attributes => {
                if (attributes.isRange) {
                    const positions = attributes.values.map(flag => columnNames.indexOf(flag));
                    const start = Math.min(...positions);
                    const end = Math.max(...positions);
                    const row = {};
                    columnNames.forEach((columnName, i) => {
                        row[columnName] = i >= start || i <= end;
                    });
                    return row;
                }
                const row = {};
                columnNames.forEach(columnName => {
                    row[columnName] = attributes.values.includes(columnName);
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
        axis: RawDataAxis,
        tableName: string
    ): {[index: string]: string}[] {
        const rawRows = rawData.map(row => this.parseAttributes(row[rawColumnName]));
        this.verifyAttributeParsing(axis, rawRows.map(rawRow => rawRow.values), tableName);
        return this.mergeObjectArrays(
            this.getAttributeRows(rawRows, axis.columnMapping, axis.attributes),
            this.getAttributeRows(rawRows, axis.otherColumnMapping, axis.otherAttributes)
        );
    }

    private validateAttributeFrequency(
        attributes: string[],
        rows: Vowel[] | Consonant[],
        logPrefix: string,
        tableName: string,
        warnIfAllTrueIsLow: boolean = false
    ): void {
        // Calculate percent true of each attribute
        const counts = {};
        attributes.forEach(attribute => counts[attribute] = 0);
        rows.forEach(row =>{
            attributes.forEach(attribute => {
                if (row[attribute]) {
                    counts[attribute] = counts[attribute] + 1;
                }
            });
        });
        const total = rows.length;
        Object.keys(counts).forEach(attribute => {
            const count = counts[attribute];
            const percent = getPercent(count, total);
            if (count <= 0) {
                this.warnings.push({
                    dataName: tableName,
                    dataType: DataType.TABLE,
                    message: `No rows where column ${attribute} is true`
                });
            }
            const MAX_PERCENT = 50;
            if (percent > MAX_PERCENT) {
                this.warnings.push({
                    dataName: tableName,
                    dataType: DataType.TABLE,
                    message: `Column ${attribute} is true over ${MAX_PERCENT}% of the time`
                });
            }
            console.log(`==> [${logPrefix}] ${attribute}: ${count}/${total} = ${percent}%`);
        });

        // Calculate percent where all attributes are true
        let numAllTrue = 0;
        rows.forEach(row =>{
            for (const i in attributes) {
                if (row[attributes[i]]) {
                    numAllTrue++;
                    break;
                }
            }
        });
        if (attributes.length > 1) {
            const allTruePercent = getPercent(numAllTrue, total);
            console.log(`==> [${logPrefix}] ALL TRUE: ${numAllTrue}/${total} = ${allTruePercent}%`);
            const MIN_ALL_TRUE_PERCENT = 90;
            if (warnIfAllTrueIsLow && allTruePercent < MIN_ALL_TRUE_PERCENT) {
                this.warnings.push({
                    dataName: tableName,
                    dataType: DataType.TABLE,
                    message: `Less than ${MIN_ALL_TRUE_PERCENT}% of ${logPrefix.toLowerCase()} rows are all true`
                });
            }
        }
    }

    private validatePhonemeTypeRows(
        phonemeType: PhonemeType,
        rows: Vowel[] | Consonant[]
    ) {
        const {name, xAxis, yAxis, tableName} = phonemeType;
        console.log(`=> Percentages ${name} attributes are true...`);
        this.validateAttributeFrequency(xAxis.attributes, rows, `${name.toUpperCase()} X-AXIS`, tableName, true);
        this.validateAttributeFrequency(xAxis.otherAttributes, rows, `${name.toUpperCase()} X-AXIS QUALITY`, tableName);
        this.validateAttributeFrequency(yAxis.attributes, rows, `${name.toUpperCase()} Y-AXIS`, tableName, true);
        this.validateAttributeFrequency(yAxis.otherAttributes, rows, `${name.toUpperCase()} Y-AXIS QUALITY`, tableName);
    }

    private getPhonemeTypeRows(phonemeType: PhonemeType): Vowel[] | Consonant[] {
        const {name, xAxis, yAxis} = phonemeType;
        console.log(`Parsing ${name} in IPA...`);
        const data: RawData[] = this.rawData.filter(rawRow => rawRow.chart === name);
        const attributeRows = this.mergeObjectArrays(
            this.parseAxis(data, "place/color", xAxis, phonemeType.tableName),
            this.parseAxis(data, "height/manner", yAxis, phonemeType.tableName)
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
        const rows = Object.keys(symbolAttributes).map(symbol => {
            return {
                symbol,
                ...symbolAttributes[symbol]
            }
        });
        // Validate a reaonsable percentage of each attribute is true
        this.validatePhonemeTypeRows(phonemeType, rows);
        return rows;
    }

    public getVowels(): Vowel[] {
        return this.getPhonemeTypeRows(VOWEL) as Vowel[];
    }

    public getConsonants(): Consonant[] {
        return this.getPhonemeTypeRows(CONSONANT) as Consonant[];
    }
}