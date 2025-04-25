import * as fs from 'fs';
import { BUILD_DIR, DATABASE_FILE_PATH } from '../../src/build-constants';
import { Database } from '../../src/db/database';
import {
    CONSONANTS_TABLE,
    PALM_DIRECTIONS_TABLE,
    ROTATABLE_PALM_DIRECTIONS_TABLE,
    HANDS_TABLE,
    OTHER_IPA_SYMBOLS_TABLE,
    SIGN_DIALECT_PHONEMES_TABLE,
    SIGN_DIALECTS_TABLE,
    SPOKEN_DIALECT_PHONEMES_TABLE,
    SPOKEN_DIALECTS_TABLE,
    VOWELS_TABLE
} from '../../src/db/tables';
import {
    INSTALLED_DATA_DIR,
    INSTALLED_RESOURCES_DIR,
    ISO_FILE,
    ISWA_BASE_SYMBOLS_FILE_PATH,
    ISWA_CATEGORIES_FILE_PATH,
    ISWA_SYMBOL_GROUPS_FILE_PATH,
    SIGN_WRITING_ALPHABETS_FILE_PATH,
    SIGN_WRITING_DICTIONARIES_FILE_PATH,
    SIGN_WRITING_FONT_FILE,
    UNZIPPED_PBASE_FILES_DIR
} from '../postinstall/constants';
import { recreateDirectory } from '../utils';
import { IpaParser } from './spoken/ipa-parser';
import { SignDialectParser } from './sign/sign-dialect-parser';
import { SpokenDialectParser } from './spoken/spoken-dialect-parser';
import { SignWritingFontParser } from './sign/sign-writing-font-parser';
import { SignPhonemeParser } from './sign/sign-phoneme-parser';

// STEP 1: Prep the build directory
recreateDirectory(BUILD_DIR);

// Installed Resources
console.log(`Copying contents of ${INSTALLED_RESOURCES_DIR} to ${BUILD_DIR}`);
fs.cpSync(INSTALLED_RESOURCES_DIR, BUILD_DIR, {recursive: true});

// Custom Resources
const CUSTOM_RESOURCES_DIR = "custom-resources";
console.log(`Copying contents of ${CUSTOM_RESOURCES_DIR} to ${BUILD_DIR}`);
fs.cpSync(CUSTOM_RESOURCES_DIR, BUILD_DIR, {recursive: true});

// Database
console.log(`Creating database: ${DATABASE_FILE_PATH}`);
const db = new Database(DATABASE_FILE_PATH);

// STEP 2: Insert data into the database
// SPOKEN DIALECTS
const spokenDialectParser = new SpokenDialectParser(`${INSTALLED_DATA_DIR}/${UNZIPPED_PBASE_FILES_DIR}/pb_languages.csv`);
db.createTable(SPOKEN_DIALECTS_TABLE);
db.insertRows(SPOKEN_DIALECTS_TABLE, spokenDialectParser.getDialects());

db.createTable(SPOKEN_DIALECT_PHONEMES_TABLE);
db.insertRows(SPOKEN_DIALECT_PHONEMES_TABLE, spokenDialectParser.getDialectPhonemes());

// IPA Symbols
const ipaParser = new IpaParser(`${INSTALLED_DATA_DIR}/${UNZIPPED_PBASE_FILES_DIR}/seg_convert.csv`);
db.createTable(OTHER_IPA_SYMBOLS_TABLE);
db.insertRows(OTHER_IPA_SYMBOLS_TABLE, ipaParser.getOtherSymbols());

db.createTable(VOWELS_TABLE);
db.insertRows(VOWELS_TABLE, ipaParser.getVowels());

db.createTable(CONSONANTS_TABLE);
db.insertRows(CONSONANTS_TABLE, ipaParser.getConsonants());

// SIGN DIALECTS
const signDialectParser = new SignDialectParser(
    SIGN_WRITING_DICTIONARIES_FILE_PATH,
    `${INSTALLED_DATA_DIR}/${ISO_FILE}`
);
db.createTable(SIGN_DIALECTS_TABLE);
db.insertRows(SIGN_DIALECTS_TABLE, signDialectParser.getDialects());

const signWritingFontParser = new SignWritingFontParser(
    `${INSTALLED_RESOURCES_DIR}/${SIGN_WRITING_FONT_FILE}`,
    ISWA_CATEGORIES_FILE_PATH,
    ISWA_SYMBOL_GROUPS_FILE_PATH,
    ISWA_BASE_SYMBOLS_FILE_PATH,
);

db.createTable(HANDS_TABLE);
const {hands, handOrientationPictures, handSymbolRotationPictures} = signWritingFontParser.getHandData();
db.insertRows(HANDS_TABLE, hands);

db.createTable(PALM_DIRECTIONS_TABLE);
db.insertRows(PALM_DIRECTIONS_TABLE, handOrientationPictures);

db.createTable(ROTATABLE_PALM_DIRECTIONS_TABLE);
db.insertRows(ROTATABLE_PALM_DIRECTIONS_TABLE, handSymbolRotationPictures);

const signPhonemeParser = new SignPhonemeParser(
    signWritingFontParser.symbols,
    signDialectParser.getDictionaryDialectIdMap(),
    SIGN_WRITING_ALPHABETS_FILE_PATH
)
db.createTable(SIGN_DIALECT_PHONEMES_TABLE);

// STEP 3: Close the database and check for warnings
console.log("Data inserted! Closing the database...");
db.close();

// Fail the pipeline if warnings were found while parsing data.
// The parsed data was still inserted into the database
// where it may be queried when debugging the warnings.
// These warnings indicate that assumptions made by parsing logic
// were not met by the raw data, which may have changed.
const dataWarnings = [
    ...spokenDialectParser.warnings,
    ...ipaParser.warnings,
    ...signDialectParser.warnings,
    ...signWritingFontParser.warnings,
    ...signPhonemeParser.warnings,
];
if (dataWarnings.length > 0) {
    console.log("Warnings found for the following data...");
    dataWarnings.forEach(warning => {
        console.log(`=> [${warning.dataType} ${warning.dataName}] ${warning.message}`);
    });
    throw new Error(
        `${dataWarnings.length} warning${dataWarnings.length > 1 ? "s" : ""} `
        + "found for data inserted into the database!"
    );
}