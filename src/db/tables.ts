import { BasicColumn, BasicType, LengthColumn, LengthType } from "./column.ts";
import { DialectType } from "./dialect-type.ts";
import { Table } from "./table.ts";

const dialectName = new LengthColumn("name", LengthType.VARCHAR, 100, true, true);
export const DIALECTS_TABLE = new Table(
    "dialects",
    dialectName,
    new BasicColumn(
        "type",
        BasicType.STRING,
        true,
        false,
        null,
        `IN (${Object.values(DialectType).map(value => `"${value}"`).join(', ')})`
    )
);