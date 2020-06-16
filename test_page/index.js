const { ipcRenderer } = require("electron");

ipcRenderer.on('excercise-to-load',(event,args)=>{
  console.log("hi")
  console.log(args)
})