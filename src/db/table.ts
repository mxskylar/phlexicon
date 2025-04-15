import { Column } from "./column.ts";

export class Table {
    name: string;
    columns: Column[]

    constructor(name: string, ...columns: Column[]) {
        this.name = name;
        if (columns.length < 1) {
            throw Error("Table must have at least one column");
        }
        this.columns = columns;
    }

    public getColumnDeclarations(): string[] {
        const primaryKeys = this.columns.filter(column => column.isPrimaryKey);
        const foreignKeyDeclarations = this.columns.filter(column => column.foreignKey)
            .map(column => `FOREIGN KEY (\`${column.name}\`) ${column.foreignKey?.getDeclaration()}`);
        // Composite primary key
        if (primaryKeys.length > 1) {
            return [
                ...this.columns.map(column => column.getDeclaration()),
                ...foreignKeyDeclarations,
                `PRIMARY KEY (${primaryKeys.map(column => "`" + column.name + "`").join(", ")})`
            ];
        }
        // Single primary key
        return [
            ...this.columns.map(column => {
                const dec = column.getDeclaration();
                if (column.isPrimaryKey) {
                    return `${dec} PRIMARY KEY`;
                }
                return dec;
            }),
            ...foreignKeyDeclarations,
        ];
    }
}