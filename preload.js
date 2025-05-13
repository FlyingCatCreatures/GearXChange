const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('database', {
    query: (query)=> ipcRenderer.invoke('run-query', query),
});