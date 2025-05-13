// This is the entry point of the app
const { app, ipcMain, BrowserWindow } = require('electron')
const path = require('path');

// Call the createWindow function as soon as possible
app.whenReady().then(()=>{
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            focusable: true,
        },
    });
    win.loadFile('src/index.html');
    // Open dev tools only when run with npm run dev
    if (process.env.NODE_ENV === 'development') {  
        win.webContents.openDevTools({ mode: 'bottom' });
    }
    win.webContents.on('did-finish-load', () => {
        win.webContents.send('window-ready');
    });
    return win;
});     

const db = require('./database');
ipcMain.handle('run-query', async (event, query) => {
    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) {
                reject(err.message);
            } else if (rows.length > 0) {
                resolve(rows); // Return the query results if they're nonempty
            } else {
                resolve('Query executed successfully'); // Return success message if no rows are returned
            }
        });
    });
});

// Quit when all windows are closed
app.on('window-all-closed', () => app.quit());