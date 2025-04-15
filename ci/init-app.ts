import * as fs from 'fs';
import { recreateDirectory } from './utils';
import {
    INSTALLED_RESOURCES_DIR,
    UNZIPPED_PBASE_FILES_DIR
} from './install-constants';
import { Database } from '../src/db/database';
import { Table } from '../src/db/table';
import {
    BasicColumn,
    BasicType,
    LengthColumn,
    LengthType
} from '../src/db/column';
import { ForeignKey } from '../src/db/foreign-key';
import {
    DIALECTS_TABLE,
    EXTRA_IPA_SYMBOLS_TABLE,
    IPA_PHONEMES_TABLE
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

// DIALECTS
const spokenDialectData = await getSeperatedValueData(
    `${UNZIPPED_PBASE_FILES_DIR}/pb_languages.csv`,
    true,
    {delimiter: "\t"}
);

db.createTable(DIALECTS_TABLE);
const spokenDialectRows = spokenDialectData.map(row => [row[0], DialectType.SPOKEN]);
db.insertRows(DIALECTS_TABLE, spokenDialectRows);

const isoCode = new LengthColumn("code", LengthType.CHAR, 3, true, true);
const isoLanguages = new Table(
    "iso_languages",
    isoCode,
    new LengthColumn("name", LengthType.VARCHAR, 75, true)
);
db.createTable(isoLanguages);

const signDialects = new Table(
    "sign_dialects",
    new LengthColumn("iso_code", LengthType.CHAR, 3, true, true, new ForeignKey(isoLanguages, isoCode)),
    new BasicColumn("region", BasicType.STRING, true, true)
);
db.createTable(signDialects);

// IPA SYMBOLS
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

const SPOKEN_PHONEME_TYPES = ["vowel", "consonant"];

db.createTable(IPA_PHONEMES_TABLE);
const ipaPhonemeValues = ipaSymbolData.filter(row => SPOKEN_PHONEME_TYPES.includes(row[2]))
    .map(row => row[1])
const uniqueIpaPhonemes = [...new Set(ipaPhonemeValues)];
db.insertRows(IPA_PHONEMES_TABLE, uniqueIpaPhonemes.map(value => [value]));

db.createTable(EXTRA_IPA_SYMBOLS_TABLE);
const extraIpaSymbolRows = ipaSymbolData.filter(row => !SPOKEN_PHONEME_TYPES.includes(row[2]))
    .map(row => [row[1]]);
db.insertRows(EXTRA_IPA_SYMBOLS_TABLE, extraIpaSymbolRows);

// SIGN WRITING SYMBOLS

// PHONEMES
const spokenPhonemeRows: Array<Array<string>> = [];
spokenDialectData.forEach(row => {
    const dialect = row[0];
    const phonemes = row[4].split(",")
        .concat(row[5].split(","))
        .filter(phoneme => phoneme !== "");
    phonemes.forEach(phoneme => {
        spokenPhonemeRows.push([dialect, phoneme]);
    });
});

/*aconst runQueriesFromFile = filePath => {
    const queries = fs.readFileSync(filePath).toString();
    console.log(`Running queries in ${filePath}`);
    db.exec(queries);
};

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
);

// Insert data for sign languages
await insertRowsFromJsonFile("sign_dialects", SIGN_LANGUAGES_FILE_PATH);

// Create tables built from custom queries and drop tables that do not need to be bundled with applicatino
runQueriesFromFile(`${DB_DIR}/etl.sql`);*/

db.close();