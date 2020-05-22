const Schema = require("mongoose").Schema;

class Db {
    /**
     * Constructors an object for accessing kittens in the database
     * @param mongoose the mongoose object used to create schema objects for the database
     */
    constructor(mongoose) {
        // This is the schema we need to store kittens in MongoDB
        const questionSchema = new Schema({
            text: String,
            answers: [{ text: String, votes: Number }]
        });

        // This model is used in the methods of this class to access kittens
        this.questionModel = mongoose.model("question", questionSchema);

    }

    async getQuestions() {
        try {
            return await this.questionModel.find({});
        } catch (error) {
            console.error("getQuestions:", error.message);
            return {};
        }
    }

    async getQuestion(questionId) {
        try {
            return await this.questionModel.findById(questionId);
        } catch (error) {
            console.error("getQuestion:", error.message);
            return {};
        }
    }

    async postQuestion(newQuestion) {

        let question = new this.questionModel(newQuestion);
        try {
            return question.save();
        } catch (error) {
            console.error("postQuestion:", error.message);
            return {};
        }
    }

    async postAnswer(id, answer,) {
        // TODO: Error handling
        const question = await this.getQuestion(id);
        answer.votes = 0;
        question.answers.push(answer);

        try {
            return question.save();
        } catch (error) {
            console.error("postAnswer:", error.message);
            return {};
        }
    }
    getAnswer(question, answerId) {
        try {
            console.log(answerId);

            return question.answers.id(answerId);

            //return question.answers.find(answer => answer.id == answerId);
        } catch (error) {
            console.error("getAnswer:", error.message);
            return {};
        }
    }
    async putVote(id, aid) {
        // TODO: Error handling
        const question = await this.getQuestion(id);
        const answer = this.getAnswer(question, aid);
        answer.votes = answer.votes + 1;
        await question.save();
        return question;
    }

    /**
     * This method adds a bunch of test data if the database is empty.
     * @param count The amount of questions to add.
     * @returns {Promise} Resolves when everything has been saved.
     */
    async bootstrap(count = 10) {
        const answers = [
            { text: "the best answer would be", votes: 2 },
            { text: "the answer is def not a", votes: 3 },
            { text: "i didnt understand the question", votes: 0 },
            { text: "tell me if this will work: asd", votes: 3 },
            { text: "try an umbrella", votes: 0 }
        ];
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        function getRandomQuestion() {
            return [
                "which came first, the chicken or the egg?",
                "how do i deal with pirates if i stumble upon them?",
                "how do i make the database for this react app?"
            ][getRandomInt(0, 2)];
        }

        function getRandomAnswers() {
            const shuffled = answers.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, getRandomInt(1,shuffled.length));
        }

        let questionLength = (await this.getQuestions()).length;
        console.log("Question collection size:", questionLength);

        if (questionLength === 0) {
            let promises = [];

            for (let i = 0; i < count; i++) {
                let question = new this.questionModel({
                    text: getRandomQuestion(),
                    answers: getRandomAnswers()
                });
                promises.push(question.save());
            }

            return Promise.all(promises);
        }
    }
}



// We export the object used to access the kittens in the database
module.exports = mongoose => new Db(mongoose);