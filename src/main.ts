import { app, BrowserWindow, ipcMain, shell } from 'electron';
import sqlite3 from 'sqlite3';
import { BUILD_DIR, DATABASE_FILE_PATH } from './build-constants.ts';

const IS_DEV = !app.isPackaged;
const db = new sqlite3.Database(DATABASE_FILE_PATH);

const createWindow = () => {
    const window = new BrowserWindow({
        width: IS_DEV ? 1400 : 875,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    // Open new tab links outside of application
    window.webContents.setWindowOpenHandler((details: any) => {
        shell.openExternal(details.url); // Open URL in user's browser.
        return {action: "deny"}; // Prevent the app from opening the URL.
    });
    window.loadFile(`${BUILD_DIR}/index.html`);
    if (IS_DEV) {
        window.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    createWindow();
});

ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg);
    db.all(arg, (err, rows) => {
        event.reply('asynchronous-reply', (err && err.message) || rows);
    });
});

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        db.close();
        app.quit();
    }
});

// Create a new window when the app is activated (macOS)
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});