const mongoose = require('mongoose');
const Question = require('./src/models/Question');
require('dotenv').config();

async function checkQuestions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform');

        const questions = await Question.find({});
        console.log(`Found ${questions.length} questions.`);

        for (const q of questions) {
            const visible = q.testCases.filter(tc => !tc.isHidden).length;
            const hidden = q.testCases.filter(tc => tc.isHidden).length;
            console.log(`Question: ${q.title} | Total Cases: ${q.testCases.length} | Visible: ${visible} | Hidden: ${hidden}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkQuestions();
