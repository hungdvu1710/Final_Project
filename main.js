'use strict';
const { 
  app,
  BrowserWindow,
  ipcMain,
  dialog
} = require('electron')
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
}

function openExcerciseSelectorWindow(username){
  const excerciseSelectWin = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  excerciseSelectWin.loadFile('.\\excercise_selector\\index.html')
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
}

function openExcerciseEditorWindow(excercise){
  const excerciseEditor = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true
    },
    parent: adminWin,
    modal: true  
  })
  excerciseEditor.loadFile('.\\single_excercise_editor\\index.html')

  excerciseEditor.webContents.on('did-finish-load',()=>{
    excerciseEditor.webContents.send('excercise-to-edit',excercise)
    dialog.showMessageBox(excerciseEditor,{
      type: "info",
      title: "Instructions",
      message: "This is your excercise editor, you can update amount of time allowed for the test, and the questions' properties. Remember to add answers and pick at least 1 rightanswer for each question, or else your question won't show on the test taker window"
    })
  })

}

function openTestPageWindow(testInfo){ //testInfo includes the excercise and the username of the test taker
  const testPageWin = new BrowserWindow({
    fullscreen: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  testPageWin.loadFile('.\\test_page\\index.html')
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

//#region handle excercise selector window

function getExcerciseLengthForClient(questions){
  let excerciseLength = questions.length

  if(questions.length > 0){

    questions.forEach(question=>{
      const {rightanswer,answers,accessibility} = question

      if(rightanswer.length == 0 || answers.length == 0 || accessibility == "disabled"){
        excerciseLength--
      }
    })
  }

  return excerciseLength
}

ipcMain.on('get-all-excercises-client',(event,args)=>{
  let allExcercises = []
  excerciseDb.find({}, (err, docs) => {

    docs.forEach(element => {
      const {name,questions,givenTime} = element
      const excerciseLength = getExcerciseLengthForClient(questions)      

      if(excerciseLength != 0){
        allExcercises.push({name,excerciseLength,givenTime})
      }

    })

    event.sender.send('all-excercises-response',allExcercises)
  })
})

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
  if (!Array.isArray(_arr1)) return false
  if (!Array.isArray(_arr2)) return false

  return _arr1.sort().join(',') === _arr2.sort().join(',')
}

ipcMain.on('user-responses',(event,args)=>{
  const {name,responseSet,username} = args

  excerciseDb.findOne({name},(e,doc)=>{
    let score = 0
    const {questions} = doc

    for(let i=0; i<questions.length; i++){
      const {rightanswer} = questions[i]
      const {responses} = responseSet[i]
      if(rightanswer.length == 0){
        continue
      }
      if(arraysEqual(rightanswer,responses)){
        score++
      }
    }

    dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
      title: "Score",
      message: `You've earned yourself the score of ${score}/${getExcerciseLengthForClient(questions)}`
    }).then(()=>{
      openExcerciseSelectorWindow("Hoho") //hard fixed
      event.sender.send('close-test-page')
    }).catch(console.error)
    
    credentialDb.findOne({username},(e,doc)=>{
      const {record} = doc
      const oldResult = record.filter(element=>element.excercise === name)
      
      if(oldResult[0]){
        

        credentialDb.update({username},{$pull: {record: oldResult[0]}},{},()=>{
          oldResult[0].score = score

          credentialDb.update({username},{$push: {record: oldResult[0]}},{},(_,numReplaced)=>{
            console.log(`Replaced: ${numReplaced}`)
          })
        })
      } else{
        credentialDb.update({username},{$push: {record: {excercise: name, score}}},{},(e,numReplaced)=>{
          console.log(`Replaced: ${numReplaced}`)
        })
      }
      
    })
  })
})
//#endregion

//#region handle admin window
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

ipcMain.on('admin-log-out-req',(event,args)=>{
  createLogInWindow()
  event.sender.send('close-admin-window')
})

ipcMain.on('get-all-users',(event,args)=>{
  credentialDb.find({}, (err, docs) => {
    event.sender.send('all-users-response',docs)
  })
})

ipcMain.on('open-editor',(event,args)=>{
  excerciseDb.findOne(args,(e,doc)=>{
    openExcerciseEditorWindow(doc)
  })
  
})

ipcMain.on('add-new-excercise',(event,args)=>{
  const {newExcerciseName,timeAllowed} = args

  excerciseDb.insert({name:newExcerciseName,givenTime:timeAllowed,questions:[]},(err,doc)=>{
    openExcerciseEditorWindow(doc)
  })

})

ipcMain.on('replace-excercise',(event,args)=>{
  const {newExcerciseName,timeAllowed} = args

  excerciseDb.remove({name:newExcerciseName},{},(err,numRemoved)=>{
    excerciseDb.insert({name:newExcerciseName,givenTime:timeAllowed,questions:[]},(err,doc)=>{
      openExcerciseEditorWindow(doc)
    })
  })
  
})

ipcMain.on('delete-test',(event,args)=>{

  credentialDb.find({},(e,docs)=>{

    docs.forEach(doc=>{
      const {record,username} = doc

      if(username === "admin"){
        return
      }

      const oldResult = record.filter(element=>element.excercise === args)
      
      if(oldResult[0]){

        credentialDb.update({username},{$pull: {record: oldResult[0]}},{},(e,numReplaced)=>{
          console.log(`Replaced: ${numReplaced}`)
        })
      } 
    })
  })

  excerciseDb.remove({name:args},{},(err,numRemoved)=>{
    console.log(`Removed: ${numRemoved}`)
  })
})
//#endregion

//#region handle single excercise editor
ipcMain.on('update-excercise',(event,args)=>{
  const {name} = args

  excerciseDb.remove({name},{},(err,numRemoved)=>{
    console.log(numRemoved)
  })

  excerciseDb.insert(args,(err,newDoc)=>{
    const {name,questions,givenTime} = newDoc
    const excerciseLength = questions.length
    adminWin.webContents.send("update-excercise",{excerciseLength,name,givenTime})
  })

  event.sender.send("close-editor")
})
//#endregion