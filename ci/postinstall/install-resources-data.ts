import * as fs from 'fs';
import StreamZip from 'node-stream-zip';
import {recreateDirectory} from '../utils';
import {
    INSTALLED_RESOURCES_DIR,
    SIGN_WRITING_FONT_FILE,
    INSTALLED_DATA_DIR,
    ISO_FILE,
    SIGN_WRITING_ALPHABETS_FILE_PATH,
    SIGN_WRITING_DICTIONARIES_FILE_PATH,
    ISWA_FILE_PATH
} from './constants';

const downloadFile = async (url: string, dir: string) => {
    const path = new URL(url).pathname.split("/");
    const fileName = path[path.length - 1];
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    const filePath = `${dir}/${fileName}`;
    console.log(`=> Downloading ${filePath} from: ${url}`);
    await fetch(url, {method: "GET"})
        .then(response => response.arrayBuffer())
        .then(responseData => fs.appendFileSync(filePath, Buffer.from(responseData)));
};

// INSTALLED RESOURCES
recreateDirectory(INSTALLED_RESOURCES_DIR);

// Bootswatch theme for Bootstrap UI: https://bootswatch.com/cerulean/
await downloadFile("https://bootswatch.com/5/cerulean/bootstrap.min.css", INSTALLED_RESOURCES_DIR);

// Bootstrap UI components & framework: https://getbootstrap.com/docs/5.0/getting-started/introduction/
// Minified bundle downloaded from CDN: https://getbootstrap.com/docs/5.3/getting-started/download/#cdn-via-jsdelivr
await downloadFile("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js", INSTALLED_RESOURCES_DIR);

// SignWriting Fonts: https://www.sutton-signwriting.io/#fonts
await downloadFile(`https://unpkg.com/@sutton-signwriting/font-ttf@1.0.0/font/${SIGN_WRITING_FONT_FILE}`, INSTALLED_RESOURCES_DIR);

// RAW DB DATA
recreateDirectory(INSTALLED_DATA_DIR);

// ISO 639-3 Code Set: https://iso639-3.sil.org/code_tables/download_tables#639-3%20Code%20Set
await downloadFile(`https://iso639-3.sil.org/sites/iso639-3/files/downloads/${ISO_FILE}`, INSTALLED_DATA_DIR);

// PBase data on spoken languages: https://pbase.phon.chass.ncsu.edu/
await downloadFile("https://phon.chass.ncsu.edu/pbase/pbasefiles.zip", INSTALLED_DATA_DIR);
const pbaseZipFile = await new StreamZip.async({file: `${INSTALLED_DATA_DIR}/pbasefiles.zip`});
await pbaseZipFile.extract(null, INSTALLED_DATA_DIR);
await pbaseZipFile.close();

// SignPuddle API for SignWriting
// API: https://signpuddle.com/client/api/
// Tools: https://signpuddle.com/tools/
// Dictionary UI: https://signpuddle.com/client/
// SignWriting Tutorial: https://www.signwriting.org/lessons/lessonsw/000%20Cover.html
// SignWriting Characters: https://signbank.org/SignWriting_Character_Viewer.html#?ui=en&set=uni8
// SignMaker: https://www.signbank.org/signmaker.html
const SIGN_PUDDLE_HOST = "https://signpuddle.com/server";

const getSignWritingDictionaries = async () => {
    const urlPath = "/dictionary?name=public";
    const url = `${SIGN_PUDDLE_HOST}${urlPath}`;
    console.log(`=> Fetching SignWriting dictionaries from: ${url}`);
    return await fetch(url, {
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

let numberFetchedAlphabets = 0;
const getSignWritingAlphabet = (dictionary, totalAlphabets = 1) => {
    const urlPath = `/dictionary/${dictionary}/alphabet?update=1`;
    const url = `${SIGN_PUDDLE_HOST}${urlPath}`;
    return fetch(url, {method: "GET"})
        .then(response => response.json())
        .then(responseData => {
            if (totalAlphabets > 1) {
                numberFetchedAlphabets++;
            }
            const name = totalAlphabets > 1 ? `${numberFetchedAlphabets}/${totalAlphabets}` : dictionary;
            console.log(`==> Fetched SignWriting alphabet ${name} from: ${url}`);
            return responseData
        });
};

// International SignWriting alphabet (all characters in all languages SignWriting supports)
console.log("=> Fetching International SignWriting Alphabet...");
fs.writeFileSync(ISWA_FILE_PATH, JSON.stringify(
    await getSignWritingAlphabet("iswa-2010")
));

// SignWriting alphabets for specific languages
const signWritingDictionaries = await getSignWritingDictionaries();
fs.writeFileSync(SIGN_WRITING_DICTIONARIES_FILE_PATH, JSON.stringify(signWritingDictionaries));

console.log(`=> Fetching ${signWritingDictionaries.length} SignWriting alphabets...`);
const signWritingAlphabets = await Promise.all(
    signWritingDictionaries.map(dictionary => getSignWritingAlphabet(dictionary, signWritingDictionaries.length))
);
fs.writeFileSync(SIGN_WRITING_ALPHABETS_FILE_PATH, JSON.stringify(signWritingAlphabets));
console.log(`=> Wrote ${signWritingDictionaries.length} SignWriting alphabets to: ${SIGN_WRITING_ALPHABETS_FILE_PATH}`);