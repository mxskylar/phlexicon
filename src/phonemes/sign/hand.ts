import { SignWritingSymbolRotation } from "./sign-writing.ts";

export type Hand = {
    symbol: string,
    handshape: string,
    base_symbol: string,
    symbol_rotation: SignWritingSymbolRotation,
    // True when the symbol_rotation represents the direction of fingers
    // False when the symbol_rotation represents palm orientation
    // without changing the direction of fingers
    rotatable_finger_direction: boolean,
    right_handed: boolean,
    vertical: boolean,
    palm_towards: boolean,
    palm_away: boolean,
    palm_sideways: boolean,
};

export type PalmDirection = {
    base_symbol: string,
    vertical: boolean,
    palm_towards: boolean,
    palm_away: boolean,
    palm_sideways: boolean,
    id: string,
};

export type RotatablePalmDirection = {
    base_symbol: string,
    symbol_rotation: SignWritingSymbolRotation,
    id: string | null,
};