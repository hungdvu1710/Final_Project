const { ipcRenderer } = require("electron")

const logInBtn = document.querySelector("#logIn")
const signUpBtn = document.querySelector("#signUp")
const username = document.querySelector("#username")
const password = document.querySelector("#password")
// const adminSelector = document.querySelector("#admin")
// const testTakerSelector = document.querySelector("#testTaker")

document.querySelector("form").addEventListener("submit", (e) => e.preventDefault())
logInBtn.addEventListener("click", handleLogIn)
signUpBtn.addEventListener("click", handleSignUp)

function handleLogIn(){
  const input = {user: username.value, pass: password.value }
  console.log(input)
  ipcRenderer.send('log-in-req',input)
}

function handleSignUp(){
  const input = {user: username.value, pass: password.value }
  ipcRenderer.send('sign-up-req',input)
}