import * as fs from 'fs';
import {mkdir} from 'fs/promises';
import {createRequire} from "module";
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3');

const runQueriesFromFile = filePath => {
    const queries = fs.readFileSync(filePath).toString();
    console.log(`Running queries in ${filePath}`);
    db.exec(queries);
};

const dataDir = "db/data"
if (!fs.existsSync(dataDir)) {
    await mkdir(dataDir);
}
const db = new sqlite3.Database(`${dataDir}/phlexicon.db`);

runQueriesFromFile('db/create-tables.sql');

db.close();