import * as fs from 'fs';
import {mkdir} from 'fs/promises';

export const downloadFile = async (url, filePath, fileName) => {
    console.log(`Downloading ${filePath}/${fileName} from: ${url}`)
    const response = await fetch(url);
    if (!fs.existsSync(filePath)) {
        await mkdir(filePath);
    }
    const fileStream = fs.createWriteStream(`${filePath}/${fileName}`);
    fileStream.on("finish", () => {
        file.close();
    });
};