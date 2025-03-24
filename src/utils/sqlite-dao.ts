import * as sqlite3 from 'sqlite3';

export const query = (queryString: string): void => {
    const db = new sqlite3.Database(':memory:');
    db.serialize(() => {
        const result = db.run(queryString);
        console.log(result)
    });
    db.close();
}