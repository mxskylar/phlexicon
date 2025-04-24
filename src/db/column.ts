import { ForeignKey } from "./foreign-key.ts";

export interface Column {
    name: string;
    type: BasicType | LengthType;
    isPrimaryKey: boolean;
    foreignKey: ForeignKey | null;
    getDeclaration(): string;
}

export enum BasicType {
    STRING = "STRING",
    BOOLEAN = "BOOLEAN",
    INTEGER = "INTEGER",
    BLOB = "BLOB",
}

const ALL_BASIC_TYPES: string[] = [
    BasicType.STRING,
    BasicType.BOOLEAN,
    BasicType.INTEGER,
    BasicType.BLOB,
]

export const isBasicType = (value: string) => ALL_BASIC_TYPES.includes(value);

export enum LengthType {
    CHAR = "CHAR",
    VARCHAR = "VARCHAR"
}

class SqlColumn {
    name: string;
    type: BasicType | LengthType
    protected isRequired: boolean = false;
    isPrimaryKey: boolean = false;
    foreignKey: ForeignKey | null = null;
    protected checkStatement: string | null = null;
    protected isUnique: boolean = false;

    constructor(name: string, type: BasicType | LengthType) {
        this.name = name;
        this.type = type;
    }

    protected getColumnDeclaration(typeDeclaration: string): string {
        const notNullSuffix = this.isRequired ? " NOT NULL" : "";
        const uniqueSuffix = this.isUnique ? " UNIQUE" : "";
        const checkClause = this.checkStatement ? ` CHECK(\`${this.name}\` ${this.checkStatement})` : "";
        return typeDeclaration + notNullSuffix + uniqueSuffix + checkClause;
    }

    public required() {
        this.isRequired = true;
        return this;
    }

    public primaryKey() {
        this.isPrimaryKey = true;
        return this;
    }

    public withForeignKey(foreignKey: ForeignKey) {
        this.foreignKey = foreignKey;
        return this;
    }

    public check(checkStatement: string) {
        this.checkStatement = checkStatement;
        return this;
    }

    public unique() {
        this.isUnique = true;
        return this;
    }
}

export class BasicColumn extends SqlColumn implements Column {
    constructor(name: string, type: BasicType) {
        super(name, type);
    }

    public getDeclaration(): string {
        const typeDeclaratrion = "`" + this.name + "` " + this.type.valueOf();
        return this.getColumnDeclaration(typeDeclaratrion);
    }
}

export class LengthColumn extends SqlColumn implements Column {
    typeLength: number;

    constructor(name: string, type: LengthType, typeLength: number) {
        super(name, type);
        this.typeLength = typeLength;
    }

    public getDeclaration(): string {
        const typeDeclaratrion = "`" + this.name + "` " + `${this.type.valueOf()}(${this.typeLength})`;
        return this.getColumnDeclaration(typeDeclaratrion);
    }
}

export const getColumnWithForeignKey = (name: string, foreignKey: ForeignKey) => {
    const type = foreignKey.column.type;
    if (isBasicType(type)) {
        return new BasicColumn(name, type as BasicType)
            .withForeignKey(foreignKey);
    }
    const typeLength = (foreignKey.column as LengthColumn).typeLength;
    return new LengthColumn(name, type as LengthType, typeLength)
        .withForeignKey(foreignKey);
}