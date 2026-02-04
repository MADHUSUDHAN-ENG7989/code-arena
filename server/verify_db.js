require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const Question = require('./src/models/Question');

async function countQuestions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform');
        const count = await Question.countDocuments();
        console.log(`Total questions in DB: ${count}`);

        const challenges = await require('./src/models/DailyChallenge').find().populate('questionId');

        if (challenges.length > 0) {
            console.log('Fixing broken daily challenges...');
            const validQuestion = await Question.findOne();
            if (validQuestion) {
                for (const c of challenges) {
                    if (!c.questionId) {
                        console.log(`Fixing challenge for date ${c.date}`);
                        c.questionId = validQuestion._id;
                        await c.save();
                    }
                }
                console.log('Fixed broken challenges.');
            }
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

countQuestions();
