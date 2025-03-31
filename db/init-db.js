import * as fs from 'fs';
import {mkdir} from 'fs/promises';
import * as os from 'os';
import {createRequire} from "module";
import * as csvParse from "csv-parse";
import {
    DATA_DIR,
    DB_DIR,
    ISO_LANGUAGES_FILE,
    SIGN_LANGUAGES_FILE_PATH,
    SPOKEN_LANGUAGES_FILE,
    SPOKEN_PHONEMES_FILE
} from "./db-constants.js";
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3');

const runQueriesFromFile = filePath => {
    const queries = fs.readFileSync(filePath).toString();
    console.log(`Running queries in ${filePath}`);
    db.exec(queries);
};

const insertRows = (tableName, columnNames, records) => {
    const columns = columnNames.map(column => "`" + column + "`");
    const queries = ["BEGIN TRANSACTION;"]
    const rows = records.map(
        row => row.map(
            value => typeof value === 'string' ? `"${value.split('"').join(" || '\"' || ")}"`: value
        )
    );
    rows.forEach(values => {
        queries.push(`INSERT INTO \`${tableName}\` (${columns.join(", ")}) VALUES (${values.join(", ")});`);
    });
    queries.push("COMMIT;");
    console.log(`Inserting ${rows.length} rows into ${tableName}`);
    db.exec(queries.join(os.EOL));
}

const insertRowsFromSeperatedValueFile = async (tableName, filePath, columnOverrides = null, parserOptions = {}) => {
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
        records.slice(1)
    );
};

const insertRowsFromJsonFile = async (tableName, filePath) => {
    const {columns, rows} = JSON.parse(fs.readFileSync(filePath).toString());
    await insertRows(tableName, columns, rows);
}

// Create database
if (!fs.existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR);
}
const db = new sqlite3.Database(`${DATA_DIR}/phlexicon.db`);

// Create tables & views
runQueriesFromFile(`${DB_DIR}/create-tables-views.sql`);

// Insert data for ISO languages
await insertRowsFromSeperatedValueFile("languages", `${DATA_DIR}/${ISO_LANGUAGES_FILE}`, ["iso_code", null, null, null, null, null, "language_name", null], {delimiter: "\t"});

// Insert data into spoken languages
await insertRowsFromSeperatedValueFile("spoken_phonemes", `${DATA_DIR}/${SPOKEN_PHONEMES_FILE}`, ["variety_id", null, "language_variety", "dialect_description", null, null, "phoneme"]);

// Insert data for sign languages
await insertRowsFromJsonFile("sign_languages", SIGN_LANGUAGES_FILE_PATH);

// Create tables built from custom queries and drop tables that do not need to be bundled with applicatino
//runQueriesFromFile(`${DB_DIR}/etl.sql`);

db.close();