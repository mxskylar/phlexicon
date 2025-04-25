import { SpokenPhonemeAttributes } from "../../../src/phonemes/spoken/spoken-phoneme";
import { VowelAttribute } from "../../../src/phonemes/spoken/vowel";

export const VOWEL_ATTRIBUTES: SpokenPhonemeAttributes = {
    xAxis: {
        attributes: [
            VowelAttribute.FRONT,
            VowelAttribute.CENTRAL,
            VowelAttribute.BACK
        ],
        otherAttributes: [
            VowelAttribute.ROUNDED,
            VowelAttribute.PALATAL,
            VowelAttribute.LABIOVELAR
        ]
    },
    yAxis: {
        attributes: [
            VowelAttribute.CLOSE,
            VowelAttribute.NEAR_CLOSE,
            VowelAttribute.CLOSE_MID,
            VowelAttribute.MID,
            VowelAttribute.OPEN_MID,
            VowelAttribute.NEAR_OPEN,
            VowelAttribute.OPEN
        ],
        otherAttributes: [VowelAttribute.GLIDE]
    }
};