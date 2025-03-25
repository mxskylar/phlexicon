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

await downloadFile("https://raw.githubusercontent.com/phoible/dev/master/mappings/InventoryID-LanguageCodes.csv", "spoken-languages.csv");