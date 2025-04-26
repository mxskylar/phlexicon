import { app, BrowserWindow, shell, ipcMain } from 'electron';
import sqlite3 from 'sqlite3';
import { BUILD_DIR, DATABASE_FILE_PATH } from './build-constants.ts';

// TODO: Expose the database via inter-process communication so it may be queried from the UI
// https://www.electronjs.org/docs/latest/tutorial/ipc
// https://fmacedoo.medium.com/standalone-application-with-electron-react-and-sqlite-stack-9536a8b5a7b9
const db = new sqlite3.Database(DATABASE_FILE_PATH);

const createWindow = () => {
    const win = new BrowserWindow({
        width: 700,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    win.loadFile(`${BUILD_DIR}/index.html`);
    // Open new tab links outside of application
    win.webContents.setWindowOpenHandler((details: any) => {
        shell.openExternal(details.url); // Open URL in user's browser.
        return { action: "deny" }; // Prevent the app from opening the URL.
    })
};

app.whenReady().then(() => {
    createWindow();
});

ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg);
    db.all(arg, (err, rows) => {
        event.reply('asynchronous-reply', (err && err.message) || rows);
    });
});

app.on('window-all-closed', () => {
    db.close();
    app.quit();
});