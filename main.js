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

  
  logInWin.loadFile('.\\login_page\\index.html')
  // Open the DevTools.
  logInWin.webContents.openDevTools()
}

function createExcerciseSelectorWindow(){
  excerciseSelectWin = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    }
  })

  excerciseSelectWin.loadFile('.\\exercise_selector\\index.html')
  // Open the DevTools.
  excerciseSelectWin.webContents.openDevTools()
}

app.on('ready', createLogInWindow)

ipcMain.on('log-in-req', (event,args) =>{
  const {username, password} = args
  credentialDb.find({ username: username }, (err, docs)=>{
    console.log(docs)
    if(!docs[0]){
      dialog.showMessageBox(logInWin,{
        type: "error",
        message:"Username or Password is incorrect"
      }).catch(console.log)
      return
    }

    if(password == docs[0].password){
      console.log("success")
      logInWin.close()
      logInWin.once("close",createExcerciseSelectorWindow)
      
    }
  })
})

ipcMain.on('sign-up-req', (event,args) =>{
  credentialDb.insert(args)
})
