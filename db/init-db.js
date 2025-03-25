import * as fs from 'fs';
import {mkdir} from 'fs/promises';
import {createRequire} from "module";
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3');

const runQueriesFromFile = filePath => {
    const fileContents = fs.readFileSync(filePath).toString();
    const queries = fileContents.split(";").map(q => q.trim()).filter(q => q !== "");
    queries.forEach((query, i) => {
        console.log(`${i !== 0 ? "\n" : ""}Executing query...`)
        console.log(query);
        db.serialize(() => {
            db.run(query);
        });
    });
};

const dataDir = "db/data"
if (!fs.existsSync(dataDir)) {
    await mkdir(dataDir);
}
const db = new sqlite3.Database(`${dataDir}/phlexicon.db`);

runQueriesFromFile('db/create-tables.sql');

db.close();