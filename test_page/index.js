const { ipcRenderer,remote } = require("electron");
const questionTable = document.querySelector(".all-questions")
const submitBtn = document.querySelector(".submit")
submitBtn.addEventListener("click",getUserResponse)

const excercisesLoader = new Promise((resolve,reject)=>{
  ipcRenderer.on('excercise-to-load',(event,args)=>{
    const {questions,name} = args
    questionSet = questions

    questions.forEach((element)=>{
      const{question, type, answers,rightanswer} = element
  
      if(type === "single-choice"){
        addSingleChoiceQuestion(question,answers)
      } else if(type === "T/F"){
        addTFQuestion(question,answers)
      } else{
        addMultiChoiceQuestion(question,answers)
      }
    })

    resolve({questions,name})
  })
})

function addSingleChoiceQuestion(question,answers){
  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <td>Question</td>
    <td>${question}</td>
  `
  const answerRow = questionTable.insertRow(-1)
  
  answers.forEach(answer =>{
    addSingleAnswer(answer,question,answerRow,"radio")
  })
}

function addMultiChoiceQuestion(question,answers){
  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <td>Question</td>
    <td>${question}</td>
  `
  const answerRow = questionTable.insertRow(-1)

  answers.forEach(answer =>{
    addSingleAnswer(answer,question,answerRow,"checkbox")
  })
}

function addTFQuestion(question,answers){
  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <td>Question</td>
    <td>${question}</td>
  `
  const answerRow = questionTable.insertRow(-1)

  answers.forEach(answer =>{
    addSingleAnswer(answer,question,answerRow,"radio")
  })
}

function addSingleAnswer(answer,question,answerRow,type){
  const answerWrapper = document.createElement("div")
  const questionShortenName = question.replace(/\s+/g, " ").split(" ").join("")

  const choice = document.createElement('input')
  choice.setAttribute("type",type)
  choice.setAttribute("class",questionShortenName)
  choice.setAttribute("value",answer)
  choice.setAttribute("name",question)

  const answerLabel = document.createElement("label")
  answerLabel.setAttribute("for",answer)
  answerLabel.innerText = answer

  answerWrapper.appendChild(choice)
  answerWrapper.appendChild(answerLabel)
  answerRow.appendChild(answerWrapper)
}

async function getUserResponse(){
  const {questions,name} = await excercisesLoader
  let responseSet = []

  questions.forEach((element)=>{
    const {question,type} = element
    const questionShortenName = question.replace(/\s+/g, " ").split(" ").join("")
    let responses = []

    document.querySelectorAll(`.${questionShortenName}:checked`).forEach(e => {
      responses.push(e.value)
    })

    responseSet.push({question, responses})
  })

  console.log(responseSet)
  ipcRenderer.send('user-responses',{name,responseSet})
}

ipcRenderer.on('close-test-page',(event,args)=>{
  remote.getCurrentWindow().close()
})