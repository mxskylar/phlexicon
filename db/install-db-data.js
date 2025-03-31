import * as fs from 'fs';
import {downloadFile} from "../install-utils.js";
import {
    DATA_DIR,
    ISO_LANGUAGES_FILE,
    SPOKEN_PHONEMES_FILE,
    SIGN_LANGUAGES_FILE_PATH,
    SIGN_KEYBOARDS_FILE_PATH,
    SIGN_WRITING_FONT_FILE
} from './db-constants.js';

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

// Phoible data on spoken languages
// https://phoible.org/download
// https://github.com/phoible/dev/tree/master/data
await downloadFile("https://raw.githubusercontent.com/phoible/dev/master/data/phoible.csv", DATA_DIR, SPOKEN_PHONEMES_FILE);

// SignPuddle API for SignWriting
// API: https://signpuddle.com/client/api/
// Tools: https://signpuddle.com/tools/
// Dictionary UI: https://signpuddle.com/client/
// SignWriting Tutorial: https://www.signwriting.org/lessons/lessonsw/000%20Cover.html
// SignWriting Characters: https://signbank.org/SignWriting_Character_Viewer.html#?ui=en&set=uni8
// SignMaker: https://www.signbank.org/signmaker.html
// SignWriting Fonts: https://www.sutton-signwriting.io/#fonts
const SIGN_PUDDLE_HOST = "https://signpuddle.com/server";

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
        signDictiontionaries[dict] = {id, isoCode};
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
const signKeyboardRows = [];
for (const [dict, values] of Object.entries(signDictiontionaries)) {
    const {id, isoCode} = values;
    const alphabet = await getSignAlphabet(dict);
    signKeyboardRows.push([id, isoCode, alphabet]);
    break;
}
fs.writeFileSync(SIGN_KEYBOARDS_FILE_PATH, JSON.stringify({
    columns: ["language_id", "iso_code", "phoneme"],
    rows: signKeyboardRows
}));

// TODO: Create sign-phonemes.json from alphabets pulled from this Sign Puddle endpoint: /dictionary/{name}/alphabet{?update}
// Parse unique unicode characters from navigatable tree of unicode characters returned
// Detect if character represents a handshape, the right or left hand, a particular palm facing or rotational orientation, a movement, or a facial expression based on unicode ID of character