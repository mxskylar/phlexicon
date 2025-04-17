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
import {
    CONSONANT_MANNER_ATTRIBUTES,
    CONSONANT_PLACE_ATTRIBUTES,
    getSeperatedValueData,
    IpaPhonemeTypes,
    SPECIFIC_CONSONANT_MANNER_ATTRIBUTES,
    SPECIFIC_VOWEL_X_AXIS_ATTRIBUTES,
    VOWEL_X_AXIS_ATTRIBUTES,
    VOWEL_Y_AXIS_ATTRIBUTES
} from './data-utils'

// BUILD DIRECTORY
recreateDirectory(BUILD_DIR);

console.log(`Copying contents of ${INSTALLED_RESOURCES_DIR} to ${BUILD_DIR}`);
fs.cpSync(INSTALLED_RESOURCES_DIR, BUILD_DIR, {recursive: true});

const CUSTOM_RESOURCES_DIR = "custom-resources";
console.log(`Copying contents of ${CUSTOM_RESOURCES_DIR} to ${BUILD_DIR}`);
fs.cpSync(CUSTOM_RESOURCES_DIR, BUILD_DIR, {recursive: true});

console.log(`Creating database: ${DATABASE_FILE_PATH}`);
const db = new Database(DATABASE_FILE_PATH);

// SPOKEN DIALECTS
const spokenDialectData = await getSeperatedValueData(
    `${DATA_DIR}/${UNZIPPED_PBASE_FILES_DIR}/pb_languages.csv`,
    true,
    {delimiter: "\t"}
);

db.createTable(SPOKEN_DIALECTS_TABLE);
const spokenDialectRows = spokenDialectData.map(row => [row[1], row[0]]);
db.insertRows(SPOKEN_DIALECTS_TABLE, spokenDialectRows);

// IPA Symbols
const rawIpaSymbolData = await getSeperatedValueData(
    `${DATA_DIR}/${UNZIPPED_PBASE_FILES_DIR}/seg_convert.csv`,
    true,
    {relax_column_count: true} // This is necessary because an invalid row has an additional column
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
    VOWEL_Y_AXIS_ATTRIBUTES,
    SPECIFIC_VOWEL_X_AXIS_ATTRIBUTES
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
    const phonemes = row[4].split(",")
        .concat(row[5].split(","))
        .filter(phoneme => phoneme !== "");
    const uniquePhonemes = [...new Set(phonemes)];
    uniquePhonemes.forEach(phoneme => {
        spokenPhonemeRows.push([row[1], phoneme]);
    });
});
db.insertRows(SPOKEN_DIALECT_PHONEMES_TABLE, spokenPhonemeRows);

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
);

// Oriented Handshape Symbols

// Movement Symbols

// Location & Expression Symbols

// The Phonemes of Sign Dialects

db.close();