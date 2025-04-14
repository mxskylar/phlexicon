import * as fs from 'fs';

export const recreateDirectory = (path: string) => {
    if (fs.existsSync(path)) {
        console.log(`Deleting then recreating directory: ${path}`);
        fs.rmSync(path, {
            recursive: true,
            force: true
        });
        fs.mkdirSync(path);
    }
};

export const downloadFile = async (url: string, dir: string) => {
    const path = new URL(url).pathname.split("/");
    const fileName = path[path.length - 1];
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    const filePath = `${dir}/${fileName}`;
    console.log(`Downloading ${filePath} from: ${url}`);
    await fetch(url, {method: "GET"})
        .then(response => response.arrayBuffer())
        .then(responseData => fs.appendFileSync(filePath, Buffer.from(responseData)));
};