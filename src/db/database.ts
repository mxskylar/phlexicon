import * as os from 'os';
import sqlite3 from "sqlite3";
import { Table } from "./table.ts";
import { BasicType, LengthType } from './column.ts';

export class Database {
    private db: sqlite3.Database;

    constructor(filePath: string) {
        this.db = new sqlite3.Database(filePath)
    }

    public exec(query: string): void {
        this.db.exec(query);
    }

    public createTable(table: Table): void {
        const columnDeclarations = table.getColumnDeclarations().join(`,${os.EOL}\t`);
        const query = `CREATE TABLE main.${table.name}(${os.EOL}\t${columnDeclarations}${os.EOL});`;
        console.log(query);
        this.exec(query);
    }

    private getInsertRowQuery(table: Table, values: any[]): string {
        const columnNames = table.columns.map(column => column.name);
        const escapedValues = values.map((value, i) => {
            const type = table.columns[i].type;
            if ([BasicType.STRING, LengthType.CHAR, LengthType.VARCHAR].includes(type)) {
                return `"${value}"`;
            }
            if (type === BasicType.BOOLEAN) {
                return value ? "TRUE" : "FALSE";
            }
            return value;
        });
        return `INSERT INTO \`${table.name}\` (${columnNames.join(", ")}) VALUES (${escapedValues.join(", ")});`;
    }

    public insertRow(table: Table, values: any[]) {
        const query = this.getInsertRowQuery(table, values);
        console.log(query);
        this.exec(query);
    }

    public insertRows(table: Table, rows: Array<Array<any>>): void {
        const queries: string[] = ["BEGIN TRANSACTION;"];
        rows.forEach(values => {
            queries.push(this.getInsertRowQuery(table, values));
        });
        queries.push("COMMIT;");
        console.log(`Inserting ${rows.length} rows into table: ${table.name}`);
        this.exec(queries.join(os.EOL));
    }

    public close(): void {
        this.db.close();
    }
}