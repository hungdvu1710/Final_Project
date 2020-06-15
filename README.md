# Final_Project
 Contents:
  - Login page
  - Admin
    - Quizzes list with action ICONed buttons
    - Create quizzes using popup window like dis: https://miro.medium.com/max/1400/1*mv-mAe1RuqgdfzuE-fGH2g.gif
    - Edit quizzes with popup window
    - Disable quizzes with
    - View results
  - User
    - Countdown...!
    - Take quizzes
    - Submit
    - View results

Quiz types:
  - Multiple Choices (Check boxes)
  - Single Choice (Radio)
  - T/F (Radio)

Database:
  - MySQL, MS SQL Server (Dirty Peasant)
  - MongoDB (Cool kid)
  - SQLite (Peasant)
  - NeDB (Master Race)

# TODO: Additional validation for sign up (check for existed username)

# DB structure suggestions:
Excercises Bank: (accessed only by admin)
  - Every time admin creates new excercises, append the excercises name to the excercises.db, then update its content
  - Suggested excercise db structure example: {question: "#1", answer: ["a","b","c","d"], rightanswer: "b"}

  {
    {
      name: "#1",
      created_at: ""
      questions: [{number: "#1", answer: ["a","b","c","d"], rightanswer: "b"},{number: "#2", answer: ["a","b","c","d"], rightanswer: "c"}]
    },
    {},
    {}
  }
User Lists:
  - Update user record whenever he/she finishes an excercise
  - Suggested single user db structure example: 
  {
    username: "h",
    password:"h", 
    record:[{excercise: "sample", score: "7/10"},{excercise: "sample2", score: "7/10"}]
  }