import * as fs from 'fs';
import * as csvParse from 'csv-parse/sync';

export const getSeperatedValueData = (
    fileName: string,
    parserOptions: object = {}
) => {
    const rows: any[] = [];
    const fileBuffer = fs.readFileSync(fileName)
    return csvParse.parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        ...parserOptions
    });
};

export const recreateDirectory = (path: string) => {
    if (fs.existsSync(path)) {
        console.log(`Deleting then recreating directory: ${path}`);
        fs.rmSync(path, {
            recursive: true,
            force: true
        });
    }
    fs.mkdirSync(path);
};