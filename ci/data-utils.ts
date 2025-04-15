import * as fs from 'fs';
import * as csvParse from 'csv-parse';

export const getSeperatedValueRows = async (
    dataFilePath: string,
    hasHeaders: boolean = false,
    parserOptions: object = {}
): Promise<any[]> => {
    const rows: any[] = [];
    const parser = fs.createReadStream(`data/${dataFilePath}`)
        .pipe(csvParse.parse(parserOptions));
    for await (const row of parser) {
        rows.push(row);
    }
    return hasHeaders ? rows.slice(1) : rows;
};