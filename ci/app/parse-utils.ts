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

export enum IpaPhonemeTypes {
    VOWEL = "vowel",
    CONSONANT = "consonant"
}

export const SPECIFIC_VOWEL_X_AXIS_ATTRIBUTES = [
    "rounded"
]

export const VOWEL_X_AXIS_ATTRIBUTES = [
    "front",
    "central",
    "back"
].concat(SPECIFIC_VOWEL_X_AXIS_ATTRIBUTES);

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