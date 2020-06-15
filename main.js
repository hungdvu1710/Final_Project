'use strict';
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
const dataStore = require('nedb')
const credentialDb = new dataStore({filename: path.join(__dirname, 'credentials.db')})
credentialDb.loadDatabase()

function createLogInWindow () {
  let loginWindow = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    }
  })

  loginWindow.loadFile('.\\login_page\\index.html')
  loginWindow.webContents.openDevTools()
}

function openExcerciseSelectorWindow(){
  const excerciseSelectWin = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    }
  })

  excerciseSelectWin.loadFile('.\\excercise_selector\\index.html')
  excerciseSelectWin.webContents.openDevTools()
}

app.on('ready', createLogInWindow)

ipcMain.on('log-in-req', (event, args) =>{
  const { username, password } = args
  credentialDb.findOne({ username }, (err, doc)=>{
    if(!doc || (password != doc.password)){
      dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
        type: "error",
        message:"Username or Password is incorrect"
      }).catch(console.error)
      return
    }

    if (password == doc.password) {
      openExcerciseSelectorWindow()
      event.sender.send('close-login-page')
    }
  })
})

ipcMain.on('sign-up-req', (event,args) =>{
  credentialDb.insert(args)

  openExcerciseSelectorWindow()
  event.sender.send('close-login-page')
})
