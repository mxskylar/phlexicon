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

export enum SignWritingSymbolGroup {
    // HANDS
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
    // MOVEMENT
    CONTACT = "񆇡",
    FINGER_MOVEMENT = "񆡁",
    STRAIGHT_WALL_PLANE = "񆿁",
    STRAIGHT_DIAGONAL_PLANE = "񇿡",
    STRAIGHT_FLOOR_PLANE = "񈗡",
    CURVES_PARALLEL_WALL_PLANE = "񉌁",
    CURVES_HIT_WALL_PLANE = "񉹁",
    CURVES_HIT_FLOOR_PLANE = "񊒡",
    CURVES_PARALLEL_FLOOR_PLANE = "񊿡",
    CIRCLES = "񋔡",
    // DYNAMICS
    // HEAD & FACES
    // BODY
};

export enum SignWritingBaseSymbol {
    // HANDS
    // Index
    INDEX = "񀀁",
    INDEX_ON_CIRCLE = "񀁱",
    // Thumb
    FIST_HEEL = "񆆑",
    // MOVEMENT
    // DYNAMICS
    // HEAD & FACES
    // BODY
};