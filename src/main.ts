const {app, BrowserWindow, shell} = require('electron');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('db/data/phlexicon.db');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 700,
        height: 700
    });
    win.loadFile('build/index.html');
    // Open new tab links outside of application
    win.webContents.setWindowOpenHandler((details: any) => {
        shell.openExternal(details.url); // Open URL in user's browser.
        return { action: "deny" }; // Prevent the app from opening the URL.
    })
};

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    db.close();
    app.quit();
});