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
import { FingerDirection, PalmDirection } from "../phonemes/sign/hand.ts";

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

export const HANDSHAPES_TABLE = new Table(
    "handshapes",
    SIGN_WRITING_SYMBOL_COLUMN,
);

export const HANDS_TABLE = new Table(
    "hands",
    SIGN_WRITING_SYMBOL_COLUMN,
    getColumnWithForeignKey("handshape", new ForeignKey(HANDSHAPES_TABLE, SIGN_WRITING_SYMBOL_COLUMN)),
    new BasicColumn("palm_direction", BasicType.STRING).required()
        .check(`IN (${Object.values(PalmDirection).map(val => `"${val}"`).join(", ")})`),
    new BasicColumn("finger_direction", BasicType.STRING).required()
        .check(`IN (${Object.values(FingerDirection).map(val => `"${val}"`).join(", ")})`),
    new BasicColumn("is_right_handed", BasicType.BOOLEAN).required(),
);

export const SIGN_DIALECT_PHONEMES_TABLE = new Table(
    "sign_dialect_phonemes",
    SIGN_WRITING_SYMBOL_COLUMN,
    getColumnWithForeignKey("dialect_id", new ForeignKey(SIGN_DIALECTS_TABLE, signDialectId))
        .primaryKey(),
);