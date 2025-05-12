// Needed for page switching
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  gotoPage: (page) => ipcRenderer.send('goto-page', page),
  getWindow: () => {return ipcRenderer.sendSync('get-window');},
  on: (event, callback) => {ipcRenderer.on(event, callback);}
});