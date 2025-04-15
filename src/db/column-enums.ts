import { BasicColumn, BasicType, isBasicType, LengthColumn, LengthType } from "./column.ts";

export enum DialectType {
    SPOKEN = "spoken",
    SIGN = "sign"
};

export const getColumnFromEnum = (
    enumObject: object,
    name: string,
    type: BasicType | LengthType,
    typeLength: number | null = null
): BasicColumn => {
    const checkStatement =  `IN (${Object.values(enumObject).map(value => `"${value}"`).join(', ')})`;
    if (isBasicType(type)) {
        return new BasicColumn(name, type as BasicType)
            .check(checkStatement);
    }
    return new LengthColumn(name, type as LengthType, typeLength)
            .check(checkStatement);
} 