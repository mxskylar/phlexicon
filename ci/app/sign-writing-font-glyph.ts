import opentype from 'opentype.js';
import { SignWritingCategory } from '../../src/phonemes/sign/sign-writing';

const inRange = (number: number | null, min: number, max: number) =>
    number && number >= min && number <= max;

const FIRST_HANDSHAPE = 0x10000;
const LAST_HANDSHAPE = 0x2041f;

export class SignWritingFontSymbol {
    glyph: opentype.Glyph;
    character: string;
    category: SignWritingCategory;
    parent: string;

    constructor(glyph: opentype.Glyph, character: string) {
        this.glyph = glyph;
        this.character = character;
        const type = this.getType();
        if (type) {
            this.category = type;
        }
        const parent = this.getParent()
        if (parent) {
            this.parent = parent;
        }
    }

    private getGlyphNumber(glyph: opentype.Glyph): number | null {
        const match = glyph.name.match(/S([0-9a-fA-F]+)/);
        if (match) {
            return new Number(`0x${match[1]}`) as number;
        }
        return null
    }

    private getType(): SignWritingCategory | undefined {
        const glyphNumber = this.getGlyphNumber(this.glyph);
        // https://www.signbank.org/iswa/cat_1.html
        if (inRange(glyphNumber, FIRST_HANDSHAPE, LAST_HANDSHAPE)) {
            return SignWritingCategory.HANDS
        }
    }

    private getParent(): string | undefined {
        const glyphNumber = this.getGlyphNumber(this.glyph);
        // https://www.signbank.org/iswa/100/100_bs.html
        if (inRange(glyphNumber, FIRST_HANDSHAPE, 0x1005f)) {
            return "񀀁"
        }
        // TODO: Add checks for all handshapes: https://www.signbank.org/iswa/cat_1.html
    }
}