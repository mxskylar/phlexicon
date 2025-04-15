import { Column } from "./column.ts";
import { Table } from "./table.ts";

export class ForeignKey {
    private table: Table;
    column: Column;

    constructor(table: Table, column: Column) {
        this.table = table;
        this.column = column;
    }

    public getDeclaration(): string {
        return `REFERENCES ${this.table.name}(\`${this.column.name}\`)`;
    }
}