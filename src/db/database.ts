import * as os from 'os';
import sqlite3 from "sqlite3";
import { Table } from "./table.ts";

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
        //console.log(query);
        this.exec(query);
    }

    private getInsertRowQuery(
        table: Table,
        row: {[index: string]: string | boolean | number}
    ): string {
        const getEscapedValue = (value: string | boolean | number) => {
            if (typeof value === "string") {
                return `"${value}"`;
            }
            if (typeof value === "boolean") {
                return value ? "TRUE" : "FALSE";
            }
            return value;
        }
        const columnNames = Object.keys(row);
        const values = columnNames.map(key => getEscapedValue(row[key]));
        return `INSERT INTO \`${table.name}\` (${columnNames.join(", ")}) VALUES (${values.join(", ")});`;
    }

    public insertRow(
        table: Table,
        row: {[index: string]: string | boolean | number}
    ) {
        const query = this.getInsertRowQuery(table, row);
        //console.log(query);
        this.exec(query);
    }

    public insertRows(
        table: Table,
        rows: {[index: string]: string | boolean | number}[]
    ): void {
        const queries: string[] = ["BEGIN TRANSACTION;"];
        rows.forEach(row => {
            queries.push(this.getInsertRowQuery(table, row));
        });
        queries.push("COMMIT;");
        console.log(`Inserting ${rows.length} rows into table: ${table.name}`);
        this.exec(queries.join(os.EOL));
    }

    public close(): void {
        this.db.close();
    }
}