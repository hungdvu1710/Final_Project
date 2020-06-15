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
  // Create the browser window.
  logInWin = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  logInWin.loadFile('.\\login_page\\index.html')
  // Open the DevTools.
  logInWin.webContents.openDevTools()
}

app.on('ready', createLogInWindow)

ipcMain.on('log-in-req', (event,args) =>{
  const {user, pass} = args
  console.log(user)
  console.log(pass)
  credentialDb.find({ username: user }, (err, docs)=>{
    console.log(docs)
    if(!docs[0]){
      console.log("error")
      return
    }
    const {password} = docs[0]
    if(pass == password){
      console.log("success")
    }
  })
})