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

//#region load databases
const credentialDb = new dataStore({filename: path.join(__dirname, 'credentials.db')})
credentialDb.loadDatabase()

const excerciseDb = new dataStore({filename: path.join(__dirname, 'excercises.db')})
excerciseDb.loadDatabase()
//#endregion

//#region window creators
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

function openAdminWindow(){
  const adminWin = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    }
  })

  adminWin.loadFile('.\\admin\\index.html')
  adminWin.webContents.openDevTools()
}
//#endregion
app.on('ready', createLogInWindow)

//#region handle login window
ipcMain.on('log-in-req', (event, args) =>{
  const { username, password } = args
  if(username == 'admin' && password == 'admin1234'){
    openAdminWindow()
    event.sender.send('close-login-page')
    return
  }

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
  const { username, password } = args
  credentialDb.findOne({ username }, (err, doc)=>{
    if(doc){
      dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
        type: "error",
        message:"Username already existed"
      }).catch(console.error)
      return
    }
  })

  credentialDb.insert(args)
  openExcerciseSelectorWindow()
  event.sender.send('close-login-page')
})
//#endregion

credentialDb.find({}, function (err, docs) {
  console.log(docs)
})
//#region handle excercise selector window