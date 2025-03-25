import * as fs from 'fs';
import {mkdir} from 'fs/promises';
import {Readable} from 'stream';

export const downloadFile = async (url, filePath, fileName) => {
    console.log(`Downloading ${fileName} from: ${url}`)
    const response = await fetch(url);
    if (!fs.existsSync(filePath)) {
        await mkdir(filePath);
    }
    const fileStream = fs.createWriteStream(`${filePath}/${fileName}`);
    Readable.fromWeb(response.body).pipe(fileStream);
};