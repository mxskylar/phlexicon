/**
 * Enums, constants, & types for the x- and y-axes of the IPA vowel chart:
 * https://en.wikipedia.org/wiki/IPA_vowel_chart_with_audio
 * 
 * Additional attributes associated with each axis are also included.
 * These attributes are not on either the x- or y-axis, strictly speaking,
 * but they are associated with either axis in the raw data.
 * For each axis, these attributes are:
 *  - X-Axis: The "color" of the vowel
 *  - Y-Axis: How the vowel may move up or down the axis, e.g. how it may glide
 */

export enum VowelAttribute {
    // X-AXIS
    FRONT = "front",
    CENTRAL = "central",
    BACK = "back",
    // Color
    ROUNDED = "rounded",
    PALATAL = "palatal",
    LABIOVELAR = "labiovelar",
    // Y-AXIS
    CLOSE = "close",
    NEAR_CLOSE = "near_close",
    CLOSE_MID = "close_mid",
    MID = "mid",
    OPEN_MID = "open_mid",
    NEAR_OPEN = "near_open",
    OPEN = "open",
    // Movement
    GLIDE = "glide"
};

export type Vowel = {
    symbol: string,
    // X-Axis
    [VowelAttribute.FRONT]: boolean,
    [VowelAttribute.CENTRAL]: boolean,
    [VowelAttribute.BACK]: boolean,
    // Color
    [VowelAttribute.ROUNDED]: boolean,
    [VowelAttribute.PALATAL]: boolean,
    [VowelAttribute.LABIOVELAR]: boolean,
    // Y-AXIS
    [VowelAttribute.CLOSE]: boolean,
    [VowelAttribute.NEAR_CLOSE]: boolean,
    [VowelAttribute.CLOSE_MID]: boolean,
    [VowelAttribute.MID]: boolean,
    [VowelAttribute.OPEN_MID]: boolean,
    [VowelAttribute.NEAR_OPEN]: boolean,
    [VowelAttribute.OPEN]: boolean,
    // Movement
    [VowelAttribute.GLIDE]: boolean
};