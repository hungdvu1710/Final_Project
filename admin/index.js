const {ipcRenderer,remote} = require('electron')

const excerTable = document.querySelector(".all-excercises")
const userTable = document.querySelector(".all-users")
const logOutBtn = document.querySelector("#logOut")
logOutBtn.addEventListener('click',handleLogOut)

ipcRenderer.send('get-all-excercises')
ipcRenderer.send('get-all-users')

ipcRenderer.on('all-excercises-response',(event,args) =>{
  appendExcerciseRow(args)
})
ipcRenderer.on('all-users-response',(event,args)=>{
  appendUserRow(args)
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
  dropBtn.setAttribute("class","dropbtn")
  dropBtn.innerHTML =`
    Record
    <i class="fa fa-caret-down"></i>
  `
  recordDropdown.appendChild(dropBtn)

  const dropContent = document.createElement("div")
  dropContent.setAttribute("class","dropdown-content")
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

function handleLogOut(){
  ipcRenderer.send('admin-log-out-req')
}

ipcRenderer.on('close-admin-window',(event,args)=>{
  remote.getCurrentWindow().close()
})