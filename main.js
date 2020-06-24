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

function openExcerciseSelectorWindow(username){
  const excerciseSelectWin = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    }
  })

  excerciseSelectWin.loadFile('.\\excercise_selector\\index.html')
  excerciseSelectWin.webContents.openDevTools()
  excerciseSelectWin.webContents.on('did-finish-load',()=>{
    excerciseSelectWin.webContents.send('user-logged-in',username)
  })
}

let adminWin

function openAdminWindow(){
  adminWin = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  })

  adminWin.loadFile('.\\admin\\index.html')
  // adminWin.webContents.openDevTools()
}

function openExcerciseEditorWindow(name){
  const excerciseEditor = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    parent: adminWin,
    modal: true  
  })
  excerciseEditor.loadFile('.\\single_excercise_editor\\index.html')
  excerciseEditor.webContents.on('did-finish-load',()=>{
    excerciseEditor.webContents.send('excercise-to-edit',name)
  })
  excerciseEditor.webContents.openDevTools()
}

function openTestPageWindow(testInfo){ //testInfo includes the excercise and the username of the test taker
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
    testPageWin.webContents.send('excercise-to-load',testInfo)
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
      openExcerciseSelectorWindow(username)
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
      credentialDb.insert({username, password, record: []})
      openExcerciseSelectorWindow(username)
      event.sender.send('close-login-page')
    }
  })
})
//#endregion

// Excercise GET request used for both admin and excercise-selector
ipcMain.on('get-all-excercises',(event,args)=>{
  let allExcercises = []
  excerciseDb.find({}, (err, docs) => {
    docs.forEach(element => {
      const {name,questions,givenTime} = element
      const excerciseLength = questions.length
      allExcercises.push({name,excerciseLength,givenTime})
    });
    event.sender.send('all-excercises-response',allExcercises)
  })
})

//#region handle excercise selector window
ipcMain.on('req-single-excercise',(event,args)=>{
  const {username,excercise} = args
  excerciseDb.findOne({name: excercise}, (err,doc)=>{
    openTestPageWindow({username,excercise:doc})
    event.sender.send('close-excercise-selector-page')
  })
})

ipcMain.on('log-out-req',(event,args)=>{
  createLogInWindow()
  event.sender.send('close-excercise-selector-page')
})

ipcMain.on('get-user-record',(event,args)=>{
  credentialDb.findOne({username:args},(err,doc)=>{
    const {record} = doc
    event.sender.send("user-record-response",record)
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
  const {name,responseSet,username} = args

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
      openExcerciseSelectorWindow("Hoho") //hard fixed
      event.sender.send('close-test-page')
    }).catch(console.error)
    
    credentialDb.findOne({username},(e,doc)=>{
      const {record} = doc
      console.log(record)
      const oldResult = record.filter(element=>element.excercise === name)
      
      if(oldResult[0]){
        
        console.log(oldResult)

        credentialDb.update({username},{$pull: {record: oldResult[0]}},{},(e,numReplaced)=>{
          console.log(numReplaced)
          oldResult[0].score = score

          credentialDb.update({username},{$push: {record: oldResult[0]}},{},(e,numReplaced)=>{
            console.log(numReplaced)
          })
        })
      } else{
        credentialDb.update({username},{$push: {record: {excercise: name, score}}},{},(e,numReplaced)=>{
          console.log(numReplaced)
        })
      }
      
    })
  })
})
//#endregion

//#region handle admin window
ipcMain.on('admin-log-out-req',(event,args)=>{
  createLogInWindow()
  event.sender.send('close-admin-window')
})
ipcMain.on('get-all-users',(event,args)=>{
  let allUsers = []
  credentialDb.find({}, (err, docs) => {
    event.sender.send('all-users-response',docs)
  })
})
ipcMain.on('open-editor',(event,args)=>{
  excerciseDb.findOne(args,(e,doc)=>{
    console.log(doc)
    openExcerciseEditorWindow(doc)
  })
  
})

ipcMain.on('add-new-excercise',(event,args)=>{
  const {newExcerciseName,timeAllowed} = args
  excerciseDb.insert({name:newExcerciseName,givenTime:timeAllowed,questions:[]})
  openExcerciseEditorWindow(newExcerciseName)
})
//#endregion

//#region handle single excercise editor
ipcMain.on('update-excercise',(event,args)=>{
  // console.log(args)
  const {name} = args
  excerciseDb.remove({name},{},(err,numRemoved)=>{
    console.log(numRemoved)
  })
  excerciseDb.insert(args)
})