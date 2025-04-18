export enum DataType {
    TABLE = "table",
    FILE = "file"
} 

export type DataWarning = {
    dataName: string,
    dataType: DataType,
    message: string
}

export interface DataParser {
    warnings: DataWarning[];
}