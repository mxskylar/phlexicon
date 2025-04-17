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

export const getUniqueValues = (values: any[]) => {
    return [... new Set(values)];
}