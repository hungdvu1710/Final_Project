const { ipcRenderer, remote } = require("electron");
const { resolve } = require("path");

const excerTable = document.querySelector(".all-excercises")
const logOutBtn = document.querySelector("#logOut")
logOutBtn.addEventListener('click',handleLogOut)
const userLoggedIn = new Promise((resolve,reject)=>{
  ipcRenderer.on('user-logged-in',(event,args)=>{
    resolve(args)
  })
})

ipcRenderer.send('get-all-excercises')

ipcRenderer.on('all-excercises-response',(event,args) =>{
  appendRow(args)
})

function appendRow(excercises){
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

async function switchToTestPage(excercise){
  const username = await userLoggedIn
  console.log(username)
  console.log(excercise)
  ipcRenderer.send('req-single-excercise',{excercise,username})
}

function handleLogOut(){
  ipcRenderer.send('log-out-req')
}

ipcRenderer.on('close-excercise-selector-page',(event,args)=>{
  remote.getCurrentWindow().close()
})