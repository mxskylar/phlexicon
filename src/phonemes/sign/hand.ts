export type Hand = {
    symbol: string,
    handshape: string,
    palm_direction: PalmDirection,
    finger_direction: FingerDirection,
    is_right_handed: boolean,
};

// https://www.signwriting.org/lessons/lessonsw/033%20Palm-Facing.html
export enum PalmDirection {
    FRONT_VIEW_FORWARD = "FRONT_VIEW_FORWARD",
    FRONT_VIEW_SIDEWAYS = "FRONT_VIEW_SIDEWAYS",
    FRONT_VIEW_REVERSED = "FRONT_VIEW_REVERSED",
    TOP_VIEW_UP = "TOP_VIEW_UP",
    TOP_VIEW_SIDEWAYS = "TOP_VIEW_SIDEWAYS",
    TOP_VIEW_DOWN = "TOP_VIEW_DOWN"
}

export const PALM_DIRECTIONS = [
    PalmDirection.FRONT_VIEW_FORWARD,
    PalmDirection.FRONT_VIEW_SIDEWAYS,
    PalmDirection.FRONT_VIEW_REVERSED,
    PalmDirection.TOP_VIEW_UP,
    PalmDirection.TOP_VIEW_SIDEWAYS,
    PalmDirection.TOP_VIEW_DOWN
]

// 360 Degree Compass
export enum FingerDirection {
    DEGREES_0_or_360 = 0,
    DEGREES_315 = 315,
    DEGREES_270 = 270,
    DEGREES_225 = 225,
    DEGREES_180 = 180,
    DEGREES_135 = 135,
    DEGREES_90 = 90,
    DEGREES_45 = 45
}

export const CLOCKWISE_FINGER_DIRECTIONS = [
    FingerDirection.DEGREES_0_or_360,
    FingerDirection.DEGREES_45,
    FingerDirection.DEGREES_90,
    FingerDirection.DEGREES_135,
    FingerDirection.DEGREES_180,
    FingerDirection.DEGREES_225,
    FingerDirection.DEGREES_270,
    FingerDirection.DEGREES_315
];

export const COUNTER_CLOCKWISE_FINGER_DIRECTIONS = [
    FingerDirection.DEGREES_0_or_360,
    FingerDirection.DEGREES_315,
    FingerDirection.DEGREES_270,
    FingerDirection.DEGREES_225,
    FingerDirection.DEGREES_180,
    FingerDirection.DEGREES_135,
    FingerDirection.DEGREES_90,
    FingerDirection.DEGREES_45
];