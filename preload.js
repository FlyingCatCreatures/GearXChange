// Needed for page switching
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  gotoPage: (page) => ipcRenderer.send('goto-page', page),
  getWindow: () => {return ipcRenderer.sendSync('get-window');},
  once: (event, callback) => {ipcRenderer.once(event, callback);}
});
  