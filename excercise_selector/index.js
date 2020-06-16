const { ipcRenderer } = require("electron");

const excerTable = document.querySelector(".all-excercises")

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
        <button id="${name}" class="excerciseChoice" onclick="switchToTestPage()">Choose</button>
      </td>
    `
  })
}