import * as fs from 'fs';
import {Readable} from 'stream';
import {exec} from 'child_process';

export const runShellCommand = command => {
    console.log(command);
    exec(command, (error, stdout, stderr) => {
        if (stdout) {
            console.log(stdout);
        }
        if (stderr) {
            console.log(stderr);
        }
        if (error) {
            console.log(error.message);
            throw error;
        }
    });
}

export const downloadFile = async (url, filePath, fileName, useCurl = false) => {
    console.log(`Downloading ${filePath}/${fileName} from: ${url}`)
    const response = await fetch(url);
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
    }
    if (useCurl) {
        runShellCommand(`curl -o ${filePath}/${fileName} ${url}`);
    } else {
        const fileStream = fs.createWriteStream(`${filePath}/${fileName}`);
        Readable.fromWeb(response.body).pipe(fileStream);
    }
};