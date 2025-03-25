import * as fs from 'fs';
import {downloadFile} from "../install-utils.js";

const DB_DATA_DIR = "db/data";

// ISO language codes & names
// See Language Names Index at: https://iso639-3.sil.org/code_tables/download_tables
await downloadFile("https://iso639-3.sil.org/sites/iso639-3/files/downloads/iso-639-3_Name_Index.tab", DB_DATA_DIR, "iso-languages.tab");

// Phoible data on spoken languages
// https://phoible.org/download
// https://github.com/phoible/dev/tree/master/data
await downloadFile("https://raw.githubusercontent.com/phoible/dev/master/mappings/InventoryID-LanguageCodes.csv", DB_DATA_DIR, "spoken-languages.csv");
await downloadFile("https://raw.githubusercontent.com/phoible/dev/master/data/phoible.csv", DB_DATA_DIR, "spoken-phonemes.csv");

// SignPuddle API for SignWriting
// API: https://signpuddle.com/client/api/
// Tools: https://signpuddle.com/tools/
// Dictionary UI: https://signpuddle.com/client/
// SignWriting Tutorial: https://www.signwriting.org/lessons/lessonsw/000%20Cover.html
// SignWriting Characters: https://signbank.org/SignWriting_Character_Viewer.html#?ui=en&set=uni8
// SignMaker: https://www.signbank.org/signmaker.html
const SIGN_PUDDLE_HOST = "https://signpuddle.com/server";

const getSignPuddleDictionaries = fileName => {
    const urlPath = "/dictionary?name=public";
    const url = `${SIGN_PUDDLE_HOST}${urlPath}`;
    console.log(`Creating ${fileName} from request to: ${url}`);
    return fetch(url, {
        method: "GET",
        headers: {
            "Description": "Get available dictionaries",
            "Location": urlPath,
            "Content-Type": "application/x-www-form-urlencoded"
        },
    })
        .then(response => response.json())
        .then(responseData => responseData);
};

const getSignLanguages = async (fileName) => {
    const dictionaries = await getSignPuddleDictionaries(fileName);
    const signLanguages = [];
    dictionaries.forEach(dictionaryName => {
        const dictNamePieces = dictionaryName.split("-");
        signLanguages.push({
            dictionaryName,
            isoLanguageCode: dictNamePieces[0],
            isoRegionCode: dictNamePieces[1]
        });
    });
    return signLanguages;
}

const signLanguagesFile = "sign-languages.json";
const signLanguages = await getSignLanguages(signLanguagesFile);
fs.writeFileSync(`${DB_DATA_DIR}/${signLanguagesFile}`, JSON.stringify(signLanguages))