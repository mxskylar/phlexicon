/**
 * Enums, constants, & types for the x- and y-axes of IPA consonant charts:
 * https://en.wikipedia.org/wiki/IPA_consonant_chart_with_audio
 */

export enum ConsonantAttribute {
    // Place (X-Axis)
    BILABIAL = "bilabial",
    LABIODENTAL = "labiodental",
    DENTAL = "dental",
    ALVEOLAR = "alveolar",
    POSTALVEOLAR = "postalveolar",
    RETROFLEX = "retroflex",
    PALATAL = "palatal",
    VELAR = "velar",
    UVULAR = "uvular",
    PHARYNGEAL = "pharyngeal",
    EPIGLOTTAL = "epiglottal",
    GLOTTAL = "glottal",
    // Manner (Y-Axis)
    NASAL = "nasal",
    AFFRICATE = "affricate",
    FRICATIVE = "fricative",
    APPROXIMANT = "approximant",
    LATERAL_APPROXIMANT = "lateral_approximant",
    FLAP = "flap",
    TRILL = "trill",
    IMPLOSIVE = "implosive",
    STOP = "stop",
    LATERAL_STOP = "lateral_stop",
    CLICK = "click",
    // Movement
    GLIDE = "glide"
};

export type Consonant = {
    symbol: string,
    // Place (X-Axis)
    [ConsonantAttribute.BILABIAL]: string,
    [ConsonantAttribute.LABIODENTAL]: string,
    [ConsonantAttribute.DENTAL]: string,
    [ConsonantAttribute.ALVEOLAR]: string,
    [ConsonantAttribute.POSTALVEOLAR]: string,
    [ConsonantAttribute.RETROFLEX]: string,
    [ConsonantAttribute.PALATAL]: string,
    [ConsonantAttribute.VELAR]: string,
    [ConsonantAttribute.UVULAR]: string,
    [ConsonantAttribute.PHARYNGEAL]: string,
    [ConsonantAttribute.EPIGLOTTAL]: string,
    [ConsonantAttribute.GLOTTAL]: string,
    // Manner (Y-Axis)
    [ConsonantAttribute.NASAL]: string,
    [ConsonantAttribute.AFFRICATE]: string,
    [ConsonantAttribute.FRICATIVE]: string,
    [ConsonantAttribute.APPROXIMANT]: string,
    [ConsonantAttribute.LATERAL_APPROXIMANT]: string,
    [ConsonantAttribute.FLAP]: string,
    [ConsonantAttribute.TRILL]: string,
    [ConsonantAttribute.IMPLOSIVE]: string,
    [ConsonantAttribute.STOP]: string,
    [ConsonantAttribute.LATERAL_STOP]: string,
    [ConsonantAttribute.CLICK]: string,
    // Movement
    [ConsonantAttribute.GLIDE]: string
};

export const CONSONANT_ATTRIBUTE_NAMES = {
    // Place (X-Axis)
    [ConsonantAttribute.BILABIAL]: "Bilabial",
    [ConsonantAttribute.LABIODENTAL]: "Labiodental",
    [ConsonantAttribute.DENTAL]: "Dental",
    [ConsonantAttribute.ALVEOLAR]: "Alveolar",
    [ConsonantAttribute.POSTALVEOLAR]: "Postalveolar",
    [ConsonantAttribute.RETROFLEX]: "Retroflex",
    [ConsonantAttribute.PALATAL]: "Palatal",
    [ConsonantAttribute.VELAR]: "Velar",
    [ConsonantAttribute.UVULAR]: "Uvular",
    [ConsonantAttribute.PHARYNGEAL]: "Pharyngeal",
    [ConsonantAttribute.EPIGLOTTAL]: "Epiglottal",
    [ConsonantAttribute.GLOTTAL]: "Glottal",
    // Manner (Y-Axis)
    [ConsonantAttribute.NASAL]: "Nasal",
    [ConsonantAttribute.AFFRICATE]: "Affricate",
    [ConsonantAttribute.FRICATIVE]: "Fricative",
    [ConsonantAttribute.APPROXIMANT]: "Approximant",
    [ConsonantAttribute.LATERAL_APPROXIMANT]: "Lateral Approximant",
    [ConsonantAttribute.FLAP]: "Flap",
    [ConsonantAttribute.TRILL]: "Trill",
    [ConsonantAttribute.IMPLOSIVE]: "Implosive",
    [ConsonantAttribute.STOP]: "Stop",
    [ConsonantAttribute.LATERAL_STOP]: "Lateral Stop",
    [ConsonantAttribute.CLICK]: "Click",
    // Movement
    [ConsonantAttribute.GLIDE]: "Glide",
};

export const PLACE_CONSONANT_ATTRIBUTES = [
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
    ConsonantAttribute.GLOTTAL,
];

export const MANNER_CONSONANT_ATTRIBUTES = [
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
    ConsonantAttribute.CLICK,
];