import {
    BasicType,
    getColumnWithForeignKey,
    LengthColumn,
    LengthType
} from "./column.ts";
import { DialectType, getColumnFromEnum } from "./column-enums.ts";
import { Table } from "./table.ts";
import { ForeignKey } from "./foreign-key.ts";

// SPOKEN DIALECTS
const spokenDialectName = new LengthColumn("name", LengthType.VARCHAR, 100).primaryKey();
export const SPOKEN_DIALECTS_TABLE = new Table(
    "spoken_dialects",
    spokenDialectName,
    getColumnFromEnum(DialectType, "type", BasicType.STRING)
);

// IPA phoneme symbols
const ipaPhonemeSymbol = new LengthColumn("symbol", LengthType.VARCHAR, 5).primaryKey();
export const IPA_PHONEME_SYMBOLS_TABLE = new Table("ipa_phoneme_symbols", ipaPhonemeSymbol);

// Other IPA symbols
export const OTHER_IPA_SYMBOLS_TABLE = new Table(
    "other_ipa_symbols",
    new LengthColumn("symbol", LengthType.CHAR, 1).primaryKey()
);

// Vowels

// Consonants

// The Phonemes of Spoken Dialects
export const SPOKEN_DIALECT_PHONEMES_TABLE = new Table(
    "spoken_dialect_phonemes",
    getColumnWithForeignKey("dialect", new ForeignKey(SPOKEN_DIALECTS_TABLE, spokenDialectName))
        .primaryKey(),
    getColumnWithForeignKey("symbol", new ForeignKey(IPA_PHONEME_SYMBOLS_TABLE, ipaPhonemeSymbol))
        .primaryKey()
);

// SIGN DIALECTS

// SignWriting Symbols

// Oriented Handshape Symbols

// Movement Symbols

// Location & Expression Symbols

// The Phonemes of Sign Dialects
