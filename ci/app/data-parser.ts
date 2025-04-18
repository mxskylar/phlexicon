export enum DataType {
    TABLE = "TABLE",
    FILE = "FILE"
} 

export type DataWarning = {
    dataName: string,
    dataType: DataType,
    message: string
}

export interface DataParser {
    warnings: DataWarning[];
}