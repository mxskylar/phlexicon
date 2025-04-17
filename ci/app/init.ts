import * as fs from 'fs';
import opentype from 'opentype.js';
import { recreateDirectory } from '../utils';
import {
    DATA_DIR,
    INSTALLED_RESOURCES_DIR,
    ISO_FILE,
    SIGN_WRITING_DICTIONARIES_FILE_PATH,
    SIGNWRITING_FONT_FILE,
    UNZIPPED_PBASE_FILES_DIR
} from '../postinstall/constants';
import { BUILD_DIR, DATABASE_FILE_PATH } from '../../src/build-constants';
import { Database } from '../../src/db/database';
import {
    SPOKEN_DIALECTS_TABLE,
    OTHER_IPA_SYMBOLS_TABLE,
    IPA_PHONEME_SYMBOLS_TABLE,
    SPOKEN_DIALECT_PHONEMES_TABLE,
    VOWELS_TABLE,
    CONSONANTS_TABLE,
    SIGN_DIALECTS_TABLE
} from '../../src/db/tables';
import { SpokenDialectParser } from './spoken-dialect-parser';
import { IpaParser } from './ipa-parser';

// BUILD DIRECTORY
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

// SPOKEN DIALECTS
const spokenDialectParser = new SpokenDialectParser(`${DATA_DIR}/${UNZIPPED_PBASE_FILES_DIR}/pb_languages.csv`);
db.createTable(SPOKEN_DIALECTS_TABLE);
db.insertRows(SPOKEN_DIALECTS_TABLE, spokenDialectParser.getDialects());

db.createTable(SPOKEN_DIALECT_PHONEMES_TABLE);
db.insertRows(SPOKEN_DIALECT_PHONEMES_TABLE, spokenDialectParser.getDialectPhonemes());

// IPA Symbols
const ipaParser = new IpaParser(`${DATA_DIR}/${UNZIPPED_PBASE_FILES_DIR}/seg_convert.csv`);
db.createTable(OTHER_IPA_SYMBOLS_TABLE);
db.insertRows(OTHER_IPA_SYMBOLS_TABLE, ipaParser.getOtherSymbols());

db.createTable(VOWELS_TABLE);
db.insertRows(VOWELS_TABLE, ipaParser.getVowels());

/*
// SIGN DIALECTS
const getJsonFromFile = (filePath: string) =>
    JSON.parse(fs.readFileSync(filePath).toString());
const getSignDialectIsoCode = (dictionaryName: string) =>
    dictionaryName.split("-")[0];
const getSignDialectRegion = (dictionaryName: string) =>
    dictionaryName.split("-")[1];

db.createTable(SIGN_DIALECTS_TABLE);
const isoLanguagesData = await getSeperatedValueData(`${DATA_DIR}/${ISO_FILE}`, true, {delimiter: "\t"});
const getIsoLanguageName = (code: string) => {
    for (const i in isoLanguagesData) {
        const row = isoLanguagesData[i];
        if (row[0] === code) {
            return row[6];
        }
    }
    throw new Error(`Unknown ISO language code: ${code}`);
};
const signDialectRows = getJsonFromFile(SIGN_WRITING_DICTIONARIES_FILE_PATH)
    .map(dictionary => {
        const isoCode = getSignDialectIsoCode(dictionary);
        const languageName = getIsoLanguageName(isoCode);
        const region = getSignDialectRegion(dictionary);
        return [`${isoCode}-${region}`, languageName];
    });
db.insertRows(SIGN_DIALECTS_TABLE, signDialectRows);

// SignWriting Symbols
const signWritingFontBuffer = fs.readFileSync(`${INSTALLED_RESOURCES_DIR}/${SIGNWRITING_FONT_FILE}`);
const toArrayBuffer = (buffer: Buffer) => {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; i++) {
        view[i] = buffer[i];
    }
    return arrayBuffer;
};
const signWritingFont = opentype.parse(toArrayBuffer(signWritingFontBuffer));
const signWritingCharacters = Object.values(signWritingFont.glyphs.glyphs)
    .map(glyph => {
        let character: string | null = null;
        try {
            character = String.fromCodePoint((glyph as opentype.Glyph).unicode);
        } catch (e) {
            console.log(e);
        } finally {
            return character;
        }
    })
    .filter(character => character);
// POC: Gets glyph by name found in hierarchy spec
// https://www.signbank.org/iswa/100/100_bs.html
console.log(
    Object.values(signWritingFont.glyphs.glyphs)
        .filter(glyph => (glyph as opentype.Glyph).name === "S1000d")
        .map(glyph => String.fromCodePoint((glyph as opentype.Glyph).unicode))
);*/

// Oriented Handshape Symbols

// Movement Symbols

// Location & Expression Symbols

// The Phonemes of Sign Dialects

db.close();