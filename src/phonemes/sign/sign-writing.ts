/**
 * Types, enums, and functions for SignWriting symbols
 * 
 * SignWriting symbols are organized by category, symbol groups, and base symbols.
 * These enums & functions adhere to International SignWriting Alphabet 2010 specification:
 * https://www.signbank.org/iswa/
 */

export enum SignWritingCategory {
    HANDS = "Hands",
    MOVEMENT = "Movement",
    DYNAMICS = "Dynamics",
    HEAD_AND_FACES = "Head & Faces",
    BODY = "Body",
    DETAILED_LOCATION = "Detailed Locations",
    PUNCTUATION = "Punctuation",
};

// 360 Degree Compass
export enum SignWritingSymbolRotation {
    DEGREES_0_or_360 = 0,
    DEGREES_315 = 315,
    DEGREES_270 = 270,
    DEGREES_225 = 225,
    DEGREES_180 = 180,
    DEGREES_135 = 135,
    DEGREES_90 = 90,
    DEGREES_45 = 45
}

export const CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS = [
    SignWritingSymbolRotation.DEGREES_0_or_360,
    SignWritingSymbolRotation.DEGREES_45,
    SignWritingSymbolRotation.DEGREES_90,
    SignWritingSymbolRotation.DEGREES_135,
    SignWritingSymbolRotation.DEGREES_180,
    SignWritingSymbolRotation.DEGREES_225,
    SignWritingSymbolRotation.DEGREES_270,
    SignWritingSymbolRotation.DEGREES_315
];

export const COUNTER_CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS = [
    SignWritingSymbolRotation.DEGREES_0_or_360,
    SignWritingSymbolRotation.DEGREES_315,
    SignWritingSymbolRotation.DEGREES_270,
    SignWritingSymbolRotation.DEGREES_225,
    SignWritingSymbolRotation.DEGREES_180,
    SignWritingSymbolRotation.DEGREES_135,
    SignWritingSymbolRotation.DEGREES_90,
    SignWritingSymbolRotation.DEGREES_45
];