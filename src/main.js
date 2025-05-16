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

ipcMain.handle('add-user', async (event, username, email, password_hash, full_name, phone, location) => {
    return new Promise((resolve, reject) => {
        db.addUser(username, email, password_hash, full_name, phone, location);
        resolve('User added successfully.');
    });
});

ipcMain.handle('add-listing', async (event,
    title, price, price_type, condition, location, picture_url, description, 
    make, model, vehicle_type, year_of_manufacture, fuel_or_power, weight, 
    user_id
) => {
    return new Promise((resolve, reject) => {
        db.createListing(
            title, price, price_type, condition, location, picture_url, description, 
            make, model, vehicle_type, year_of_manufacture, fuel_or_power, weight, 
            user_id
        );
        resolve('Listing created successfully.');
    });
});

ipcMain.handle('verify-user-name', async (event, username, password) => {
    try {
        const result = await db.verifyUserByName(username, password);
        return result; 
    } catch (err) {
        console.error("Error verifying user by name:", err.message);
        return false; 
    }
});

ipcMain.handle('verify-user-email', async (event, email, password) => {
    try {
        const result = await db.verifyUserByEmail(email, password);
        return result; 
    } catch (err) {
        console.error("Error verifying user by email:", err.message);
        return false; 
    }
});

// Quit when all windows are closed
app.on('window-all-closed', () => app.quit());