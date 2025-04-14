import * as fs from 'fs';
import * as csvParse from "csv-parse";
import sqlite3 from "sqlite3";
import {recreateDirectory} from './utils';
import {
    INSTALLED_RESOURCES_DIR
} from './install-constants';

const BUILD_DIR = "build";
recreateDirectory(BUILD_DIR);

console.log(`Copying contents of ${INSTALLED_RESOURCES_DIR} to ${BUILD_DIR}`);
fs.cpSync(INSTALLED_RESOURCES_DIR, BUILD_DIR, {recursive: true});

const CUSTOM_RESOURCES_DIR = "custom-resources";
console.log(`Copying contents of ${CUSTOM_RESOURCES_DIR} to ${BUILD_DIR}`);
fs.cpSync(CUSTOM_RESOURCES_DIR, BUILD_DIR, {recursive: true});

const DATABASE_FILE_PATH = `${BUILD_DIR}/phlexicon.db`;
if (fs.existsSync(DATABASE_FILE_PATH)) {
    console.log(`Deleting existing database: ${DATABASE_FILE_PATH}`);
    fs.rmSync(DATABASE_FILE_PATH);
}
console.log(`Creating database: ${DATABASE_FILE_PATH}`);
const db = new sqlite3.Database(DATABASE_FILE_PATH);

/*aconst runQueriesFromFile = filePath => {
    const queries = fs.readFileSync(filePath).toString();
    console.log(`Running queries in ${filePath}`);
    db.exec(queries);
};

const insertRows = (
    tableName,
    columnNames,
    records,
    customValueParser = (value, i) => false
) => {
    const columns = columnNames.map(column => "`" + column + "`");
    const queries = ["BEGIN TRANSACTION;"]
    const rows = records.map(
        row => row.map((value, i) => {
            const customValue = customValueParser(value, i);
            if (customValue) {
                return customValue;
            }
            if (typeof value === 'string') {
                return `"${value.split('"').join(" || '\"' || ")}"`;
            }
            if (value === null) {
                return "NULL"
            }
            return value;
        })
    );
    rows.forEach(values => {
        queries.push(`INSERT INTO \`${tableName}\` (${columns.join(", ")}) VALUES (${values.join(", ")});`);
    });
    queries.push("COMMIT;");
    console.log(`Inserting ${rows.length} rows into ${tableName}`);
    db.exec(queries.join(os.EOL));
}

const insertRowsFromSeperatedValueFile = async (
    tableName,
    filePath,
    columnOverrides = null,
    parserOptions = {},
    customValueParser = (value, i) => false
) => {
    const records = [];
    const parser = fs
        .createReadStream(filePath)
        .pipe(csvParse.parse(parserOptions));
    for await (const record of parser) {
        const row = columnOverrides
            ? record.filter((_, i) => typeof columnOverrides[i] !== "undefined"  && columnOverrides[i])
            : record;
        records.push(row);
    }
    insertRows(
        tableName,
        columnOverrides ? columnOverrides.filter(c => c) : records[0],
        records.slice(1),
        customValueParser
    );
};

const insertRowsFromJsonFile = async (tableName, filePath) => {
    const {columns, rows} = JSON.parse(fs.readFileSync(filePath).toString());
    await insertRows(tableName, columns, rows);
}

const DATABASE_FILE = `${DATA_DIR}/phlexicon.db`;
// Delete existing data and start fresh
if (fs.existsSync(DATABASE_FILE)) {
    console.log(`Deleting database: ${DATABASE_FILE}`);
    fs.rmSync(DATABASE_FILE);
}
// Create database
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}
const db = new sqlite3.Database(DATABASE_FILE);

// Create tables & views
runQueriesFromFile(`${DB_DIR}/create-tables-views.sql`);

// Insert data for ISO languages
await insertRowsFromSeperatedValueFile(
    "iso_languages",
    `${DATA_DIR}/${ISO_LANGUAGES_FILE}`,
    ["iso_code", null, null, null, null, null, "name", null],
    {delimiter: "\t"}
);

// Insert data into spoken languages
await insertRowsFromSeperatedValueFile(
    "tmp_spoken_phonemes",
    `${DATA_DIR}/${SPOKEN_PHONEMES_FILE}`,
    ["language_id", null, "iso_code", "language_variety", "dialect_description", null, "phoneme"],
    {},
    (value, i) => {
        // If dialect_description column is "NA"
        if (value === "NA" && i === 3) {
            return "NULL";
        }
        return false;
    }
);

// Insert data for sign languages
await insertRowsFromJsonFile("sign_dialects", SIGN_LANGUAGES_FILE_PATH);

// Create tables built from custom queries and drop tables that do not need to be bundled with applicatino
runQueriesFromFile(`${DB_DIR}/etl.sql`);*/

db.close();