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
    BOOLEAN = "BOOLEAN"
}

export enum LengthType {
    CHAR = "CHAR",
    VARCHAR = "VARCHAR"
}

class SqlColumn {
    name: string;
    type: BasicType | LengthType
    protected isRequired: boolean;
    isPrimaryKey: boolean;
    foreignKey: ForeignKey | null;
    protected check: string | null;

    constructor(
        name: string,
        type: BasicType | LengthType,
        isRequired: boolean = false,
        isPrimaryKey: boolean = false,
        foreignKey: ForeignKey | null = null,
        check: string | null = null
    ) {
        this.name = name;
        this.type = type;
        this.isRequired = isRequired;
        this.isPrimaryKey = isPrimaryKey;
        this.foreignKey = foreignKey;
        this.check = check;
    }

    protected getColumnDeclaration(typeDeclaration: string): string {
        const notNullSuffix = this.isRequired ? " NOT NULL" : "";
        const checkClause = this.check ? ` CHECK(\`${this.name}\` ${this.check})` : "";
        return typeDeclaration + notNullSuffix + checkClause;
    }
}

export class BasicColumn extends SqlColumn implements Column {
    constructor(
        name: string,
        type: BasicType,
        isRequired: boolean = false,
        isPrimaryKey: boolean = false,
        foreignKey: ForeignKey | null = null,
        check: string | null = null
    ) {
        super(name, type, isRequired, isPrimaryKey, foreignKey, check);
    }

    public getDeclaration(): string {
        const typeDeclaratrion = "`" + this.name + "` " + this.type.valueOf();
        return this.getColumnDeclaration(typeDeclaratrion);
    }
}

export class LengthColumn extends SqlColumn implements Column {
    typeLength: number;

    constructor(
        name: string,
        type: LengthType,
        typeLength: number,
        isRequired: boolean = false,
        isPrimaryKey: boolean = false,
        foreignKey: ForeignKey | null = null,
        check: string | null = null
    ) {
        super(name, type, isRequired, isPrimaryKey, foreignKey, check);
        this.typeLength = typeLength;
    }

    public getDeclaration(): string {
        const typeDeclaratrion = "`" + this.name + "` " + `${this.type.valueOf()}(${this.typeLength})`;
        return this.getColumnDeclaration(typeDeclaratrion);
    }
}