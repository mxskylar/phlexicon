import { SignWritingBaseSymbol, SignWritingCategory, SignWritingSymbolGroup } from "../../../src/phonemes/sign/sign-writing";

export type Range = {
    min: number,
    max: number,
};

// Returns true if number is in inclusive range
export const inRange = (number: number, range: Range) => {
    const {max, min} = range;
    if (range.max < range.min) {
        throw new Error(`Failed to determine if ${number} is in range ${min}-${max} because max is less than min`);
    }
    return number >= min && number <= max;
};

export type FontSection<Type> = {
    name: Type
    range: Range
};

export const CATEGORY_RANGES: FontSection<SignWritingCategory>[] = [
    {
        name: SignWritingCategory.HANDS,
        range: {min: 0x10000, max: 0x2041f},
    },
];

export const SYMBOL_GROUP_RANGES: FontSection<SignWritingSymbolGroup>[] = [
    {
        name: SignWritingSymbolGroup.INDEX,
        range: {min: 0x10000, max: 0x10d5f},
    },
];

export const BASE_SYMBOL_RANGES: FontSection<SignWritingBaseSymbol>[] = [
    {
        name: SignWritingBaseSymbol.INDEX,
        range: {min: 0x10000, max: 0x1005f}
    },
];