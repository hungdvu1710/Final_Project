const { ipcRenderer } = require("electron");

ipcRenderer.send('get-all-excercises')