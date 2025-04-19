import opentype from 'opentype.js';
import { SignWritingBaseSymbol, SignWritingCategory, SignWritingSymbolGroup } from '../../src/phonemes/sign/sign-writing';
import { BASE_SYMBOL_RANGES, CATEGORY_RANGES, FontSection, inRange, SYMBOL_GROUP_RANGES } from './sign-writing-font';

export class SignWritingFontSymbol {
    glyph: opentype.Glyph;
    character: string;
    number: number;
    category: SignWritingCategory;
    symbolGroup: SignWritingSymbolGroup;
    baseSymbol: SignWritingBaseSymbol;

    constructor(glyph: opentype.Glyph, character: string, number: number) {
        this.glyph = glyph;
        this.character = character;
        this.number = number;
        const category = this.getSectionKey(CATEGORY_RANGES);
        if (category) {
            this.category = category;
        }
        const symbolGroup = this.getSectionKey(SYMBOL_GROUP_RANGES);
        if (symbolGroup) {
            this.symbolGroup = symbolGroup;
        }
        const baseSymbol = this.getSectionKey(BASE_SYMBOL_RANGES);
        if (baseSymbol) {
            this.baseSymbol = baseSymbol;
        }
    }

    private getSectionKey<Type>(ranges: FontSection<Type>[]): Type | undefined {
        for (const i in ranges) {
            const section = ranges[i];
            if (inRange(this.number, section.range)) {
                return section.name;
            }
        }
    }
}