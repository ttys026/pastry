const { contextBridge, ipcRenderer } = require('electron');

window.ipcRenderer = ipcRenderer;

// contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);