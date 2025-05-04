import { app, BrowserWindow, ipcMain, shell, globalShortcut } from 'electron';
import sqlite3 from 'sqlite3';
import { BUILD_DIR, DATABASE_FILE_NAME, DEV_DATABASE_FILE_PATH } from './build-constants.ts';

const IS_DEV = !app.isPackaged;
const db = new sqlite3.Database(
    IS_DEV ? DEV_DATABASE_FILE_PATH : DATABASE_FILE_NAME
);

const createWindow = () => {
    const window = new BrowserWindow({
        width: IS_DEV ? 1250 : 850,
        height: 850,
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

// Register then unregister keyboard shortcuts
// to prevent refreshing the page and breaking the app
// on ctrl / cmd + R or F5
app.on('browser-window-focus', function () {
    globalShortcut.register("CommandOrControl+R", () => {});
    globalShortcut.register("F5", () => {});
});
app.on('browser-window-blur', function () {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('F5');
});

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