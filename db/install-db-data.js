import * as fs from 'fs';
import {downloadFile} from "../install-utils.js";
import {DATA_DIR, ISO_LANGUAGES_FILE, SPOKEN_PHONEMES_FILE, SIGN_LANGUAGES_FILE_PATH} from './db-constants.js';

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
    return dictionaries.map((dictionary, i) => {
        const dictNamePieces = dictionary.split("-");
       return [
            i + 1, // id
            dictNamePieces[0], // iso_code
            dictNamePieces[1] // region
        ];
    });
};

const getSignLanguageAlphabets = async dictionary => {
    const urlPath = `/dictionary/${dictionary}/alphabet?update=1`;
    const url = `${SIGN_PUDDLE_HOST}${urlPath}`;
    console.log(`Requesting: ${url}`);
    const alphabet = await fetch(url, {method: "GET"})
        .then(response => response.json())
        .then(responseData => responseData);
    console.log(alphabet);
};

console.log(`Creating ${SIGN_LANGUAGES_FILE_PATH}`);
fs.writeFileSync(SIGN_LANGUAGES_FILE_PATH, JSON.stringify({
    columns: ["id", "iso_code", "dialect"],
    rows: await getSignLanguages()
}));

//await getSignLanguageAlphabets("ase-US-dictionary-public");

// TODO: Create sign-phonemes.json from alphabets pulled from this Sign Puddle endpoint: /dictionary/{name}/alphabet{?update}
// Parse unique unicode characters from navigatable tree of unicode characters returned
// Detect if character represents a handshape, the right or left hand, a particular palm facing or rotational orientation, a movement, or a facial expression based on unicode ID of character