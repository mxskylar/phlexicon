import * as fs from 'fs';
import {mkdir} from 'fs/promises';
import {Readable} from 'stream';
import {exec} from 'child_process';

export const downloadFile = async (url, filePath, fileName, useCurl = false) => {
    console.log(`Downloading ${filePath}/${fileName} from: ${url}`)
    const response = await fetch(url);
    if (!fs.existsSync(filePath)) {
        await mkdir(filePath);
    }
    if (useCurl) {
        exec(`curl -o ${filePath}/${fileName} ${url}`, (error, stdout, stderr) => {
            if (error) {
                console.log(error.message);
                throw error;
            }
        });
        
    } else {
        const fileStream = fs.createWriteStream(`${filePath}/${fileName}`);
        Readable.fromWeb(response.body).pipe(fileStream);
    }
};