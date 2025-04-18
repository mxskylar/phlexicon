import * as fs from 'fs';
import { BUILD_DIR, DATABASE_FILE_PATH } from '../../src/build-constants';
import { Database } from '../../src/db/database';
import {
    CONSONANTS_TABLE,
    IPA_PHONEME_SYMBOLS_TABLE,
    OTHER_IPA_SYMBOLS_TABLE,
    SIGN_DIALECTS_TABLE,
    SIGN_WRITING_SYMBOLS_TABLE,
    SPOKEN_DIALECT_PHONEMES_TABLE,
    SPOKEN_DIALECTS_TABLE,
    VOWELS_TABLE
} from '../../src/db/tables';
import {
    DATA_DIR,
    INSTALLED_RESOURCES_DIR,
    ISO_FILE,
    SIGN_WRITING_ALPHABETS_FILE_PATH,
    SIGN_WRITING_DICTIONARIES_FILE_PATH,
    SIGN_WRITING_FONT_FILE,
    UNZIPPED_PBASE_FILES_DIR
} from '../postinstall/constants';
import { recreateDirectory } from '../utils';
import { DataWarning } from './data-parser';
import { IpaParser } from './ipa-parser';
import { SignDialectParser } from './sign-dialect-parser';
import { SpokenDialectParser } from './spoken-dialect-parser';

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
const dataWarnings: DataWarning[] = [];
const saveWarnings = (warnings: DataWarning[]) => {
    warnings.forEach(warning => dataWarnings.push(warning));
};

// SPOKEN DIALECTS
const spokenDialectParser = new SpokenDialectParser(`${DATA_DIR}/${UNZIPPED_PBASE_FILES_DIR}/pb_languages.csv`);
db.createTable(SPOKEN_DIALECTS_TABLE);
db.insertRows(SPOKEN_DIALECTS_TABLE, spokenDialectParser.getDialects());

db.createTable(SPOKEN_DIALECT_PHONEMES_TABLE);
db.insertRows(SPOKEN_DIALECT_PHONEMES_TABLE, spokenDialectParser.getDialectPhonemes());

saveWarnings(spokenDialectParser.warnings);

// IPA Symbols
const ipaParser = new IpaParser(`${DATA_DIR}/${UNZIPPED_PBASE_FILES_DIR}/seg_convert.csv`);
db.createTable(IPA_PHONEME_SYMBOLS_TABLE);
db.insertRows(IPA_PHONEME_SYMBOLS_TABLE, ipaParser.getPhonemeSymbols());

db.createTable(OTHER_IPA_SYMBOLS_TABLE);
db.insertRows(OTHER_IPA_SYMBOLS_TABLE, ipaParser.getOtherSymbols());

db.createTable(VOWELS_TABLE);
db.insertRows(VOWELS_TABLE, ipaParser.getVowels());

db.createTable(CONSONANTS_TABLE);
db.insertRows(CONSONANTS_TABLE, ipaParser.getConsonants());

saveWarnings(ipaParser.warnings);

// SIGN DIALECTS
const signDialectParser = new SignDialectParser(
    SIGN_WRITING_DICTIONARIES_FILE_PATH,
    `${DATA_DIR}/${ISO_FILE}`
);
db.createTable(SIGN_DIALECTS_TABLE);
db.insertRows(SIGN_DIALECTS_TABLE, signDialectParser.getDialects());

const signWritingFontParser = signDialectParser.getSignWritingFontParser(
    SIGN_WRITING_ALPHABETS_FILE_PATH,
    `${INSTALLED_RESOURCES_DIR}/${SIGN_WRITING_FONT_FILE}`
);
saveWarnings(signDialectParser.warnings);

db.createTable(SIGN_WRITING_SYMBOLS_TABLE);
db.insertRows(SIGN_WRITING_SYMBOLS_TABLE, signWritingFontParser.getSymbols());
saveWarnings(signWritingFontParser.warnings);

// TODO: Initialize these tables
// - Oriented Handshape Symbols
// - Movement Symbols
// - Location & Expression Symbols
// - The Phonemes of Sign Dialects

// STEP 3: Close the database and check for warnings
console.log("Data inserted! Closing the database...");
db.close();

// Fail the pipeline if warnings were found while parsing data.
// The parsed data was still inserted into the database
// where it may be queried when debugging the warnings.
// These warnings indicate that assumptions made by parsing logic
// were not met by the raw data, which may have changed.
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