import { ConsonantAttribute } from "../../../src/phonemes/spoken/consonant";
import { SpokenPhonemeAttributes } from "../../../src/phonemes/spoken/spoken-phoneme";

export const CONSONANT_ATTRIBUTES: SpokenPhonemeAttributes = {
    xAxis: {
        attributes: [
            ConsonantAttribute.BILABIAL,
            ConsonantAttribute.LABIODENTAL,
            ConsonantAttribute.DENTAL,
            ConsonantAttribute.ALVEOLAR,
            ConsonantAttribute.POSTALVEOLAR,
            ConsonantAttribute.RETROFLEX,
            ConsonantAttribute.PALATAL,
            ConsonantAttribute.VELAR,
            ConsonantAttribute.UVULAR,
            ConsonantAttribute.PHARYNGEAL,
            ConsonantAttribute.EPIGLOTTAL,
            ConsonantAttribute.GLOTTAL
        ],
        otherAttributes: []
    },
    yAxis: {
        attributes: [
            ConsonantAttribute.NASAL,
            ConsonantAttribute.AFFRICATE,
            ConsonantAttribute.FRICATIVE,
            ConsonantAttribute.APPROXIMANT,
            ConsonantAttribute.LATERAL_APPROXIMANT,
            ConsonantAttribute.FLAP,
            ConsonantAttribute.TRILL,
            ConsonantAttribute.IMPLOSIVE,
            ConsonantAttribute.STOP,
            ConsonantAttribute.LATERAL_STOP,
            ConsonantAttribute.CLICK
        ],
        otherAttributes: [
            ConsonantAttribute.GLIDE
        ]
    }
};