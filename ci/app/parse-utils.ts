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

export const getJsonData = (filePath: string) =>
    JSON.parse(fs.readFileSync(filePath).toString());

export const getUniqueValues = (values: any[]) => {
    return [... new Set(values)];
};

export const getPercent = (count: number, total: number) =>
    Math.round((count / total) * 10000) / 100;