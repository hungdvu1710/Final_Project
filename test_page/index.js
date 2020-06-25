const { ipcRenderer,remote } = require("electron")

const questionTable = document.querySelector(".all-questions")
const submitBtn = document.querySelector(".submit")
submitBtn.addEventListener("click",getUserResponse)
const MINUTE_TO_MS = 1000*60

const excercisesLoader = new Promise((resolve,reject)=>{
  ipcRenderer.on('excercise-to-load',(event,args)=>{
    const {username, excercise} = args
    const {questions,name,givenTime} = excercise
    questionSet = questions

    // const deadline = Date.now() + givenTime * MINUTE_TO_MS
    setTimer(givenTime)

    questions.forEach((element)=>{
      const{question, type, answers,accessibility,rightanswer,_questionId} = element
  
      if(type === "single-choice"){
        addSingleChoiceQuestion(question,answers,accessibility,rightanswer,_questionId)
      } else if(type === "T/F"){
        addTFQuestion(question,answers,accessibility,rightanswer,_questionId)
      } else{
        addMultiChoiceQuestion(question,answers,accessibility,rightanswer,_questionId)
      }
    })

    resolve({username,questions,name})
  })
})

function addSingleChoiceQuestion(question,answers,accessibility,rightanswer,_questionId){
  if(accessibility == "disabled"){
    return
  }

  if(answers.length == 0 || rightanswer.length == 0){
    return
  }

  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <th>Question: ${question}</th>
  `
  const answerRow = questionTable.insertRow(-1)
  
  answers.forEach(answer =>{
    addSingleAnswer(answer,question,answerRow,"radio",_questionId)
  })
}

function addMultiChoiceQuestion(question,answers,accessibility,rightanswer,_questionId){
  if(accessibility == "disabled"){
    return
  }

  if(answers.length == 0 || rightanswer.length == 0){
    return
  }

  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <th>Question: ${question}</th>
  `
  const answerRow = questionTable.insertRow(-1)

  answers.forEach(answer =>{
    addSingleAnswer(answer,question,answerRow,"checkbox",_questionId)
  })
}

function addTFQuestion(question,answers,accessibility,rightanswer,_questionId){
  if(accessibility == "disabled"){
    return
  }

  if(answers.length == 0 || rightanswer.length == 0){
    return
  }

  const questionRow = questionTable.insertRow(-1)
  questionRow.innerHTML =`
    <th>Question: ${question}</th>
  `
  const answerRow = questionTable.insertRow(-1)

  answers.forEach(answer =>{
    addSingleAnswer(answer,question,answerRow,"radio",_questionId)
  })
}

function addSingleAnswer(answer,question,answerRow,type,_questionId){
  const answerWrapper = document.createElement("div")

  const choice = document.createElement('input')
  choice.setAttribute("type",type)
  choice.setAttribute("class",_questionId)
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
  const {questions,name,username} = await excercisesLoader
  let responseSet = []

  questions.forEach((element)=>{
    const {question,_questionId} = element
    let responses = []

    document.querySelectorAll(`.${_questionId}:checked`).forEach(e => {
      responses.push(e.value)
    })

    responseSet.push({question, responses})
  })

  console.log(responseSet)
  ipcRenderer.send('user-responses',{name,responseSet,username})
}

function setTimer(givenTime){
  let timeLeft = givenTime * MINUTE_TO_MS 

  const timer = setInterval(()=>{
    let secondToDisplay

    if(timeLeft === 0){
      getUserResponse()
      clearInterval(timer)
    } 

    const minutes = Math.floor(timeLeft/MINUTE_TO_MS)
    const seconds = (timeLeft/1000)%60

    if(seconds < 10) secondToDisplay = "0" + seconds
    else secondToDisplay = seconds

    document.querySelector(".timer").innerHTML = `${minutes}:${secondToDisplay}`

    timeLeft -= 1000
  },1000)
}

ipcRenderer.on('close-test-page',(event,args)=>{
  remote.getCurrentWindow().close()
})