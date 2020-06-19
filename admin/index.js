const {ipcRenderer,remote} = require('electron')

const excerTable = document.querySelector(".all-excercises")
const logOutBtn = document.querySelector("#logOut")
logOutBtn.addEventListener('click',handleLogOut)

ipcRenderer.send('get-all-excercises')

ipcRenderer.on('all-excercises-response',(event,args) =>{
  appendExcerciseRow(args)
})

function appendExcerciseRow(excercises){
  console.log(excercises)

  excercises.forEach(excercise =>{
    const newRow = excerTable.insertRow(-1)
    const {name,excerciseLength,givenTime} = excercise
    
    newRow.innerHTML =`
      <td>${name}</td>
      <td>${excerciseLength}</td>
      <td>${givenTime}</td>
      <td>
        <button class="excerciseEditor" onclick="editTest('${name}')">Edit</button>
      </td>
      <td>
        <button class="excerciseRemoval" onclick="deleteTest('${name}')">Delete</button>
      </td>
    `
  })
}

function handleLogOut(){
  ipcRenderer.send('admin-log-out-req')
}

ipcRenderer.on('close-admin-window',(event,args)=>{
  remote.getCurrentWindow().close()
})