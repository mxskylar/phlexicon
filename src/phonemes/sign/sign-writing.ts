/**
 * Types, enums, and functions for SignWriting symbols
 * 
 * SignWriting symbols are organized by category, symbol groups, and base symbols.
 * These enums & functions adhere to International SignWriting Alphabet 2010 specification:
 * https://www.signbank.org/iswa/
 */

export type SignWritingSymbol = {
    symbol: string
};

export enum SignWritingCategory {
    HANDS = "Hands",
    MOVEMENT = "Movement",
    DYNAMICS = "Dynamics",
    HEAD_AND_FACES = "Head & Faces",
    BODY = "Body",
};

export enum SignWritingSymbolGroup {
    INDEX = "񀀁",
    INDEX_MIDDLE = "񀕁",
    INDEX_MIDDLE_THUMB = "񀭁",
    FOUR_FINGERS = "񁦁",
    FIVE_FINGERS = "񁲁",
    BABY_FINGER = "񃉁",
    RING_FINGER = "񃶁",
    MIDDLE_FINGER = "񄗁",
    INDEX_THUMB = "񄳡",
    THUMB = "񅯡",
};

export enum SignWritingBaseSymbol {
    INDEX = "񀀁",
    INDEX_ON_CIRCLE = "񀁱",
};