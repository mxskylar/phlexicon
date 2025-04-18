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

// SPOKEN DIALECTS
export type SpokenDialect = {
    id: string,
    name: string
};
const spokenDialectId = new LengthColumn("id", LengthType.CHAR, 4).primaryKey();
export const SPOKEN_DIALECTS_TABLE = new Table(
    "spoken_dialects",
    spokenDialectId,
    new BasicColumn("name", BasicType.STRING)
);

// IPA phoneme symbols
const ipaPhonemeSymbol = new LengthColumn("symbol", LengthType.VARCHAR, 5).primaryKey();
export const IPA_PHONEME_SYMBOLS_TABLE = new Table("ipa_phoneme_symbols", ipaPhonemeSymbol);

// Other IPA symbols
export const VOWELS_TABLE = new Table(
    "vowels",
    getColumnWithForeignKey(SYMBOL_COLUMN_NAME, new ForeignKey(IPA_PHONEME_SYMBOLS_TABLE, ipaPhonemeSymbol))
        .primaryKey(),
    ...Object.values(VowelAttribute).map(columnName =>
        new BasicColumn(columnName, BasicType.BOOLEAN).required()
    )
);

// Consonants
export const CONSONANTS_TABLE = new Table(
    "consonants",
    getColumnWithForeignKey("symbol", new ForeignKey(IPA_PHONEME_SYMBOLS_TABLE, ipaPhonemeSymbol))
        .primaryKey(),
    // Position in IPA consonant chart: https://en.wikipedia.org/wiki/IPA_consonant_chart_with_audio
    // Place
    new BasicColumn("bilabial", BasicType.BOOLEAN).required(),
    new BasicColumn("labiodental", BasicType.BOOLEAN).required(),
    new BasicColumn("dental", BasicType.BOOLEAN).required(),
    new BasicColumn("alveolar", BasicType.BOOLEAN).required(),
    new BasicColumn("postalveolar", BasicType.BOOLEAN).required(),
    new BasicColumn("retroflex", BasicType.BOOLEAN).required(),
    new BasicColumn("palatal", BasicType.BOOLEAN).required(),
    new BasicColumn("velar", BasicType.BOOLEAN).required(),
    new BasicColumn("uvular", BasicType.BOOLEAN).required(),
    new BasicColumn("pharyngeal", BasicType.BOOLEAN).required(),
    new BasicColumn("epiglottal", BasicType.BOOLEAN).required(),
    new BasicColumn("glottal", BasicType.BOOLEAN).required(),
    // Manner
    new BasicColumn("nasal", BasicType.BOOLEAN).required(),
    new BasicColumn("affricate", BasicType.BOOLEAN).required(),
    new BasicColumn("fricative", BasicType.BOOLEAN).required(),
    new BasicColumn("approximant", BasicType.BOOLEAN).required(),
    new BasicColumn("lateral_approximant", BasicType.BOOLEAN).required(),
    new BasicColumn("flap", BasicType.BOOLEAN).required(),
    new BasicColumn("trill", BasicType.BOOLEAN).required(),
    new BasicColumn("implosive", BasicType.BOOLEAN).required(),
    new BasicColumn("stop", BasicType.BOOLEAN).required(),
    new BasicColumn("lateral_stop", BasicType.BOOLEAN).required(),
    new BasicColumn("click", BasicType.BOOLEAN).required()
);

export const OTHER_IPA_SYMBOLS_TABLE = new Table(
    "other_ipa_symbols",
    new LengthColumn("symbol", LengthType.CHAR, 1).primaryKey()
);

// The Phonemes of Spoken Dialects
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
