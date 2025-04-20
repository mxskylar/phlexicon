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
    {
        name: SignWritingCategory.MOVEMENT,
        range: {min: 0x20500, max: 0x2f657},
    },
    {
        name: SignWritingCategory.DYNAMICS,
        range: {min: 0x2f700, max: 0x2fe07},
    },
    {
        name: SignWritingCategory.HEAD_AND_FACES,
        range: {min: 0x2ff00, max: 0x36c30},
    },
    {
        name: SignWritingCategory.BODY,
        range: {min: 0x36d00, max: 0x37e5f},
    },
];

export const SYMBOL_GROUP_RANGES: FontSection<SignWritingSymbolGroup>[] = [
    {
        name: SignWritingSymbolGroup.INDEX,
        range: {min: 0x10000, max: 0x10d5f},
    },
    {
        name: SignWritingSymbolGroup.INDEX_MIDDLE,
        range: {min: 0x10e00, max: 0x11d5f},
    },
    {
        name: SignWritingSymbolGroup.INDEX_MIDDLE_THUMB,
        range: {min: 0x11e00, max: 0x1435f},
    },
    {
        name: SignWritingSymbolGroup.FOUR_FINGERS,
        range: {min: 0x14400, max: 0x14b5f},
    },
    {
        name: SignWritingSymbolGroup.FIVE_FINGERS,
        range: {min: 0x14c00, max: 0x1855f},
    },
    {
        name: SignWritingSymbolGroup.BABY_FINGER,
        range: {min: 0x18600, max: 0x1a35f},
    },
    {
        name: SignWritingSymbolGroup.RING_FINGER,
        range: {min: 0x1a400, max: 0x1b95f},
    },
    {
        name: SignWritingSymbolGroup.MIDDLE_FINGER,
        range: {min: 0x1ba00, max: 0x1cc5f},
    },
    {
        name: SignWritingSymbolGroup.INDEX_THUMB,
        range: {min: 0x1cd00, max: 0x1f45f},
    },
    {
        name: SignWritingSymbolGroup.THUMB,
        range: {min: 0x1f500, max: 0x2041f},
    },
];

export const BASE_SYMBOL_RANGES: FontSection<SignWritingBaseSymbol>[] = [
    {
        name: SignWritingBaseSymbol.INDEX,
        range: {min: 0x10000, max: 0x1005f}
    },
];