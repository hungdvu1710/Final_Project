const { ipcRenderer } = require("electron");
const questionTable = document.querySelector(".all-questions")

ipcRenderer.on('excercise-to-load',(event,args)=>{
  console.log("hi")
  const {questions} = args
  questions.forEach((element)=>{
    const{question, type, answer, rightanswer} = element
    if(type === "single-choice"){
      addSingleChoiceQuestion(question,rightanswer,answer)
    } else if(type === "T/F"){
      addTFQuestion(question,rightanswer,answer)
    } else{
      addMultiChoiceQuestion(question,rightanswer,answer)
    }
  })
})

function addSingleChoiceQuestion(question,rightanswer,answer){
  console.log("single")
  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <td>Question</td>
    <td>${question}</td>
  `
  const answerRow = questionTable.insertRow(-1)
  console.log(answer)
}

function addMultiChoiceQuestion(question,rightanswer,answer){
  console.log("multi")
}

function addTFQuestion(question,rightanswer,answer){
  console.log("T/F")
}