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

function openTestPageWindow(excercise){
  const testPageWin = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    }
  })

  testPageWin.loadFile('.\\test_page\\index.html')
  testPageWin.webContents.openDevTools()
  testPageWin.webContents.on('did-finish-load',()=>{
    testPageWin.webContents.send('excercise-to-load',excercise)
  })
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
    } else {
      credentialDb.insert(args)
      openExcerciseSelectorWindow()
      event.sender.send('close-login-page')
    }
  })
})
//#endregion

//#region handle excercise selector window
ipcMain.on('get-all-excercises',(event,args)=>{
  let allExcercises = []
  excerciseDb.find({}, (err, docs) => {
    docs.forEach(element => {
      const {name,questions} = element
      const excerciseLength = questions.length
      allExcercises.push({name,excerciseLength})
    });
    event.sender.send('all-excercises-response',allExcercises)
  })
})
ipcMain.on('req-single-excercise',(event,args)=>{
  excerciseDb.findOne({name: args}, (err,doc)=>{
    openTestPageWindow(doc)
    event.sender.send('close-excercise-selector-page')
  })
})
//#endregion

//#region handle test_page window
function arraysEqual(_arr1, _arr2) {

  if (!Array.isArray(_arr1) || ! Array.isArray(_arr2) || _arr1.length !== _arr2.length)
    return false;

  const arr1 = _arr1.concat().sort();
  const arr2 = _arr2.concat().sort();

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i])
      return false;
  }

  return true;
}

ipcMain.on('user-responses',(event,args)=>{
  const {name,responseSet} = args

  excerciseDb.findOne({name},(e,doc)=>{
    let score = 0
    const {questions} = doc

    for(let i=0; i<questions.length; i++){
      const {rightanswer} = questions[i]
      const {responses} = responseSet[i]

      if(arraysEqual(rightanswer,responses)){
        score++
      }
    }

    dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
      title: "Score",
      message: `You've earned yourself the score of ${score}/${questions.length}`
    }).then(()=>{
      openExcerciseSelectorWindow()
      event.sender.send('close-test-page')
    }).catch(console.error)
    
  })
})
//#endregion