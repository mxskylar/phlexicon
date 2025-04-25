import { SignWritingCategory } from "../src/phonemes/sign/sign-writing";

export type SignWritingCategoryBlock = {
    name: SignWritingCategory,
    symbolId: string,
    startNumber: number,
};

export type SignWritingBlock = {
    name: string,
    symbolId: string,
    startNumber: number,
    symbol: string,
};