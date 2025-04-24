import {
    BasicColumn,
    BasicType,
    getColumnWithForeignKey,
    LengthColumn,
    LengthType
} from "./column.ts";
import { Table } from "./table.ts";
import { ForeignKey } from "./foreign-key.ts";
import { VowelAttribute } from "../phonemes/spoken/vowel.ts";
import { ConsonantAttribute } from "../phonemes/spoken/consonant.ts";
import { CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS, SignWritingSymbolRotation } from "../phonemes/sign/sign-writing.ts";

// SPOKEN DIALECTS
const spokenDialectId = new LengthColumn("id", LengthType.CHAR, 4).primaryKey();
export const SPOKEN_DIALECTS_TABLE = new Table(
    "spoken_dialects",
    spokenDialectId,
    new BasicColumn("name", BasicType.STRING)
);

// IPA Symbols
const IPA_SYMBOL_COLUMN = new LengthColumn("symbol", LengthType.VARCHAR, 5).primaryKey();

export const OTHER_IPA_SYMBOLS_TABLE = new Table(
    "other_ipa_symbols",
    IPA_SYMBOL_COLUMN,
);

export const VOWELS_TABLE = new Table(
    "vowels",
    IPA_SYMBOL_COLUMN,
    ...Object.values(VowelAttribute).map(columnName =>
        new BasicColumn(columnName, BasicType.BOOLEAN).required()
    ),
);

export const CONSONANTS_TABLE = new Table(
    "consonants",
    IPA_SYMBOL_COLUMN,
    ...Object.values(ConsonantAttribute).map(columnName =>
        new BasicColumn(columnName, BasicType.BOOLEAN).required()
    ),
);

export const SPOKEN_DIALECT_PHONEMES_TABLE = new Table(
    "spoken_dialect_phonemes",
    IPA_SYMBOL_COLUMN,
    getColumnWithForeignKey("dialect_id", new ForeignKey(SPOKEN_DIALECTS_TABLE, spokenDialectId))
        .primaryKey(),
);

// SIGN DIALECTS
const signDialectId = new LengthColumn("id", LengthType.CHAR, 6).primaryKey();
export const SIGN_DIALECTS_TABLE = new Table(
    "sign_dialects",
    signDialectId,
    new BasicColumn("name", BasicType.STRING)
);

// SignWriting Symbols
const SIGN_WRITING_SYMBOL_COLUMN = new LengthColumn("symbol", LengthType.CHAR, 1).primaryKey()
const SIGN_WRITING_BASE_SYMBOL_COLUMN = new LengthColumn("base_symbol", LengthType.CHAR, 1);
const SIGN_WRITING_SYMBOL_ROTATION_COLUMN =
    new BasicColumn("symbol_rotation", BasicType.INTEGER)
        .check(`IN (${CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS.join(", ")})`);

// Palm orientations
const RIGHT_HANDED_COLUMN = new BasicColumn("right_handed", BasicType.BOOLEAN);
const VERTICAL_HAND_COLUMN = new BasicColumn("vertical", BasicType.BOOLEAN);
const PALM_TOWARDS_COLUMN = new BasicColumn("palm_towards", BasicType.BOOLEAN);
const PALM_AWAY_COLUMN = new BasicColumn("palm_away", BasicType.BOOLEAN);
const PALM_SIDEWAYS_COLUMN = new BasicColumn("palm_sideways", BasicType.BOOLEAN);

export const HANDS_TABLE = new Table(
    "hands",
    SIGN_WRITING_SYMBOL_COLUMN,
    new LengthColumn("handshape", LengthType.CHAR, 1),
    SIGN_WRITING_BASE_SYMBOL_COLUMN.unique(),
    SIGN_WRITING_SYMBOL_ROTATION_COLUMN.required(),
    RIGHT_HANDED_COLUMN.required(),
    VERTICAL_HAND_COLUMN.required(),
    PALM_TOWARDS_COLUMN,
    PALM_AWAY_COLUMN,
    PALM_SIDEWAYS_COLUMN,
);

const PICTURE_COLUMN = new BasicColumn("picture", BasicType.BLOB).required();

export const HAND_PICTURES_PER_ORIENTATION_TABLE = new Table(
    "hand_pictures_per_orientation",
    SIGN_WRITING_BASE_SYMBOL_COLUMN.primaryKey(),
    RIGHT_HANDED_COLUMN.primaryKey(),
    VERTICAL_HAND_COLUMN.primaryKey(),
    PALM_TOWARDS_COLUMN.primaryKey(),
    PALM_AWAY_COLUMN.primaryKey(),
    PALM_SIDEWAYS_COLUMN.primaryKey(),
    //PICTURE_COLUMN,
);

export const HAND_PICTURES_PER_SYMBOL_ROTATION_TABLE = new Table(
    "hand_pictures_per_symbol_rotation",
    SIGN_WRITING_BASE_SYMBOL_COLUMN.primaryKey(),
    SIGN_WRITING_SYMBOL_ROTATION_COLUMN.primaryKey(),
    //PICTURE_COLUMN,
);

export const SIGN_DIALECT_PHONEMES_TABLE = new Table(
    "sign_dialect_phonemes",
    SIGN_WRITING_SYMBOL_COLUMN,
    getColumnWithForeignKey("dialect_id", new ForeignKey(SIGN_DIALECTS_TABLE, signDialectId))
        .primaryKey(),
);