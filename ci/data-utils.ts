import * as fs from 'fs';
import * as csvParse from 'csv-parse';

export const getSeperatedValueData = async (
    fileName: string,
    hasHeaders: boolean = false,
    parserOptions: object = {}
): Promise<any[]> => {
    const rows: any[] = [];
    const parser = fs.createReadStream(fileName)
        .pipe(csvParse.parse(parserOptions));
    for await (const row of parser) {
        rows.push(row);
    }
    return hasHeaders ? rows.slice(1) : rows;
};

export enum IpaPhonemeTypes {
    VOWEL = "vowel",
    CONSONANT = "consonant"
}

export const VOWEL_X_AXIS_ATTRIBUTES = [
    "front",
    "central",
    "back"
];

export const VOWEL_Y_AXIS_ATTRIBUTES = [
    "close",
    "near_close",
    "close_mid",
    "mid",
    "open_mid",
    "near_open",
    "open"
];

export const CONSONANT_PLACE_ATTRIBUTES = [
    "bilabial",
    "labiodental",
    "dental",
    "alveolar",
    "postalveolar",
    "retroflex",
    "palatal",
    "velar",
    "uvular",
    "pharyngeal",
    "epiglottal",
    "glottal"
];

export const SPECIFIC_CONSONANT_MANNER_ATTRIBUTES = [
    "lateral-approximant",
    "lateral-stop"
];

export const CONSONANT_MANNER_ATTRIBUTES = [
    "nasal",
    "affricate",
    "fricative",
    "approximant",
    "flap",
    "trill",
    "implosive",
    "stop",
    "click"
].concat(SPECIFIC_CONSONANT_MANNER_ATTRIBUTES);