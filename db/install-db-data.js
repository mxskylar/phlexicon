import * as fs from 'fs';
import {mkdir} from 'fs/promises';
import {Readable} from 'stream';

const downloadFile = async (url, fileName) => {
    const dataDir = "db/data";
    console.log(`Downloading ${fileName} from: ${url}`)
    const response = await fetch(url);
    if (!fs.existsSync(dataDir)) {
        await mkdir(dataDir);
    }
    const fileStream = fs.createWriteStream(`${dataDir}/${fileName}`);
    Readable.fromWeb(response.body).pipe(fileStream);
};

// ISO language codes & names
// See Language Names Index at: https://iso639-3.sil.org/code_tables/download_tables
await downloadFile("https://iso639-3.sil.org/sites/iso639-3/files/downloads/iso-639-3_Name_Index.tab", "iso-languages.tab");

// Phoible data on spoken languages
// https://phoible.org/download
// https://github.com/phoible/dev/tree/master/data
await downloadFile("https://raw.githubusercontent.com/phoible/dev/master/mappings/InventoryID-LanguageCodes.csv", "spoken-languages.csv");
await downloadFile("https://raw.githubusercontent.com/phoible/dev/master/data/phoible.csv", "spoken-phonemes.csv");