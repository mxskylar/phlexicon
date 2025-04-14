import * as fs from 'fs';
import {downloadFile} from "./install-utils.js";
import {
    DATA_DIR,
    ISO_LANGUAGES_FILE,
    SPOKEN_PHONEMES_ZIP_FILE,
    SIGN_LANGUAGES_FILE_PATH,
    SIGN_ALPHABETS_FILE_PATH,
    SIGN_WRITING_FONT_FILE
} from './db-constants.js';
import StreamZip from "node-stream-zip";

// Delete existing data and recreate directory to download fresh data
if (fs.existsSync(DATA_DIR)) {
    console.log(`Deleting existing directory: ${DATA_DIR}`);
    fs.rmSync(DATA_DIR, {
        recursive: true,
        force: true
    });
    fs.mkdirSync(DATA_DIR);
}

// ISO language codes & names
// ISO 639-3 Code Set: https://iso639-3.sil.org/code_tables/download_tables#639-3%20Code%20Set
await downloadFile("https://iso639-3.sil.org/sites/iso639-3/files/downloads/iso-639-3.tab", DATA_DIR, ISO_LANGUAGES_FILE);

// PBase data on spoken languages
// https://pbase.phon.chass.ncsu.edu/
await downloadFile("https://phon.chass.ncsu.edu/pbase/pbasefiles.zip", DATA_DIR, SPOKEN_PHONEMES_ZIP_FILE, true);
const pbaseZipFile = await new StreamZip.async({file: `${DATA_DIR}/${SPOKEN_PHONEMES_ZIP_FILE}`});
await pbaseZipFile.extract(null, DATA_DIR);
await pbaseZipFile.close();

// SignPuddle API for SignWriting
// API: https://signpuddle.com/client/api/
// Tools: https://signpuddle.com/tools/
// Dictionary UI: https://signpuddle.com/client/
// SignWriting Tutorial: https://www.signwriting.org/lessons/lessonsw/000%20Cover.html
// SignWriting Characters: https://signbank.org/SignWriting_Character_Viewer.html#?ui=en&set=uni8
// SignMaker: https://www.signbank.org/signmaker.html
// SignWriting Fonts: https://www.sutton-signwriting.io/#fonts
/*const SIGN_PUDDLE_HOST = "https://signpuddle.com/server";

const getSignLanguages = async () => {
    const urlPath = "/dictionary?name=public";
    const url = `${SIGN_PUDDLE_HOST}${urlPath}`;
    console.log(`Requesting: ${url}`);
    const dictionaries = await fetch(url, {
        method: "GET",
        headers: {
            "Description": "Get available dictionaries",
            "Location": urlPath,
            "Content-Type": "application/x-www-form-urlencoded"
        },
    })
        .then(response => response.json())
        .then(responseData => responseData);
    const signLanguageRows = [];
    const signDictiontionaries = {};
    dictionaries.forEach((dict, i) => {
        const dictNamePieces = dict.split("-");
        const id = i + 1
        const isoCode = dictNamePieces[0];
        const region = dictNamePieces[1];
        signLanguageRows.push([id, isoCode, region]);
        signDictiontionaries[dict] = {language_id: id, iso_code: isoCode};
    });
    return {
        signLanguageRows,
        signDictiontionaries
    }
};

const getSignAlphabet = async (dictionary) => {
    const urlPath = `/dictionary/${dictionary}/alphabet?update=1`;
    const url = `${SIGN_PUDDLE_HOST}${urlPath}`;
    console.log(`Requesting: ${url}`);
    return await fetch(url, {method: "GET"})
        .then(response => response.json())
        .then(responseData => responseData);
};

const {signLanguageRows, signDictiontionaries} = await getSignLanguages();
console.log(`Creating ${SIGN_LANGUAGES_FILE_PATH}`);
fs.writeFileSync(SIGN_LANGUAGES_FILE_PATH, JSON.stringify({
    columns: ["id", "iso_code", "dialect"],
    rows: signLanguageRows
}));

await downloadFile("https://unpkg.com/@sutton-signwriting/font-ttf@1.0.0/font/SuttonSignWritingLine.ttf", DATA_DIR, SIGN_WRITING_FONT_FILE, true);
const signKeyboards = [];
for (const [dict, values] of Object.entries(signDictiontionaries)) {
    const {language_id, iso_code} = values;
    const alphabet = await getSignAlphabet(dict);
    signKeyboards.push({language_id, iso_code, alphabet});
    break;
}
fs.writeFileSync(SIGN_ALPHABETS_FILE_PATH, JSON.stringify(signKeyboards));

// TODO: Get all SignWriting phonemes from font file using opentype
// https://github.com/opentypejs/opentype.js
// https://opentype.js.org/glyph-inspector.html*/