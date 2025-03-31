import * as fs from 'fs';
import {mkdir} from 'fs/promises';
import * as os from 'os';
import {createRequire} from "module";
import {DATA_DIR, DB_DIR, ISO_LANGUAGES_FILE} from "./db-constants.js";
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3');

const runQueriesFromFile = filePath => {
    const queries = fs.readFileSync(filePath).toString();
    console.log(`Running queries in ${filePath}`);
    db.exec(queries);
};

const insertRows = (tableName, columnNames, rows) => {
    const columns = columnNames.filter(column => column).map(column => "`" + column + "`");
    const queries = ["BEGIN TRANSACTION;"]
    rows.forEach(values => {
        queries.push(`INSERT INTO \`${tableName}\` (${columns.join(", ")}) VALUES (${values.join(", ")});`);
    });
    queries.push("COMMIT;");
    console.log(`Inserting ${rows.length} rows into ${tableName}`);
    db.exec(queries.join(os.EOL));
};

const insertRowsFromSeperatedValuesFile = (tableName, fileName, seperator, overridenColumnNames = null) => {
    const rows = [];
    let i = 0;
    const lines = fs.readFileSync(`${DATA_DIR}/${fileName}`).toString().split(os.EOL);
    const columnNames = overridenColumnNames ? overridenColumnNames : lines[0].split(seperator);
    lines.forEach(line => {
        if (i > 0 && line) {
            const rawValues = line.split(seperator);
            const values = [];
            columnNames.forEach((column, i) => {
                if (column) {
                    const rawValue = rawValues[i];
                    const isInQuotes = rawValue[0] === '"' && rawValue[rawValue.length - 1] === '"';
                    const value = isInQuotes ? rawValue : `"${rawValue}"`
                    values.push(value);
                }
            });
            rows.push(values);
        }
        i++;
    });
    insertRows(tableName, columnNames, rows);
}

if (!fs.existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR);
}
const db = new sqlite3.Database(`${DATA_DIR}/phlexicon.db`);

runQueriesFromFile(`${DB_DIR}/create-tables.sql`);
insertRowsFromSeperatedValuesFile("iso_languages", ISO_LANGUAGES_FILE, "\t", ["id", "inverted_name", "print_name"]);

db.close();