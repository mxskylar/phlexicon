import {
    BasicColumn,
    BasicType,
    LengthColumn,
    LengthType
} from "./column.ts";
import { DialectType, getBasicColumnFromEnum } from "./column-enums.ts";
import { Table } from "./table.ts";
import { ForeignKey } from "./foreign-key.ts";

// SPOKEN DIALECTS
const SPOKEN_DIALECT_NAME_MAX_LENGTH = 100;
const spokenDialectName = new LengthColumn(
    "name", LengthType.VARCHAR, SPOKEN_DIALECT_NAME_MAX_LENGTH, true, true
);
export const SPOKEN_DIALECTS_TABLE = new Table(
    "spoken_dialects",
    spokenDialectName,
    getBasicColumnFromEnum("type", BasicType.STRING, DialectType)
);

// IPA phoneme symbols
const IPA_PHONEME_SYMBOL_MAX_LENGTH = 5;
const ipaPhonemeSymbol = new LengthColumn(
    "symbol", LengthType.VARCHAR, IPA_PHONEME_SYMBOL_MAX_LENGTH, true, true
);
export const IPA_PHONEME_SYMBOLS_TABLE = new Table(
    "ipa_phoneme_symbols",
    ipaPhonemeSymbol
);

// Other IPA symbols
export const OTHER_IPA_SYMBOLS_TABLE = new Table(
    "other_ipa_symbols",
    new LengthColumn("symbol", LengthType.CHAR, 1, true, true)
);

// Vowels

// Consonants

// The Phonemes of Spoken Dialects
export const SPOKEN_DIALECT_PHONEMES_TABLE = new Table(
    "spoken_dialect_phonemes",
    new LengthColumn(
        "dialect", LengthType.VARCHAR, SPOKEN_DIALECT_NAME_MAX_LENGTH, true, true,
        new ForeignKey(SPOKEN_DIALECTS_TABLE, spokenDialectName)
    ),
    new LengthColumn(
        "symbol", LengthType.VARCHAR, IPA_PHONEME_SYMBOL_MAX_LENGTH, true, true,
        new ForeignKey(IPA_PHONEME_SYMBOLS_TABLE, ipaPhonemeSymbol)
    )
)

// SIGN DIALECTS

// SignWriting Symbols

// Oriented Handshape Symbols

// Movement Symbols

// Location & Expression Symbols

// The Phonemes of Sign Dialects
