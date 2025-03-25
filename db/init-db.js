const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

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

const db = new sqlite3.Database('db/phlexicon.db');

runQueriesFromFile('db/create-tables.sql');

db.close();