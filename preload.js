// Exposed apis to the main world from the renderer process
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  gotoPage: (page) => ipcRenderer.send('goto-page', page),
  getWindow: () => {return ipcRenderer.sendSync('get-window');},
  on: (event, callback) => {ipcRenderer.on(event, callback);},
  database:  () => ipcRenderer.invoke('get-db')
});

contextBridge.exposeInMainWorld('database', {
  query: (query)=> ipcRenderer.invoke('run-query', query),
});
