const { ipcRenderer, remote } = require("electron");

const excerTable = document.querySelector(".all-excercises")
const logOutBtn = document.querySelector("#logOut")
logOutBtn.addEventListener('click',handleLogOut)

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

function switchToTestPage(excercise){
  console.log(excercise)
  ipcRenderer.send('req-single-excercise',excercise)
}

function handleLogOut(){
  ipcRenderer.send('log-out-req')
}

ipcRenderer.on('close-excercise-selector-page',(event,args)=>{
  remote.getCurrentWindow().close()
})