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
const spokenDialectId =
    new LengthColumn("id", LengthType.CHAR, 4)
        .required()
        .primaryKey();
export const SPOKEN_DIALECTS_TABLE = new Table(
    "spoken_dialects",
    spokenDialectId,
    new BasicColumn("name", BasicType.STRING)
);

// IPA Symbols
const getIpaSymbolColumn = () =>
    new LengthColumn("symbol", LengthType.VARCHAR, 5)
        .required()
        .primaryKey();

export const OTHER_IPA_SYMBOLS_TABLE = new Table(
    "other_ipa_symbols",
    getIpaSymbolColumn(),
);

export const VOWELS_TABLE = new Table(
    "vowels",
    getIpaSymbolColumn(),
    ...Object.values(VowelAttribute).map(columnName =>
        new BasicColumn(columnName, BasicType.BOOLEAN)
            .required()
    ),
);

export const CONSONANTS_TABLE = new Table(
    "consonants",
    getIpaSymbolColumn(),
    ...Object.values(ConsonantAttribute).map(columnName =>
        new BasicColumn(columnName, BasicType.BOOLEAN)
            .required()
    ),
);

export const SPOKEN_DIALECT_PHONEMES_TABLE = new Table(
    "spoken_dialect_phonemes",
    getIpaSymbolColumn(),
    getColumnWithForeignKey("dialect_id", new ForeignKey(SPOKEN_DIALECTS_TABLE, spokenDialectId))
        .required()
        .primaryKey(),
);

// SIGN DIALECTS
const signDialectId =
    new LengthColumn("id", LengthType.CHAR, 6)
        .required()
        .primaryKey();
export const SIGN_DIALECTS_TABLE = new Table(
    "sign_dialects",
    signDialectId,
    new BasicColumn("name", BasicType.STRING)
);

// SignWriting Symbols
const getSignWritingSymbolColumn = () => new LengthColumn("symbol", LengthType.CHAR, 1);
const getSignWritingBaseSymbolColumn = () => new LengthColumn("base_symbol", LengthType.CHAR, 1);
const getSignWritingSymbolRotationColumn = () =>
    new BasicColumn("symbol_rotation", BasicType.INTEGER)
        .check(`IN (${CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS.join(", ")})`);

// Palm orientations
const getRightHandedColumn = () => new BasicColumn("right_handed", BasicType.BOOLEAN);
const getVerticalHandColumn = () => new BasicColumn("vertical", BasicType.BOOLEAN);
const getPalmTowardsColumn = () => new BasicColumn("palm_towards", BasicType.BOOLEAN);
const getPalmAwayColumn = () => new BasicColumn("palm_away", BasicType.BOOLEAN);
const getPalmSidewaysColumn = () => new BasicColumn("palm_sideways", BasicType.BOOLEAN);

export const HANDS_TABLE = new Table(
    "hands",
    getSignWritingSymbolColumn()
        .required()
        .primaryKey(),
    new LengthColumn("handshape", LengthType.CHAR, 1)
        .required(),
    getSignWritingBaseSymbolColumn()
        .required(),
    getSignWritingSymbolRotationColumn()
        .required(),
    getRightHandedColumn()
        .required(),
    getVerticalHandColumn()
        .required(),
    getPalmTowardsColumn(),
    getPalmAwayColumn(),
    getPalmSidewaysColumn(),
);

const getHandPictureColumn = () => new BasicColumn("picture", BasicType.BLOB);

export const HAND_ORIENTATION_PICTURES_TABLE = new Table(
    "hand_orientation_pictures",
    getSignWritingBaseSymbolColumn()
        //.primaryKey()
        .required(),
    getVerticalHandColumn()
        //.primaryKey()
        .required(),
    getPalmTowardsColumn()
        //.primaryKey()
        .required(),
    getPalmAwayColumn()
        //.primaryKey()
        .required(),
    getPalmSidewaysColumn()
        //.primaryKey()
        .required(),
    /*getHandPictureColumn()
        .required(),*/
);

export const HAND_SYMBOL_ROTATION_PICTURES_TABLE = new Table(
    "hand_symbol_rotation_pictures",
    getSignWritingBaseSymbolColumn()
        .primaryKey()
        .required(),
    getSignWritingSymbolRotationColumn()
        .primaryKey()
        .required(),
    getRightHandedColumn()
        .primaryKey()
        .required(),
    /*getHandPictureColumn()
        .required(),*/
);

export const SIGN_DIALECT_PHONEMES_TABLE = new Table(
    "sign_dialect_phonemes",
    getSignWritingSymbolColumn(),
    getColumnWithForeignKey("dialect_id", new ForeignKey(SIGN_DIALECTS_TABLE, signDialectId))
        .primaryKey(),
);