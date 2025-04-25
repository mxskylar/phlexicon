import * as fs from 'fs';

export const getJsonData = (filePath: string) =>
    JSON.parse(fs.readFileSync(filePath).toString());

export const getUniqueValues = (values: any[]) => {
    return [... new Set(values)];
};

export const getPercent = (count: number, total: number) =>
    Math.round((count / total) * 10000) / 100;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description
export const sortAscending = (a: number, b: number): number => {
    if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      }
      return 0;
}