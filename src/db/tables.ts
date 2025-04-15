import {
    BasicColumn,
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
export const VOWELS_TABLE = new Table(
    "vowels",
    getColumnWithForeignKey("symbol", new ForeignKey(IPA_PHONEME_SYMBOLS_TABLE, ipaPhonemeSymbol))
        .primaryKey(),
    // Position in IPA vowel chart: https://en.wikipedia.org/wiki/IPA_vowel_chart_with_audio
    // X-Axis
    new BasicColumn("front", BasicType.BOOLEAN).required(),
    new BasicColumn("central", BasicType.BOOLEAN).required(),
    new BasicColumn("back", BasicType.BOOLEAN).required(),
    // Y-Axis
    new BasicColumn("close", BasicType.BOOLEAN).required(),
    new BasicColumn("near_close", BasicType.BOOLEAN).required(),
    new BasicColumn("close_mid", BasicType.BOOLEAN).required(),
    new BasicColumn("mid", BasicType.BOOLEAN).required(),
    new BasicColumn("open_mid", BasicType.BOOLEAN).required(),
    new BasicColumn("near_open", BasicType.BOOLEAN).required(),
    new BasicColumn("open", BasicType.BOOLEAN).required()
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
    new BasicColumn("flap", BasicType.BOOLEAN).required(),
    new BasicColumn("trill", BasicType.BOOLEAN).required(),
    new BasicColumn("implosive", BasicType.BOOLEAN).required(),
    new BasicColumn("stop", BasicType.BOOLEAN).required(),
    new BasicColumn("click", BasicType.BOOLEAN).required(),
    new BasicColumn("lateral_approximant", BasicType.BOOLEAN).required(),
    new BasicColumn("lateral_stop", BasicType.BOOLEAN).required()
);

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
