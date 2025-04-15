import * as fs from 'fs';
import { recreateDirectory } from './utils';
import {
    INSTALLED_RESOURCES_DIR,
    UNZIPPED_PBASE_FILES_DIR
} from './install-constants';
import { Database } from '../src/db/database';
import { Table } from '../src/db/table';
import {
    LengthColumn,
    LengthType
} from '../src/db/column';
import {
    SPOKEN_DIALECTS_TABLE,
    OTHER_IPA_SYMBOLS_TABLE,
    IPA_PHONEME_SYMBOLS_TABLE,
    SPOKEN_DIALECT_PHONEMES_TABLE
} from '../src/db/tables';
import { getSeperatedValueData } from './data-utils'
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
const SPOKEN_PHONEME_TYPES = ["vowel", "consonant"];
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

// Vowels

// Consonants

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