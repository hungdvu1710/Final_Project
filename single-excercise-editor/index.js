const { ipcRenderer, remote } = require("electron")

const questionTable = document.querySelector(".all-questions")
const submitBtn = document.querySelector(".submit")
submitBtn.addEventListener("click",handleSubmit)

const excerciseLoader = new Promise((resolve,reject)=>{
  ipcRenderer.on('excercise-to-edit',(event,args)=>{
    const {questions,name,givenTime} = args
    questionSet = questions

    document.querySelector(".titleWrapper").setAttribute("id",`${name}`)
    document.querySelector(".timeAllowed").innerText = givenTime

    questions.forEach((element)=>{
      const{question, type, answers,rightanswer,_questionId} = element

      if(type === "single-choice"){
        addSingleChoiceQuestion(question,answers,rightanswer,_questionId)
      } else if(type === "T/F"){
        addTFQuestion(question,answers,rightanswer,_questionId)
      } else{
        addMultiChoiceQuestion(question,answers,rightanswer,_questionId)
      }
    })

    resolve({questions,name})
  })
})
  

function addSingleChoiceQuestion(question,answers,rightanswer,_questionId){
  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <th>
      <label for="question">Question: </label>
      <input type="text" value="${question}" name="question" class="question" id="${_questionId}QuestionContent">
    </th>
  `
  questionRow.setAttribute("class","questionRow")

  const answerRow = questionTable.insertRow(-1)
  answerRow.setAttribute("class","answerRow")
  answerRow.appendChild(addAccessibilityController(_questionId))
  
  answers.forEach(answer =>{
    addSingleAnswer(answer,question,answerRow,"radio",rightanswer,_questionId)
  })

  const addQuestionBtn = document.createElement("button")
  addQuestionBtn.setAttribute("class","addAnswer")
  addQuestionBtn.innerText = "Add"
  addQuestionBtn.addEventListener("click",addAnswer)

  answerRow.appendChild(addQuestionBtn)
}

function addMultiChoiceQuestion(question,answers,rightanswer,_questionId){
  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <th>
      <label for="question">Question: </label>
      <input type="text" value="${question}" name="question" class="question" id="${_questionId}QuestionContent">
    </th>
  `
  questionRow.setAttribute("class","questionRow")

  const answerRow = questionTable.insertRow(-1)
  answerRow.setAttribute("class","answerRow")
  answerRow.appendChild(addAccessibilityController(_questionId))

  answers.forEach(answer =>{
    addSingleAnswer(answer,question,answerRow,"checkbox",rightanswer,_questionId)
  })

  const addQuestionBtn = document.createElement("button")
  addQuestionBtn.setAttribute("class","addAnswer")
  addQuestionBtn.innerText = "Add"
  addQuestionBtn.addEventListener("click",addAnswer)

  answerRow.appendChild(addQuestionBtn)
}

function addTFQuestion(question,answers,rightanswer,_questionId){
  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <th>
      <div>
        <label for="question">Question: </label>
        <input type="text" value="${question}" name="question" class="question" id="${_questionId}QuestionContent">
      </div>
    </th>
  `
  questionRow.setAttribute("class","questionRow")

  const answerRow = questionTable.insertRow(-1)
  answerRow.setAttribute("class","answerRow")
  answerRow.appendChild(addAccessibilityController(_questionId))

  answers.forEach(answer =>{
    addSingleAnswer(answer,question,answerRow,"radio",rightanswer,_questionId)
  })

  const addQuestionBtn = document.createElement("button")
  addQuestionBtn.setAttribute("class","addAnswer")
  addQuestionBtn.innerText = "Add"
  addQuestionBtn.addEventListener("click",addAnswer)

  answerRow.appendChild(addQuestionBtn)
}

function addSingleAnswer(answer,question,answerRow,type,rightanswer,_questionId){
  const answerWrapper = document.createElement("div")
  answerWrapper.setAttribute("class",`${_questionId}answerWrapper`)

  const choice = document.createElement('input')
  choice.setAttribute("type",type)
  choice.setAttribute("class",`${_questionId}Choice`)
  choice.setAttribute("value",answer)

  if(rightanswer.includes(answer)){
    choice.setAttribute("checked",true)
  }

  const answerInput = document.createElement("input")
  answerInput.setAttribute("value",answer)
  answerInput.setAttribute("class",`${_questionId}Answer`)

  const deleteAnswerBtn = document.createElement("button")
  deleteAnswerBtn.setAttribute("class","deleteAnswer")
  deleteAnswerBtn.innerText = "Delete"
  deleteAnswerBtn.addEventListener("click",deleteAnswer)

  answerWrapper.appendChild(choice)
  answerWrapper.appendChild(answerInput)
  answerWrapper.appendChild(deleteAnswerBtn)
  answerRow.appendChild(answerWrapper)
}

function addAccessibilityController(_questionId){
  const accessibilityController = document.createElement("select")

  accessibilityController.setAttribute("class",`${_questionId}Accessibility`)
  accessibilityController.setAttribute("name",`${_questionId}Accessibility`)

  const enableOpt = document.createElement("option")
  enableOpt.innerText = "Enable"
  enableOpt.setAttribute("name",`${_questionId}Accessibility`)
  enableOpt.setAttribute("value","enable")

  const disableOpt = document.createElement("option")
  disableOpt.innerText = "Disable"
  disableOpt.setAttribute("name",`${_questionId}Accessibility`)
  disableOpt.setAttribute("value","disable")

  accessibilityController.appendChild(enableOpt)
  accessibilityController.appendChild(disableOpt)

  return accessibilityController
}

function handleSubmit(){
  getQuestionContentChanges()
  getQuestionAccessibilityChanges()
  getAllRightAnswers()
  getAnswerChanges()
}

async function getAllRightAnswers(){
  const {questions} = await excerciseLoader
  let rightanswerSet = []

  questions.forEach((element)=>{
    const {_questionId} = element
    let rightanswers = []

    document.querySelectorAll(`.${_questionId}Choice:checked`).forEach(e => {
      rightanswers.push(e.value)
    })

    rightanswerSet.push({_questionId, rightanswers})
  })

  console.log(rightanswerSet)
  return rightanswerSet
}

async function getQuestionContentChanges(){
  const {questions} = await excerciseLoader
  let newQuestionSet = []

  questions.forEach((element)=>{
    const {_questionId} = element
    const questionContent = document.querySelector(`#${_questionId}QuestionContent`).value
    
    newQuestionSet.push({_questionId, questionContent})
  })

  console.log(newQuestionSet)
  return newQuestionSet
}

async function getAnswerChanges(){
  const {questions} = await excerciseLoader
  let newAnswerSet = []

  questions.forEach((element)=>{
    const {_questionId} = element
    let answers = []

    document.querySelectorAll(`.${_questionId}Answer`).forEach(e=>{
      answers.push(e.value)
    })
    
    newAnswerSet.push({_questionId, answers})
  })

  console.log(newAnswerSet)
  return newAnswerSet
}

async function getQuestionAccessibilityChanges(){
  const {questions} = await excerciseLoader
  let newAccessibilitySet = []

  questions.forEach((element)=>{
    const {_questionId} = element
    const accesibility = document.querySelector(`.${_questionId}Accessibility`).value

    newAccessibilitySet.push({_questionId, accesibility})
  })

  console.log(newAccessibilitySet)
  return newAccessibilitySet
}

function deleteAnswer(){

}

function addAnswer(){

}