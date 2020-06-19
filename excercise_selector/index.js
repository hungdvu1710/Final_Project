const { ipcRenderer, remote } = require("electron");
const { resolve } = require("path");

const excerTable = document.querySelector(".all-excercises")
const recordTable = document.querySelector(".records")
const logOutBtn = document.querySelector("#logOut")
logOutBtn.addEventListener('click',handleLogOut)

const userLoggedIn = new Promise((resolve,reject)=>{
  ipcRenderer.on('user-logged-in',(event,args)=>{
    resolve(args)
  })
})

ipcRenderer.send('get-all-excercises')
getUserRecord()

ipcRenderer.on('all-excercises-response',(event,args) =>{
  appendExcerciseRow(args)
})

ipcRenderer.on("user-record-response",(event,args)=>{
  appendRecordRow(args)
})

function appendExcerciseRow(excercises){
  console.log(excercises)

  excercises.forEach(excercise =>{
    const newRow = excerTable.insertRow(-1)
    const {name,excerciseLength} = excercise
    
    newRow.innerHTML =`
      <td>${name}</td>
      <td>${excerciseLength}</td>
      <td>
        <button class="excerciseChoice" onclick="switchToTestPage('${name}')">Choose</button>
      </td>
    `
  })
}

function appendRecordRow(record){
  record.forEach(element=>{
    const newRow = recordTable.insertRow(-1)
    const {excercise, score} = element

    newRow.innerHTML =`
      <td>${excercise}</td>
      <td>${score}</td>
    `
  })
}

async function switchToTestPage(excercise){
  const username = await userLoggedIn
  ipcRenderer.send('req-single-excercise',{excercise,username})
}

async function getUserRecord(){
  const username = await userLoggedIn
  ipcRenderer.send('get-user-record',username)
}

function handleLogOut(){
  ipcRenderer.send('log-out-req')
}

ipcRenderer.on('close-excercise-selector-page',(event,args)=>{
  remote.getCurrentWindow().close()
})