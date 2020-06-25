const { ipcRenderer, remote } = require("electron")
const {dialog} = remote

const questionTable = document.querySelector(".all-questions")
const submitBtn = document.querySelector(".submit")
const timeAllowedInput = document.querySelector(".timeAllowed")
const typeSelector = document.querySelector(".TypeSelector")
let newQuestionSet = []

document.querySelector(".questionCreator").addEventListener("click",addQuestion)
const invalidCharsInTime = ["-", "+", "e", "E"]

timeAllowedInput.addEventListener("keydown", function (e) {
  if (invalidCharsInTime.includes(e.key)) {
    e.preventDefault()
  }
})
submitBtn.addEventListener("click",handleSubmit)

ipcRenderer.on('close-editor',(event,args)=>{
  remote.getCurrentWindow().close()
})

const excerciseLoader = new Promise((resolve,reject)=>{
  ipcRenderer.on('excercise-to-edit',(event,args)=>{
    const {questions,name,givenTime} = args
    console.log(args)

    document.querySelector(".title").innerText = name
    timeAllowedInput.value = givenTime

    if(questions.length > 0){

      questions.forEach((element)=>{
        const{question, type, answers,rightanswer,_questionId,accessibility} = element
  
        if(type === "single-choice"){
          addSingleChoiceQuestion(question,answers,rightanswer,_questionId,type,accessibility)
        } else if(type === "T/F"){
          addTFQuestion(question,answers,rightanswer,_questionId,type,accessibility)
        } else{
          addMultiChoiceQuestion(question,answers,rightanswer,_questionId,type,accessibility)
        }
      })
    }

    resolve({questions,name})
  })
})
  

function addSingleChoiceQuestion(question,answers,rightanswer,_questionId,type,accessibility){
  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <th>
      <label for="question">Question: </label>
      <input type="text" value="${question}" name="question" class="question" id="${_questionId}QuestionContent">
      <p class="${_questionId}Type">${type}</p>
    </th>
  `
  questionRow.setAttribute("class","questionRow")

  const answerRow = questionTable.insertRow(-1)
  answerRow.setAttribute("class","radio")
  answerRow.appendChild(addAccessibilityController(_questionId,accessibility))
  answerRow.setAttribute("id",_questionId)
  
  answers.forEach(answer =>{
    addSingleAnswer(answer,answerRow,"radio",rightanswer,_questionId)
  })

  const addAnswerBtn = document.createElement("button")
  addAnswerBtn.setAttribute("class","addAnswer")
  addAnswerBtn.innerText = "Add"
  addAnswerBtn.addEventListener("click",addAnswer)

  answerRow.appendChild(addAnswerBtn)
}

function addMultiChoiceQuestion(question,answers,rightanswer,_questionId,type,accessibility){
  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <th>
      <label for="question">Question: </label>
      <input type="text" value="${question}" name="question" class="question" id="${_questionId}QuestionContent">
      <p class="${_questionId}Type">${type}</p>
    </th>
  `
  questionRow.setAttribute("class","questionRow")

  const answerRow = questionTable.insertRow(-1)
  answerRow.setAttribute("class","checkbox")
  answerRow.setAttribute("id",_questionId)
  answerRow.appendChild(addAccessibilityController(_questionId,accessibility))

  answers.forEach(answer =>{
    addSingleAnswer(answer,answerRow,"checkbox",rightanswer,_questionId)
  })

  const addAnswerBtn = document.createElement("button")
  addAnswerBtn.setAttribute("class","addAnswer")
  addAnswerBtn.innerText = "Add"
  addAnswerBtn.addEventListener("click",addAnswer)

  answerRow.appendChild(addAnswerBtn)
}

function addTFQuestion(question,answers,rightanswer,_questionId,type,accessibility){
  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <th>
      <div>
        <label for="question">Question: </label>
        <input type="text" value="${question}" name="question" class="question" id="${_questionId}QuestionContent">
        <p class="${_questionId}Type">${type}</p>
      </div>
    </th>
  `
  questionRow.setAttribute("class","questionRow")

  const answerRow = questionTable.insertRow(-1)
  answerRow.setAttribute("class","radio")
  answerRow.appendChild(addAccessibilityController(_questionId,accessibility))
  answerRow.setAttribute("id",_questionId)

  answers.forEach(answer =>{
    addTFAnswer(answer,answerRow,rightanswer,_questionId)
  })

}

function addTFAnswer(answer,answerRow,rightanswer,_questionId){
  const answerWrapper = document.createElement("div")
  answerWrapper.setAttribute("class",`${_questionId}answerWrapper`)

  const choice = document.createElement('input')
  choice.setAttribute("type","radio")
  choice.setAttribute("class",`${_questionId}Choice`)
  choice.setAttribute("value",answer)
  choice.setAttribute("name",_questionId)

  if(rightanswer.includes(answer)){
    choice.setAttribute("checked",true)
  }

  const answerInput = document.createElement("input")
  answerInput.setAttribute("value",answer)
  answerInput.setAttribute("class",`${_questionId}Answer`)

  answerInput.addEventListener("input",updateChoiceValue)

  answerWrapper.appendChild(choice)
  answerWrapper.appendChild(answerInput)

  answerRow.appendChild(answerWrapper)
}

function addSingleAnswer(answer,answerRow,type,rightanswer,_questionId){
  const answerWrapper = document.createElement("div")
  answerWrapper.setAttribute("class",`${_questionId}answerWrapper`)

  const choice = document.createElement('input')
  choice.setAttribute("type",type)
  choice.setAttribute("class",`${_questionId}Choice`)
  choice.setAttribute("value",answer)
  choice.setAttribute("name",_questionId)

  if(rightanswer.includes(answer)){
    choice.setAttribute("checked",true)
  }

  const answerInput = document.createElement("input")
  answerInput.setAttribute("value",answer)
  answerInput.setAttribute("class",`${_questionId}Answer`)

  answerInput.addEventListener("input",updateChoiceValue)

  const deleteAnswerBtn = document.createElement("button")
  deleteAnswerBtn.setAttribute("class","deleteAnswer")
  deleteAnswerBtn.innerText = "Delete"
  deleteAnswerBtn.addEventListener("click",deleteAnswer)

  answerWrapper.appendChild(choice)
  answerWrapper.appendChild(answerInput)
  answerWrapper.appendChild(deleteAnswerBtn)

  answerRow.appendChild(answerWrapper)
}

function addAccessibilityController(_questionId,accessibility){
  const accessibilityController = document.createElement("select")

  accessibilityController.setAttribute("class",`${_questionId}Accessibility`)
  accessibilityController.setAttribute("name",`${_questionId}Accessibility`)

  const enableOpt = document.createElement("option")
  enableOpt.innerText = "Enable"
  enableOpt.setAttribute("name",`${_questionId}Accessibility`)
  enableOpt.setAttribute("value","enabled")

  const disableOpt = document.createElement("option")
  disableOpt.innerText = "Disable"
  disableOpt.setAttribute("name",`${_questionId}Accessibility`)
  disableOpt.setAttribute("value","disabled")

  accessibilityController.appendChild(enableOpt)
  accessibilityController.appendChild(disableOpt)
  
  if(accessibility == "disabled"){
    disableOpt.setAttribute("selected","selected")
  } else{
    enableOpt.setAttribute("selected","selected")
  }

  return accessibilityController
}

function deleteAnswer(){
  this.parentNode.remove()
}

function addAnswer(){
  const questionId = this.parentNode.id
  const type = this.parentNode.className

  const answerWrapper = document.createElement("div")
  answerWrapper.setAttribute("class",`${questionId}answerWrapper`)

  const choice = document.createElement('input')
  choice.setAttribute("type",type)
  choice.setAttribute("class",`${questionId}Choice`)
  choice.setAttribute("name",questionId)

  const answerInput = document.createElement("input")
  answerInput.setAttribute("class",`${questionId}Answer`)
  answerInput.addEventListener("input",updateChoiceValue)

  const deleteAnswerBtn = document.createElement("button")
  deleteAnswerBtn.setAttribute("class","deleteAnswer")
  deleteAnswerBtn.innerText = "Delete"
  deleteAnswerBtn.addEventListener("click",deleteAnswer)

  answerWrapper.appendChild(choice)
  answerWrapper.appendChild(answerInput)
  answerWrapper.appendChild(deleteAnswerBtn)

  this.parentNode.insertBefore(answerWrapper,this.parentNode.lastChild)
}

function updateChoiceValue(){
  this.parentNode.firstChild.value = this.value
}

function handleSubmit(){
  const name = document.querySelector(".title").innerText
  const timeAllowed = document.querySelector(".timeAllowed").value

  Promise.all([
    getQuestionContentChanges(),
    getQuestionAccessibilityChanges(),
    getAllRightAnswers(),
    getAnswerChanges(),
    getQuestionType()
  ]).then(values => {
    
    const questions = []

    values.forEach(value => {

      if(!questions.length){

        value.forEach(element=>{
          questions.push(element)
        })
      } else{
        value.forEach(element=>{

          questions.forEach(question=>{

            if(question._questionId == element._questionId){
              const propertyToAppend = Object.keys(element)[1]
              console.log(propertyToAppend)
              question[`${propertyToAppend}`] = element[`${propertyToAppend}`]
            }

          })

        })

      }

    })
    
    ipcRenderer.send("update-excercise",{name,givenTime:timeAllowed,questions})
  })
  
}

async function getAllRightAnswers(){
  const {questions} = await excerciseLoader
  const allCurrentQuestions = newQuestionSet.concat(questions)
  let rightanswerSet = []

  allCurrentQuestions.forEach((element)=>{
    const {_questionId} = element
    let rightanswer = []

    document.querySelectorAll(`.${_questionId}Choice:checked`).forEach(e => {
      rightanswer.push(e.value)
    })

    rightanswerSet.push({_questionId, rightanswer})
  })

  return rightanswerSet
}

async function getQuestionContentChanges(){
  const {questions} = await excerciseLoader
  const allCurrentQuestions = newQuestionSet.concat(questions)
  let newQuestionContent = []

  allCurrentQuestions.forEach((element)=>{
    const {_questionId} = element
    const question = document.querySelector(`#${_questionId}QuestionContent`).value
    
    newQuestionContent.push({_questionId, question})
  })

  return newQuestionContent
}

async function getAnswerChanges(){
  const {questions} = await excerciseLoader
  const allCurrentQuestions = newQuestionSet.concat(questions)
  let newAnswerSet = []

  allCurrentQuestions.forEach((element)=>{
    const {_questionId} = element
    let answers = []

    document.querySelectorAll(`.${_questionId}Answer`).forEach(e=>{
      answers.push(e.value)
    })
    
    newAnswerSet.push({_questionId, answers})
  })

  return newAnswerSet
}

async function getQuestionType(){
  const {questions} = await excerciseLoader
  const allCurrentQuestions = newQuestionSet.concat(questions)
  let TypeSet = []

  allCurrentQuestions.forEach((element)=>{
    const {_questionId} = element
    const type = document.querySelector(`.${_questionId}Type`).innerText

    TypeSet.push({_questionId, type})
  })

  return TypeSet
}

async function getQuestionAccessibilityChanges(){
  const {questions} = await excerciseLoader
  const allCurrentQuestions = newQuestionSet.concat(questions)
  let newAccessibilitySet = []

  allCurrentQuestions.forEach((element)=>{
    const {_questionId} = element
    const accessibility = document.querySelector(`.${_questionId}Accessibility`).value

    newAccessibilitySet.push({_questionId, accessibility})
  })

  return newAccessibilitySet
}

function addQuestion(){
  const _questionId = `i${Date.now()}`
  const type = typeSelector.value
  const newQuestion = {_questionId,type,question: "",rightanswer:[],accessibility:"disabled"}

  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <th>
      <label for="question">Question: </label>
      <input type="text" name="question" class="question" id="${_questionId}QuestionContent">
      <p class="${_questionId}Type">${type}</p>
    </th>
  `
  questionRow.setAttribute("class","questionRow")

  const answerRow = questionTable.insertRow(-1)
  answerRow.appendChild(addAccessibilityController(_questionId,"disabled"))
  answerRow.setAttribute("id",_questionId)

  if(type == "single-choice"){
    answerRow.setAttribute("class","radio")

    const addAnswerBtn = document.createElement("button")
    addAnswerBtn.setAttribute("class","addAnswer")
    addAnswerBtn.innerText = "Add"
    addAnswerBtn.addEventListener("click",addAnswer)

    answerRow.appendChild(addAnswerBtn)

    newQuestion.answers = []
  } else if(type == "multi-choice"){
    answerRow.setAttribute("class","checkbox")

    const addAnswerBtn = document.createElement("button")
    addAnswerBtn.setAttribute("class","addAnswer")
    addAnswerBtn.innerText = "Add"
    addAnswerBtn.addEventListener("click",addAnswer)

    answerRow.appendChild(addAnswerBtn)

    newQuestion.answers = []
  } else{
    //T/F question will only have 2 option
    answerRow.setAttribute("class","radio")

    const firstAnswerWrapper = document.createElement("div")
    firstAnswerWrapper.setAttribute("class",`${_questionId}answerWrapper`)

    const secondAnswerWrapper = document.createElement("div")
    secondAnswerWrapper.setAttribute("class",`${_questionId}answerWrapper`)

    const firstChoice = document.createElement('input')
    firstChoice.setAttribute("type","radio")
    firstChoice.setAttribute("class",`${_questionId}Choice`)
    firstChoice.setAttribute("value","T")
    firstChoice.setAttribute("name",_questionId)

    const firstChoiceContent = document.createElement("input")
    firstChoiceContent.setAttribute("value","T")
    firstChoiceContent.setAttribute("class",`${_questionId}Answer`)

    firstChoiceContent.addEventListener("input",updateChoiceValue)

    const secondChoice = document.createElement('input')
    secondChoice.setAttribute("type","radio")
    secondChoice.setAttribute("class",`${_questionId}Choice`)
    secondChoice.setAttribute("value","T")
    secondChoice.setAttribute("name",_questionId)

    const secondChoiceContent = document.createElement("input")
    secondChoiceContent.setAttribute("value","F")
    secondChoiceContent.setAttribute("class",`${_questionId}Answer`)

    secondChoiceContent.addEventListener("input",updateChoiceValue)

    firstAnswerWrapper.appendChild(firstChoice)
    firstAnswerWrapper.appendChild(firstChoiceContent)

    secondAnswerWrapper.appendChild(secondChoice)
    secondAnswerWrapper.appendChild(secondChoiceContent)

    answerRow.appendChild(firstAnswerWrapper)
    answerRow.appendChild(secondAnswerWrapper)

    newQuestion.answers = ["T","F"]
  }

  newQuestionSet.push(newQuestion)
}