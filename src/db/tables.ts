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
import { SYMBOL_COLUMN_NAME } from "../phonemes/phoneme.ts";
import { ConsonantAttribute } from "../phonemes/spoken/consonant.ts";

// SPOKEN DIALECTS
const spokenDialectId = new LengthColumn("id", LengthType.CHAR, 4).primaryKey();
export const SPOKEN_DIALECTS_TABLE = new Table(
    "spoken_dialects",
    spokenDialectId,
    new BasicColumn("name", BasicType.STRING)
);

// IPA Symbols
const ipaPhonemeSymbol = new LengthColumn("symbol", LengthType.VARCHAR, 5).primaryKey();
export const IPA_PHONEME_SYMBOLS_TABLE = new Table("ipa_phoneme_symbols", ipaPhonemeSymbol);

export const OTHER_IPA_SYMBOLS_TABLE = new Table(
    "other_ipa_symbols",
    new LengthColumn("symbol", LengthType.CHAR, 1).primaryKey()
);

export const VOWELS_TABLE = new Table(
    "vowels",
    getColumnWithForeignKey(SYMBOL_COLUMN_NAME, new ForeignKey(IPA_PHONEME_SYMBOLS_TABLE, ipaPhonemeSymbol))
        .primaryKey(),
    ...Object.values(VowelAttribute).map(columnName =>
        new BasicColumn(columnName, BasicType.BOOLEAN).required()
    )
);

export const CONSONANTS_TABLE = new Table(
    "consonants",
    getColumnWithForeignKey("symbol", new ForeignKey(IPA_PHONEME_SYMBOLS_TABLE, ipaPhonemeSymbol))
        .primaryKey(),
    ...Object.values(ConsonantAttribute).map(columnName =>
        new BasicColumn(columnName, BasicType.BOOLEAN).required()
    )
);

// Phonemes
export const SPOKEN_DIALECT_PHONEMES_TABLE = new Table(
    "spoken_dialect_phonemes",
    getColumnWithForeignKey("dialect_id", new ForeignKey(SPOKEN_DIALECTS_TABLE, spokenDialectId))
        .primaryKey(),
    getColumnWithForeignKey("symbol", new ForeignKey(IPA_PHONEME_SYMBOLS_TABLE, ipaPhonemeSymbol))
        .primaryKey()
);

// SIGN DIALECTS
const signDialectId = new LengthColumn("id", LengthType.CHAR, 6).primaryKey();
export const SIGN_DIALECTS_TABLE = new Table(
    "sign_dialects",
    signDialectId,
    new BasicColumn("name", BasicType.STRING)
);

// SignWriting Symbols

// Oriented Handshape Symbols

// Movement Symbols

// Location & Expression Symbols

// The Phonemes of Sign Dialects
