import * as fs from 'fs';
import {mkdir} from 'fs/promises';
import * as os from 'os';
import {createRequire} from "module";
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3');

const runQueriesFromFile = filePath => {
    const queries = fs.readFileSync(filePath).toString();
    console.log(`Running queries in ${filePath}`);
    db.exec(queries);
};

const insertRowsFromFile = (filePath, seperator, columnNames, tableName) => {
    const rows = [];
    let i = 0;
    const lines = fs.readFileSync(filePath).toString().split(os.EOL);
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
    const columns = columnNames.filter(column => column).map(column => "`" + column + "`");
    const queries = ["BEGIN TRANSACTION;"]
    rows.forEach(values => {
        queries.push(`INSERT INTO \`${tableName}\` (${columns.join(", ")}) VALUES (${values.join(", ")});`);
    });
    queries.push("COMMIT;");
    console.log(`Inserting ${rows.length} rows into ${tableName}`);
    db.exec(queries.join(os.EOL));
}

const DB_DIR = "db";
const DATA_DIR = `${DB_DIR}/data`;
if (!fs.existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR);
}
const db = new sqlite3.Database(`${DATA_DIR}/phlexicon.db`);

runQueriesFromFile(`${DB_DIR}/create-tables.sql`);
insertRowsFromFile(`${DATA_DIR}/iso-languages.tab`, "\t", ["id", "inverted_name", "print_name"], "iso_languages")

db.close();