/**
 * Enums, constants, & types for the x- and y-axes of IPA consonant charts:
 * https://en.wikipedia.org/wiki/IPA_consonant_chart_with_audio
 */

import { SpokenPhonemeAttributes } from "./spoken-phoneme.ts";

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