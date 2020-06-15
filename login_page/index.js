const { 
  ipcRenderer,
  remote,
  ipcMain} = require("electron")

const logInBtn = document.querySelector("#logIn")
const signUpBtn = document.querySelector("#signUp")
const username = document.querySelector("#username")
const password = document.querySelector("#password")
const credentials = document.querySelector("#credentials")

document.querySelector("form").addEventListener("submit", (e) => e.preventDefault())
logInBtn.addEventListener("click", handleLogIn)
signUpBtn.addEventListener("click", handleSignUp)

function handleLogIn(){
  username.className = "username"
  password.className = "password"

  if(!validateInput(username.value)){
    username.className += " error"
  }
  if(!validateInput(password.value)){
    password.className += " error"
  }

  if(validateInput(password.value) && validateInput(username.value)){
    username.className = "username"
    password.className = "password"

    const input = {username: username.value, password: password.value }
    console.log(input)
    ipcRenderer.send('log-in-req',input)
  }
}

function handleSignUp(){
  username.className = "username"
  password.className = "password"

  if(!validateInput(username.value)){
    username.className += " error"
  }
  if(!validateInput(password.value)){
    password.className += " error"
  }

  if(validateInput(password.value) && validateInput(username.value)){
    username.className = "username"
    password.className = "password"

    const input = {username: username.value, password: password.value }
    console.log(input)
    ipcRenderer.send('sign-up-req',input)
  }
}

function validateInput(input){
  if(!input){
    return false
  }
  if(!input.trim()){
    return false
  }
  return true
}

ipcRenderer.on('close-login-page', (event,args)=>{
  remote.getCurrentWindow().close()
})