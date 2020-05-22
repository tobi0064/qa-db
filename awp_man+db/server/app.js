/**** External libraries ****/
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');

/**** Configuration ****/
const appName = "AWP mandatory full stack";
const port = (process.env.PORT || 8080);

const app = express();
const buildPath = path.join(__dirname, '..', 'client', 'build');

app.use(cors());
app.use(bodyParser.json()); // Parse JSON from the request body
app.use(morgan('combined')); // Log all http requests to the console
app.use(express.static(buildPath)); // Serve React from build directory

app.use((req, res, next) => {
    // Additional headers for the response to avoid trigger CORS security errors in the browser
    // Read more: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");

    // Intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
      // Always respond with 200
      console.log("Allowing OPTIONS");
      res.send(200);
    } else {
      next();
    }
});

/**** Some test data ****/
/*const questions = [
    {
        id: 1,
        question: "How to add Bootstrap to React?",
        answers:[
            {id: 4, text: "first answer", votes: 1},
            {id: 5, text: "second answer", votes: 3},
            {id: 6, text: "third answer", votes: 2}

        ]
    },
    {
        id: 2,
        question: "Class vs Functions in React?",
        answers: [
            {id: 1, text: "first answer", votes: 7},
            {id: 2, text: "second answer", votes: 9},
            {id: 3, text: "third answer", votes: 200}
        ]
    },
];*/

/*** Database ***/
const qaDb = require('./qa_db')(mongoose);

/**** Routes ****/

// Return all recipes in data
app.get('/api/questions', async (req, res) => {
    const questions = await qaDb.getQuestions()
    res.json(questions)
});

app.get('/api/questions/:id', async (req, res) => {
    let id = req.params.id
    const question = await qaDb.getQuestion(id);
    res.json(question);
});

//AskQuestion
app.post('/api/questions', async (req, res) => {
    let question = {
        id: Math.random(),
        question: req.body.question,
        answers: [{ text: String, votes: Number }],
    };

    const newQuestion = await qaDb.postQuestion(question);
    res.json(newQuestion);
})
// PostAnswer
app.post('/api/questions/:id/answers', async (req, res) => {
    let answer = {
        id: Math.random(),
        text: req.body.text,
        votes: 0
    }
    const updatedQuestion = await qaDb.postAnswer(answer);
    res.json(updatedQuestion);

});

app.put("/api/questions/:questionId/answers/:answerId/vote", async (req, res) => {
        //Path parameter

//    let answer = {
        //aid: req.params.aid,
      //  text: req.params.text,
       // votes: 0
    //}
    //const question = questions.find(q => q.id ===parseFloat(req.params.id));
    //const ans = question.answers.find(a => a.id ===parseFloat(req.params.aid));
//    ans.votes++;

    const question = await qaDb.putVote(req.params.questionId, req.params.answerId);
    res.json({msg: "Answer upvoted", question: question});
});



// "Redirect" all get requests (except for the routes specified above) to React's entry point (index.html) to be handled by Reach router
// It's important to specify this route as the very last one to prevent overriding all of the other routes
app.get('*', (req, res) =>
    res.sendFile(path.resolve('..', 'client', 'build', 'index.html'))
);

/**** Start! ****/
const url = process.env.MONGO_URL || 'mongodb://localhost/qa_db';
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(async () => {
        await qaDb.bootstrap(); // Fill in test data if needed.
        await app.listen(port); // Start the API
        console.log(`qa API running on port ${port}!`);
    })
    .catch(error => console.error(error));