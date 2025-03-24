const { app, BrowserWindow, shell } = require('electron');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600
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