// This is the entry point of the app
const { app, ipcMain } = require('electron')
const path = require('node:path')
// Import function to create window from the windowmanager
const { createWindow, getWindow } = require('./windowManager');

// Lots of errors interacting with GPU and networking if this isnt included
app.commandLine.appendSwitch('no-sandbox')

// Call the createWindow function as soon as possible
app.whenReady().then(()=>createWindow());

// Quit when all windows are closed
app.on('window-all-closed', () => app.quit());

ipcMain.on('goto-page', (event, page) => {
  const window = getWindow();
  window.loadFile(page);
});

ipcMain.handle('get-window', () => {
  return getWindow();
});

const Database = require('./database');
const db = new Database(':memory:');
ipcMain.handle('run-query', async (event, query) => {
  return new Promise((resolve, reject) => {
    db.db.all(query, (err, rows) => {
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