import * as fs from 'fs';
import StreamZip from 'node-stream-zip';
import { Agent } from 'undici';
import { getSeperatedValueData, recreateDirectory } from '../utils';
import {
    INSTALLED_RESOURCES_DIR,
    SIGN_WRITING_ONE_D_FONT_FILE,
    INSTALLED_DATA_DIR,
    ISO_FILE,
    SIGN_WRITING_ALPHABETS_FILE_PATH,
    SIGN_WRITING_DICTIONARIES_FILE_PATH,
    SIGN_WRITING_FILL_FONT_FILE,
    SIGN_WRITING_LINE_FONT_FILE,
    ISWA_BASE_SYMBOLS_FILE_PATH,
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
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to download file: ${response.status}`);
            }
            return response.arrayBuffer();
        })
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
const SIGN_WRITING_FONT_REPO = "https://unpkg.com/@sutton-signwriting/font-ttf@1.0.0/font"
await downloadFile(`${SIGN_WRITING_FONT_REPO}/${SIGN_WRITING_ONE_D_FONT_FILE}`, INSTALLED_RESOURCES_DIR);
await downloadFile(`${SIGN_WRITING_FONT_REPO}/${SIGN_WRITING_FILL_FONT_FILE}`, INSTALLED_RESOURCES_DIR);
await downloadFile(`${SIGN_WRITING_FONT_REPO}/${SIGN_WRITING_LINE_FONT_FILE}`, INSTALLED_RESOURCES_DIR);


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
// International SignWriting Alphabet (ISWA) 2010 Data: https://www.movementwriting.org/symbolbank/index.html#ISWA2010
// ISWA 2010 Palm Orientation Photos: https://www.movementwriting.org/symbolbank/downloads/ISWA2010/ISWA2010_Photos/
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
const getSignWritingAlphabet = (dictionary: string, totalAlphabets: number) => {
    const urlPath = `/dictionary/${dictionary}/alphabet?update=1`;
    const url = `${SIGN_PUDDLE_HOST}${urlPath}`;
    const options = {method: "GET", dispatcher: new Agent({ connectTimeout: 100000 })};
    return fetch(url, options)
        .then(response => response.json())
        .then(responseData => {
            numberFetchedAlphabets++;
            console.log(`==> Fetched SignWriting alphabet ${numberFetchedAlphabets}/${totalAlphabets} from: ${url}`);
            return responseData
        });
};

// SignWriting alphabets for specific languages
const signWritingDictionaries = await getSignWritingDictionaries();
fs.writeFileSync(SIGN_WRITING_DICTIONARIES_FILE_PATH, JSON.stringify(signWritingDictionaries));

console.log(`=> Fetching ${signWritingDictionaries.length} SignWriting alphabets...`);
const signWritingAlphabets = await Promise.all(
    signWritingDictionaries.map(dictionary => {
        const makeRequest = () => getSignWritingAlphabet(dictionary, signWritingDictionaries.length);
        return makeRequest().catch(error => setTimeout(makeRequest, 1000));
    })
);
fs.writeFileSync(SIGN_WRITING_ALPHABETS_FILE_PATH, JSON.stringify(signWritingAlphabets));
console.log(`=> Wrote ${signWritingDictionaries.length} SignWriting alphabets to: ${SIGN_WRITING_ALPHABETS_FILE_PATH}`);

// Palm orientation pictures
const PALM_ORIENTATION_PICTURE_DIR = `${INSTALLED_RESOURCES_DIR}/palm-orientation-pictures`;
let numFetchedPictures = 0;
const getPalmOrientationPicture = (baseSymbolId: string, orientationNumber: number, totalPictures) => {
    const idParts = baseSymbolId.split("-");
    const symbolGroupId = `${idParts[0]}-${idParts[1]}`;
    const fileName = `${baseSymbolId}-0${orientationNumber}.psd`;
    const url = "https://www.movementwriting.org/symbolbank/downloads/ISWA2010/ISWA2010_Photos/"
        + `${symbolGroupId}/${symbolGroupId}-${idParts[2]}/${fileName}`;
    const options = {method: "GET", dispatcher: new Agent({ connectTimeout: 100000 })};
    return fetch(url, options)
        .then(response => {
            if (response.status === 404) {
                console.log(`==> [404] Skipping, no picture found at: ${url}`);
                return;
            }
            return response.arrayBuffer();
        })
        .then(responseData => {
            numFetchedPictures++;
            if (numFetchedPictures % 100 === 0) {
                console.log(`==> Fetched palm orientation picture ${numFetchedPictures}/${totalPictures}, ${totalPictures - numFetchedPictures} left...`);
            }
            if (responseData) {
                fs.appendFileSync(`${PALM_ORIENTATION_PICTURE_DIR}/${fileName}`, Buffer.from(responseData));
            }
        });
    }

const baseSymbolIds = getSeperatedValueData(ISWA_BASE_SYMBOLS_FILE_PATH, {delimiter: "\t"})
    .filter((row, i) => i < 261) // Filter for base symbols of handshapes only
    .map(baseSymbol => baseSymbol.symbolId);
const ORIENTATION_NUMBERS = [1, 2, 3, 4, 5, 6];
const totalPictures = baseSymbolIds.length * ORIENTATION_NUMBERS.length;
fs.mkdirSync(PALM_ORIENTATION_PICTURE_DIR);
console.log(`=> Downloading ${totalPictures} palm orientation pictures...`);
await Promise.all(baseSymbolIds.map(baseSymbolId => {
    return ORIENTATION_NUMBERS.map(n => {
        const makeRequest = () => getPalmOrientationPicture(baseSymbolId, n, totalPictures);
        return makeRequest().catch(error => setTimeout(makeRequest, 1000));
    });
}));
console.log(`=> Downloaded ${totalPictures} palm orientation pictures!`);