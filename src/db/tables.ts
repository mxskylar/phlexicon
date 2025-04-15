import {
    BasicColumn,
    BasicType,
    LengthColumn,
    LengthType
} from "./column.ts";
import { DialectType, getBasicColumnFromEnum } from "./column-enums.ts";
import { Table } from "./table.ts";

const dialectName = new LengthColumn("name", LengthType.VARCHAR, 100, true, true);
export const DIALECTS_TABLE = new Table(
    "dialects",
    dialectName,
    getBasicColumnFromEnum("type", BasicType.STRING, DialectType)
);

const ipaPhonemeSymbol = new LengthColumn("symbol", LengthType.VARCHAR, 5, true, true);
export const IPA_PHONEMES_TABLE = new Table(
    "ipa_phonemes",
    ipaPhonemeSymbol
);

export const EXTRA_IPA_SYMBOLS_TABLE = new Table(
    "extra_ipa_symbols",
    new LengthColumn("symbol", LengthType.CHAR, 1, true, true)
);