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
import { CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS } from "../phonemes/sign/sign-writing.ts";

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
const getIpaSymbolColumn = () => new LengthColumn("symbol", LengthType.VARCHAR, 5);

export const OTHER_IPA_SYMBOLS_TABLE = new Table(
    "other_ipa_symbols",
    getIpaSymbolColumn()
        .required()
        .primaryKey(),
);

export const VOWELS_TABLE = new Table(
    "vowels",
    getIpaSymbolColumn()
        .required()
        .primaryKey(),
    ...Object.values(VowelAttribute).map(columnName =>
        new BasicColumn(columnName, BasicType.BOOLEAN)
            .required()
    ),
);

export const CONSONANTS_TABLE = new Table(
    "consonants",
    getIpaSymbolColumn()
        .required()
        .primaryKey(),
    ...Object.values(ConsonantAttribute).map(columnName =>
        new BasicColumn(columnName, BasicType.BOOLEAN)
            .required()
    ),
);

export const SPOKEN_DIALECT_PHONEMES_TABLE = new Table(
    "spoken_dialect_phonemes",
    getIpaSymbolColumn()
        .required()
        .primaryKey(),
    getColumnWithForeignKey("dialect_id", new ForeignKey(SPOKEN_DIALECTS_TABLE, spokenDialectId))
        .required()
        .primaryKey(),
);

// SIGN DIALECTS
const signLanguageIsoCode =
    new LengthColumn("iso_code", LengthType.CHAR, 3)
        .required()
        .primaryKey();
const signDialectRegion =
    new BasicColumn("region", BasicType.STRING)
        .required()
        .primaryKey();
export const SIGN_DIALECTS_TABLE = new Table(
    "sign_dialects",
    signLanguageIsoCode,
    signDialectRegion,
    new BasicColumn("name", BasicType.STRING)
        .required(),
);

// SignWriting Symbols
const getSignWritingSymbolRotationColumn = () =>
    new BasicColumn("symbol_rotation", BasicType.INTEGER)
        .check(`IN (${CLOCKWISE_SIGN_WRITING_SYMBOL_ROTATIONS.join(", ")})`);
const getRightHandedColumn = () => new BasicColumn("right_handed", BasicType.BOOLEAN);
const getVerticalHandColumn = () => new BasicColumn("vertical", BasicType.BOOLEAN);
const getPalmTowardsColumn = () => new BasicColumn("palm_towards", BasicType.BOOLEAN);
const getPalmAwayColumn = () => new BasicColumn("palm_away", BasicType.BOOLEAN);
const getPalmSidewaysColumn = () => new BasicColumn("palm_sideways", BasicType.BOOLEAN);

const handBaseSymbol =
    new LengthColumn("base_symbol", LengthType.CHAR, 1)
        .required();
export const HANDS_TABLE = new Table(
    "hands",
    new LengthColumn("symbol", LengthType.CHAR, 1)
        .required()
        .primaryKey(),
    new LengthColumn("handshape", LengthType.CHAR, 1)
        .required(),
    handBaseSymbol,
    getSignWritingSymbolRotationColumn()
        .required(),
    new BasicColumn("rotatable_finger_direction", BasicType.BOOLEAN)
        .required(),
    getRightHandedColumn()
        .required(),
    getVerticalHandColumn()
        .required(),
    getPalmTowardsColumn()
        .required(),
    getPalmAwayColumn()
        .required(),
    getPalmSidewaysColumn()
        .required(),
);

const getPalmDirectionIdColumn = () => new BasicColumn("id", BasicType.STRING);

export const PALM_DIRECTIONS_TABLE = new Table(
    "palm_directions",
    getColumnWithForeignKey("base_symbol", new ForeignKey(HANDS_TABLE, handBaseSymbol))
        .primaryKey()
        .required(),
    getVerticalHandColumn()
        .primaryKey()
        .required(),
    getPalmTowardsColumn()
        .primaryKey()
        .required(),
    getPalmAwayColumn()
        .primaryKey()
        .required(),
    getPalmSidewaysColumn()
        .primaryKey()
        .required(),
    getPalmDirectionIdColumn()
        .unique()
        .required(),
);

export const ROTATABLE_PALM_DIRECTIONS_TABLE = new Table(
    "rotatable_palm_directions",
    getColumnWithForeignKey("base_symbol", new ForeignKey(HANDS_TABLE, handBaseSymbol))
        .primaryKey()
        .required(),
    getSignWritingSymbolRotationColumn()
        .primaryKey()
        .required(),
    getPalmDirectionIdColumn()
        .unique(),
);

export const SIGN_DIALECT_PHONEMES_TABLE = new Table(
    "sign_dialect_phonemes",
    getColumnWithForeignKey("base_symbol", new ForeignKey(HANDS_TABLE, handBaseSymbol))
        .required()
        .primaryKey(),
    getColumnWithForeignKey("iso_code", new ForeignKey(SIGN_DIALECTS_TABLE, signLanguageIsoCode))
        .required()
        .primaryKey(),
    getColumnWithForeignKey("region", new ForeignKey(SIGN_DIALECTS_TABLE, signDialectRegion))
        .required()
        .primaryKey(),
);