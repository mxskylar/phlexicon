import { ipcRenderer } from "electron";

export const query = (query: string) => {
    return new Promise((resolve) => {
        ipcRenderer.once('asynchronous-reply', (_, arg) => {
            resolve(arg);
        });
        ipcRenderer.send('asynchronous-message', query);
    });
};