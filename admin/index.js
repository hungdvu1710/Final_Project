const {ipcRenderer,remote} = require('electron')
const {dialog} = remote

const excerTable = document.querySelector(".allExcercises")
const userTable = document.querySelector(".allUsers")
const logOutBtn = document.querySelector("#logOut")
const excerciseNameInput = document.querySelector(".excerciseName")
const timeAllowedInput = document.querySelector(".timeAllowed")

const invalidCharsInTime = ["-", "+", "e", "E"]

timeAllowedInput.addEventListener("keydown", function (e) {
  if (invalidCharsInTime.includes(e.key)) {
    e.preventDefault()
  }
})

document.querySelector(".addingFormOpener").addEventListener("click",openForm)
document.querySelector(".submitBtn").addEventListener("click",submitNewExcercise)
document.querySelector(".cancelBtn").addEventListener("click",closeForm)
logOutBtn.addEventListener('click',handleLogOut)
document.querySelector("form").addEventListener("submit", (e) => e.preventDefault())

ipcRenderer.send('get-all-excercises')
ipcRenderer.send('get-all-users')

ipcRenderer.on('all-excercises-response',(event,args) =>{
  appendExcerciseRow(args)
})
ipcRenderer.on('all-users-response',(event,args)=>{
  appendUserRow(args)
})
ipcRenderer.on('update-excercise',(event,args)=>{
  console.log(args)
  updateRow(args)
})

function appendExcerciseRow(excercises){

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

    newRow.setAttribute("class",name)
  })
}

function appendUserRow(users){
  console.log(users)

  users.forEach(user=>{
    const {username,record} = user
    if(username != 'admin'){
      const newRow = userTable.insertRow(-1)

      const nameTag = document.createElement("td")
      nameTag.innerText = username
      newRow.appendChild(nameTag)

      const recordTag = document.createElement("td")
      recordTag.appendChild(addSingleRecord(record))
      newRow.appendChild(recordTag)
    }
  })
}

function addSingleRecord(record){
  const recordDropdown = document.createElement("div")
  recordDropdown.setAttribute("class","dropdown")

  const dropBtn = document.createElement("button")
  dropBtn.setAttribute("class","dropBtn")
  dropBtn.innerHTML =`
    Record
    <i class="fa fa-caret-down"></i>
  `
  recordDropdown.appendChild(dropBtn)

  const dropContent = document.createElement("div")
  dropContent.setAttribute("class","dropdownContent")
  recordDropdown.appendChild(dropContent)

  record.forEach(element =>{
    if(element){
      const {excercise,score} = element

      const recordText = document.createElement("p")
      recordText.innerText = `${excercise}: ${score}`

      dropContent.appendChild(recordText)
    }
  })

  return recordDropdown
}

function openForm() {
  document.querySelector(".popupForm").style.display = "block"
}

function submitNewExcercise(){
  const newExcerciseName = excerciseNameInput.value
  const timeAllowed = timeAllowedInput.value
  
  if(!isNameValid(newExcerciseName)){
    dialog.showMessageBox({
      type: "error",
      message: "Please type in excercise's name"
    })
    return
  }

  if(!timeAllowed){
    dialog.showMessageBox({
      type: "error",
      message: "Please type in time"
    })
    return
  }

  if(timeAllowed == 0){
    dialog.showMessageBox({
      type: "error",
      message: "Allowed time should be bigger than 0"
    })
    return
  }

  ipcRenderer.send('add-new-excercise',{newExcerciseName,timeAllowed})
  closeForm()
}

function closeForm() {
  document.querySelector(".popupForm").style.display = "none"
  timeAllowedInput.value = ""
  excerciseNameInput.value = ""
}

function editTest(name){
  ipcRenderer.send('open-editor',{name})
}

function isNameValid(name){
  if (typeof name === "string" && name.trim() != "") {
    return true;
  }

  return false;
}

function handleLogOut(){
  ipcRenderer.send('admin-log-out-req')
}

ipcRenderer.on('close-admin-window',(event,args)=>{
  remote.getCurrentWindow().close()
})

function updateRow(excercise){
  const {name,excerciseLength,givenTime} = excercise
  const row = document.getElementsByClassName(`${name}`)[0]
  row.innerHTML =`
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

  row.setAttribute("class",name)
}