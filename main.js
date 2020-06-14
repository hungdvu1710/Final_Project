const { 
  app, 
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  Tray,
  clipboard } = require('electron')
const fetch = require('electron-fetch').default
const path = require('path')