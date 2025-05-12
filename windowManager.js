const { BrowserWindow } = require('electron');
const path = require('node:path');

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            focusable: true,
        },
    });

    win.loadFile('index.html');
    win.webContents.openDevTools({ mode: 'bottom' });

    win.webContents.on('did-finish-load', () => {
        win.webContents.send('window-ready');
    });

    return win;
}

function getWindow() {
    if (!win) throw new Error('Window not created yet!');
    return win;
}

module.exports = { createWindow, getWindow };