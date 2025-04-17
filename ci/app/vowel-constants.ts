import { VowelAttribute } from "../../src/db/tables";

export const COLOR_COLUMN_MAP = {
    rounded: [VowelAttribute.ROUNDED],
    palatal: [VowelAttribute.PALATAL],
    labiovelar: [VowelAttribute.LABIOVELAR],
    "advanced-front": [VowelAttribute.FRONT],
    front: [VowelAttribute.FRONT],
    "retracted-front": [VowelAttribute.FRONT],
    "centralized-front": [VowelAttribute.FRONT, VowelAttribute.CENTRAL],
    "advanced-central": [VowelAttribute.CENTRAL],
    central: [VowelAttribute.CENTRAL],
    "centralized-central": [VowelAttribute.CENTRAL],
    "retracted-central": [VowelAttribute.CENTRAL],
    "centralized-back": [VowelAttribute.CENTRAL, VowelAttribute.BACK],
    back: [VowelAttribute.BACK],
    "retracted-back": [VowelAttribute.BACK]
};

export const HEIGHT_COLUMN_MAP = {
    glide: [VowelAttribute.GLIDE],
    higher: [VowelAttribute.CLOSE],
    "raised-high": [VowelAttribute.CLOSE],
    high: [VowelAttribute.CLOSE],
    "lowered-lower-high": [VowelAttribute.NEAR_CLOSE],
    "lower-high": [VowelAttribute.NEAR_CLOSE],
    "lowered-high": [VowelAttribute.NEAR_CLOSE],
    "raised-lower-high": [VowelAttribute.NEAR_CLOSE],
    "raised-higher-mid": [VowelAttribute.CLOSE_MID],
    "higher-mid": [VowelAttribute.CLOSE_MID],
    "lowered-higher-mid": [VowelAttribute.CLOSE_MID],
    "raised-mid": [VowelAttribute.MID],
    mid: [VowelAttribute.MID],
    "raised-lower-mid": [VowelAttribute.OPEN_MID],
    "lower-mid": [VowelAttribute.OPEN_MID],
    "lowered-mid": [VowelAttribute.OPEN_MID],
    "lowered-lower-mid": [VowelAttribute.OPEN_MID],
    "raised-higher-low": [VowelAttribute.OPEN_MID],
    "higher-low": [VowelAttribute.NEAR_OPEN],
    "lowered-higher-low": [VowelAttribute.NEAR_OPEN],
    "raised-low": [VowelAttribute.OPEN],
    "low": [VowelAttribute.OPEN],
    "lowered-low": [VowelAttribute.OPEN],
    lower: [VowelAttribute.OPEN]
};