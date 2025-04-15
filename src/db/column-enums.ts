import { BasicColumn } from "./column.ts";

export enum DialectType {
    SPOKEN = "spoken",
    SIGN = "sign"
};

export const getBasicColumnFromEnum = (
    name: string,
    type: BasicType,
    enumObject: object
): BasicColumn => {
    return new BasicColumn(
        name, type, true, false, null,
        `IN (${Object.values(enumObject).map(value => `"${value}"`).join(', ')})`
    );
} 