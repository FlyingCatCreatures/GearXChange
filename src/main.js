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
// Quit when all windows are closed
app.on('window-all-closed', () => app.quit());

// The following code manages the IPC (inter process communication) between the main process and the renderer process
// This is where we handle the events sent by preload.js
// We use this to manage the database and the user's permission / login status
// This also exposes the logger to the main process
const logger = require('./logger');
const db = require('./database');
var user = {}
const permissions = function(){
    if(!user) return 'none'; // Not logged in
    else if(user.isAdmin) return 'admin'; // Logged in as admin
    else return 'regular'; // Logged in as regular user
}

ipcMain.handle('run-query', async (event, query) => {
    /*if (permissions() != 'admin') 
        return Promise.reject('Permission denied: Only admins can run  arbitrary queries.');

    else*/ return new Promise((resolve, reject) => {
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
    make, model, vehicle_type, year_of_manufacture, fuel_or_power, weight
) => {
    if(permissions() == 'none')
        return Promise.reject('Permission denied: Only logged in users can create listings.');

    if(!user.user_id)
        return Promise.reject('Permission denied: User ID is not set.'); // This should never be able to happen, but checking can't hurt

    // TODO: Remove the user_id parameter and get the user id from the logged in user
    // That needs to be done so that you can't create listings for other users
    return new Promise((resolve, reject) => {
        db.createListing(
            title, price, price_type, condition, location, picture_url, description, 
            make, model, vehicle_type, year_of_manufacture, fuel_or_power, weight, 
            user.user_id // We know this won't be null or anything because we check if permissions() == 'none' above
        );
        resolve('Listing created successfully.');
    });
});

ipcMain.handle('verify-user-name', async (event, username, password) => {
    try {
        const result = await db.verifyUserByName(username, password);
        if(result) {
            user = { 
                username: username, 
                isAdmin: false , 
                user_id: await db.getIdByUsername(username)
            }; 
        }
        return result; 
    } catch (err) {
        logger.logError("Error verifying user", username, "by name:", err.message);
        return false; 
    }
});

ipcMain.handle('verify-user-email', async (event, email, password) => {
    try {
        const result = await db.verifyUserByEmail(email, password);
        if(result) {
            username = db.getUsernameByEmail(email);
            user = { 
                username: username, 
                isAdmin: false, 
                user_id: db.getIdByUsername(username)
            }; 
        }
        return result; 
    } catch (err) {
        logger.logError("Error verifying user", username, "by email:", err.message);
        return false; 
    }
});

ipcMain.handle('get-logged-in-user-id', async (event) => {
    if (user && user.user_id) {
        return user.user_id;
    } else {
        return null; // User is not logged in
    }
});

ipcMain.handle('log', async (event, message) => {
    logger.log(message);
});
ipcMain.handle('log-error', async (event, message) => {
    logger.error(message);
});
