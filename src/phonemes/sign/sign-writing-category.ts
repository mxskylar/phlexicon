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