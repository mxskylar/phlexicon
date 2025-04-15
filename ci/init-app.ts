import * as fs from 'fs';
import { recreateDirectory } from './utils';
import {
    INSTALLED_RESOURCES_DIR,
    UNZIPPED_PBASE_FILES_DIR
} from './install-constants';
import { Database } from '../src/db/database';
import {
    SPOKEN_DIALECTS_TABLE,
    OTHER_IPA_SYMBOLS_TABLE,
    IPA_PHONEME_SYMBOLS_TABLE,
    SPOKEN_DIALECT_PHONEMES_TABLE,
    VOWELS_TABLE,
    CONSONANTS_TABLE
} from '../src/db/tables';
import { CONSONANT_MANNER_ATTRIBUTES, CONSONANT_PLACE_ATTRIBUTES, getSeperatedValueData, IpaPhonemeTypes, SPECIFIC_CONSONANT_MANNER_ATTRIBUTES, VOWEL_X_AXIS_ATTRIBUTES, VOWEL_Y_AXIS_ATTRIBUTES } from './data-utils'
import { DialectType } from '../src/db/column-enums';

// BUILD DIRECTORY
const BUILD_DIR = "build";
recreateDirectory(BUILD_DIR);

console.log(`Copying contents of ${INSTALLED_RESOURCES_DIR} to ${BUILD_DIR}`);
fs.cpSync(INSTALLED_RESOURCES_DIR, BUILD_DIR, {recursive: true});

const CUSTOM_RESOURCES_DIR = "custom-resources";
console.log(`Copying contents of ${CUSTOM_RESOURCES_DIR} to ${BUILD_DIR}`);
fs.cpSync(CUSTOM_RESOURCES_DIR, BUILD_DIR, {recursive: true});

const DATABASE_FILE_PATH = `${BUILD_DIR}/phlexicon.db`;
console.log(`Creating database: ${DATABASE_FILE_PATH}`);
const db = new Database(DATABASE_FILE_PATH);

// SPOKEN DIALECTS
const spokenDialectData = await getSeperatedValueData(
    `${UNZIPPED_PBASE_FILES_DIR}/pb_languages.csv`,
    true,
    {delimiter: "\t"}
);

db.createTable(SPOKEN_DIALECTS_TABLE);
const spokenDialectRows = spokenDialectData.map(row => [row[0], DialectType.SPOKEN]);
db.insertRows(SPOKEN_DIALECTS_TABLE, spokenDialectRows);

// IPA Symbols
const rawIpaSymbolData = await getSeperatedValueData(
    `${UNZIPPED_PBASE_FILES_DIR}/seg_convert.csv`,
    true,
    {relax_column_count: true}
);

// Correct invalid row in CSV that has an additonal blank column
const INVALID_IPA_SYMBOL_INDEX = 1781;
const invalidIpaSymbolRow = rawIpaSymbolData[INVALID_IPA_SYMBOL_INDEX];
const correctedIpaSymbolRow = invalidIpaSymbolRow.slice(0, 2)
    .concat(invalidIpaSymbolRow.slice(3));
const ipaSymbolData = rawIpaSymbolData.slice(0, INVALID_IPA_SYMBOL_INDEX)
    .concat([correctedIpaSymbolRow])
    .concat(rawIpaSymbolData.slice(INVALID_IPA_SYMBOL_INDEX + 1));

// IPA phoneme symbols
const SPOKEN_PHONEME_TYPES = Object.values(IpaPhonemeTypes).map(val => val.valueOf());
db.createTable(IPA_PHONEME_SYMBOLS_TABLE);
const ipaPhonemeSymbolValues = ipaSymbolData.filter(row => SPOKEN_PHONEME_TYPES.includes(row[2]))
    .map(row => row[1]);
const uniqueIpaPhonemeSymbols = [...new Set(ipaPhonemeSymbolValues)];
db.insertRows(IPA_PHONEME_SYMBOLS_TABLE, uniqueIpaPhonemeSymbols.map(value => [value]));

// Other IPA symbols
db.createTable(OTHER_IPA_SYMBOLS_TABLE);
const otherIpaSymbolRows = ipaSymbolData.filter(row => !SPOKEN_PHONEME_TYPES.includes(row[2]))
    .map(row => [row[1]]);
db.insertRows(OTHER_IPA_SYMBOLS_TABLE, otherIpaSymbolRows);

// Vowels & Consonants
const isSubType = (attribute: string, definedAttributes: string[]) => {
    for (const i in definedAttributes) {
        const definedAttribute = definedAttributes[i];
        if (attribute.includes(definedAttribute)) {
            return true;
        }
    }
    return false;
}

const getIpaAttributes = (
    attributeString: string,
    definedAttributes: string[],
    specificAttributes: string[] = []
): any[] => {
    let attributes: string[] = [];
    attributeString.split("_")
        .map(str => str.split("-to-"))
        .forEach(a => {
            attributes = attributes.concat(a);
        });
    return definedAttributes.map(attribute => {
        return attributes.includes(attribute) || (
            !specificAttributes.includes(attribute) && isSubType(attribute, definedAttributes)
        );
    });
}

const getIpaTypeRows = (
    ipaType: IpaPhonemeTypes,
    horizontalAttributes: string[],
    verticalAttributes: string[],
    specificHorizontalAttributes: string[] = [],
    specificVerticalAttributes: string[] = [],
): string[][] => {
    const rowsWithDuplicates = ipaSymbolData.filter(row => row[2] === ipaType)
        .map(row => [row[1]]
            .concat(getIpaAttributes(row[4], horizontalAttributes, specificHorizontalAttributes))
            .concat(getIpaAttributes(row[3], verticalAttributes, specificVerticalAttributes))
        );
    const uniqueRowMap = {};
    rowsWithDuplicates.forEach(row => {
        const symbol = row[0];
        if (uniqueRowMap.hasOwnProperty(symbol)) {
            for (let i = 1; i < row.length; i++) {
                const rowToMerge = uniqueRowMap[symbol];
                if (!rowToMerge[i]) {
                    rowToMerge[i] = row[i]
                }
            }
        } else {
            uniqueRowMap[symbol] = row;
        }
    });
    return Object.values(uniqueRowMap);
};

// Vowels
db.createTable(VOWELS_TABLE);
const vowelRows = getIpaTypeRows(
    IpaPhonemeTypes.VOWEL,
    VOWEL_X_AXIS_ATTRIBUTES,
    VOWEL_Y_AXIS_ATTRIBUTES
);
db.insertRows(VOWELS_TABLE, vowelRows);

// Consonants
db.createTable(CONSONANTS_TABLE);
const consonantRows = getIpaTypeRows(
    IpaPhonemeTypes.CONSONANT,
    CONSONANT_PLACE_ATTRIBUTES,
    CONSONANT_MANNER_ATTRIBUTES,
    [],
    SPECIFIC_CONSONANT_MANNER_ATTRIBUTES
);
db.insertRows(CONSONANTS_TABLE, consonantRows);

// The Phonemes of Spoken Dialects
db.createTable(SPOKEN_DIALECT_PHONEMES_TABLE);
const spokenPhonemeRows: Array<Array<string>> = [];
spokenDialectData.forEach(row => {
    const dialect = row[0];
    const phonemes = row[4].split(",")
        .concat(row[5].split(","))
        .filter(phoneme => phoneme !== "");
    const uniquePhonemes = [...new Set(phonemes)];
    uniquePhonemes.forEach(phoneme => {
        spokenPhonemeRows.push([dialect, phoneme]);
    });
});
db.insertRows(SPOKEN_DIALECT_PHONEMES_TABLE, spokenPhonemeRows);

// SIGN DIALECTS

// SignWriting Symbols

// Oriented Handshape Symbols

// Movement Symbols

// Location & Expression Symbols

// The Phonemes of Sign Dialects

/*
const insertRowsFromJsonFile = async (tableName, filePath) => {
    const {columns, rows} = JSON.parse(fs.readFileSync(filePath).toString());
    await insertRows(tableName, columns, rows);
}

// Insert data for ISO languages
await insertRowsFromSeperatedValueFile(
    "iso_languages",
    `${DATA_DIR}/${ISO_LANGUAGES_FILE}`,
    ["iso_code", null, null, null, null, null, "name", null],
    {delimiter: "\t"}
);

// Insert data into spoken languages
await insertRowsFromSeperatedValueFile(
    "tmp_spoken_phonemes",
    `${DATA_DIR}/${SPOKEN_PHONEMES_FILE}`,
    ["language_id", null, "iso_code", "language_variety", "dialect_description", null, "phoneme"],
    {},
    (value, i) => {
        // If dialect_description column is "NA"
        if (value === "NA" && i === 3) {
            return "NULL";
        }
        return false;
    }
);*/

db.close();