const { ipcRenderer, remote } = require("electron")

const questionTable = document.querySelector(".all-questions")
const submitBtn = document.querySelector(".submit")

ipcRenderer.on('excercise-to-edit',(event,args)=>{
  const {questions,name,givenTime} = args
  questionSet = questions

  questions.forEach((element)=>{
    const{question, type, answers,rightanswer} = element

    if(type === "single-choice"){
      addSingleChoiceQuestion(question,answers,rightanswer)
    } else if(type === "T/F"){
      addTFQuestion(question,answers,rightanswer)
    } else{
      addMultiChoiceQuestion(question,answers,rightanswer)
    }
  })

})

function addSingleChoiceQuestion(question,answers,rightanswer){
  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <th>
      <label for="question">Question: </label>
      <input type="text" value="${question}" name="question" class="question">
    </th>
  `
  const answerRow = questionTable.insertRow(-1)
  answerRow.appendChild(addAccessibilityController(question))
  
  answers.forEach(answer =>{
    addSingleAnswer(answer,question,answerRow,"radio",rightanswer)
  })
}

function addMultiChoiceQuestion(question,answers,rightanswer){
  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <th>
      <label for="question">Question: </label>
      <input type="text" value="${question}" name="question" class="question">
    </th>
  `
  const answerRow = questionTable.insertRow(-1)
  answerRow.appendChild(addAccessibilityController(question))

  answers.forEach(answer =>{
    addSingleAnswer(answer,question,answerRow,"checkbox",rightanswer)
  })
}

function addTFQuestion(question,answers,rightanswer){
  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <th>
      <label for="question">Question: </label>
      <input type="text" value="${question}" name="question" class="question">
    </th>
  `
  const answerRow = questionTable.insertRow(-1)
  answerRow.appendChild(addAccessibilityController(question))

  answers.forEach(answer =>{
    addSingleAnswer(answer,question,answerRow,"radio",rightanswer)
  })
}

function addSingleAnswer(answer,question,answerRow,type,rightanswer){
  const answerWrapper = document.createElement("div")
  const questionShortenName = question.replace(/\s+/g, " ").split(" ").join("")

  const choice = document.createElement('input')
  choice.setAttribute("type",type)
  choice.setAttribute("class",questionShortenName)
  choice.setAttribute("value",answer)
  choice.setAttribute("name",question)

  if(rightanswer.includes(answer)){
    choice.setAttribute("checked",true)
  }

  const answerInput = document.createElement("input")
  answerInput.setAttribute("value",answer)
  answerInput.setAttribute("class",`${questionShortenName}Answer`)

  answerWrapper.appendChild(choice)
  answerWrapper.appendChild(answerInput)
  answerRow.appendChild(answerWrapper)
}

function addAccessibilityController(question){
  const questionShortenName = question.replace(/\s+/g, " ").split(" ").join("")
  const accessibilityController = document.createElement("select")

  accessibilityController.setAttribute("class",`${questionShortenName}Accessibility`)
  accessibilityController.setAttribute("name",`${questionShortenName}Accessibility`)

  const enableOpt = document.createElement("option")
  enableOpt.innerText = "Enable"
  enableOpt.setAttribute("name",`${questionShortenName}Accessibility`)
  enableOpt.setAttribute("value","enable")

  const disableOpt = document.createElement("option")
  disableOpt.innerText = "Disable"
  disableOpt.setAttribute("name",`${questionShortenName}Accessibility`)
  disableOpt.setAttribute("value","disable")

  accessibilityController.appendChild(enableOpt)
  accessibilityController.appendChild(disableOpt)

  return accessibilityController
}