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