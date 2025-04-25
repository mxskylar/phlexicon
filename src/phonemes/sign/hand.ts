import { SignWritingSymbolRotation } from "./sign-writing.ts";

export type Hand = {
    symbol: string,
    handshape: string,
    base_symbol: string,
    symbol_rotation: SignWritingSymbolRotation,
    // Orientation
    right_handed: boolean,
    vertical: boolean,
    palm_towards: boolean | null,
    palm_away: boolean | null,
    palm_sideways: boolean | null,
};

export type HandOrientationPicture = {
    base_symbol: string,
    // Orientation
    right_handed: boolean,
    vertical: boolean,
    palm_towards: boolean | null,
    palm_away: boolean | null,
    palm_sideways: boolean | null,
    //picture: ,
};

export type HandSymbolRotationPicture = {
    base_symbol: string,
    symbol_rotation: SignWritingSymbolRotation,
    right_handed: boolean,
    //picture: ,
};