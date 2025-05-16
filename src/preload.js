const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('database', {
    query: (query)=> ipcRenderer.invoke('run-query', query),
    addUser: (username, email, password, full_name, phone, location)=> ipcRenderer.invoke('add-user', username, email, password, full_name, phone, location),
    addListing: (        
        title, price, price_type, condition, location, picture_url, description, 
        make, model, vehicle_type, year_of_manufacture, fuel_or_power, weight
    )=> ipcRenderer.invoke('add-listing',
        title, price, price_type, condition, location, picture_url, description, 
        make, model, vehicle_type, year_of_manufacture, fuel_or_power, weight
    ),
    verifyUserByEmail: (email, password)=> ipcRenderer.invoke('verify-user-email', email, password),
    verifyUserByName: (username, password)=> ipcRenderer.invoke('verify-user-name', username, password),
    getLoggedInUserId: ()=> ipcRenderer.invoke('get-logged-in-user-id'),
});