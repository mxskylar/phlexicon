import opentype from 'opentype.js';
import { SignWritingBaseSymbol, SignWritingBlock, SignWritingCategory, SignWritingSymbolGroup } from '../../src/phonemes/sign/sign-writing';

type Range = {
    min: number,
    max: number,
};

// Returns true if number is in inclusive range
const inRange = (number: number, range: Range) => {
    const {max, min} = range;
    if (range.max < range.min) {
        throw new Error(`Failed to determine if ${number} is in range ${min}-${max} because max is less than min`);
    }
    return number >= min && number <= max;
};

const CATEGORY_RANGES: {[key in SignWritingCategory]: Range} = {
    [SignWritingCategory.HANDS]: {
        min: 0x10000,
        max: 0x2041f,
    },
};

const SYMBOL_GROUP_RANGES: {[key in SignWritingSymbolGroup]: Range} = {
    [SignWritingSymbolGroup.INDEX]: {
        min: 0x10000,
        max: 0x10d5f,
    },
};

const BASE_SYMBOL_RANGES: {[key in SignWritingBaseSymbol]: Range} = {
    [SignWritingBaseSymbol.INDEX]: {
        min: 0x10000,
        max: 0x1005f,
    },
};

export class SignWritingFontSymbol {
    glyph: opentype.Glyph;
    character: string;
    number: number;
    category: SignWritingCategory | undefined;
    symbolGroup: SignWritingBlock | undefined;
    baseSymbol: SignWritingBlock | undefined;

    constructor(glyph: opentype.Glyph, character: string, number: number) {
        this.glyph = glyph;
        this.character = character;
        this.number = number;
        const category = this.getSectionKey(CATEGORY_RANGES);
        if (category) {
            this.category = SignWritingCategory[category];
        }
        const symbolGroup = this.getSectionKey(SYMBOL_GROUP_RANGES);
        if (symbolGroup) {
            this.symbolGroup = SignWritingSymbolGroup[symbolGroup];
        }
        const baseSymbol = this.getSectionKey(BASE_SYMBOL_RANGES);
        if (baseSymbol) {
            this.baseSymbol = SignWritingBaseSymbol[baseSymbol];
        }
    }

    private getSectionKey(sectionMap: {[index: string | number]: Range}): string | undefined {
        const ranges = Object.values(sectionMap);
        const keys = Object.keys(sectionMap);
        for (const i in ranges) {
            const range = ranges[i];
            if (inRange(this.number, range)) {
                return keys[i];
            }
        }
    }
}