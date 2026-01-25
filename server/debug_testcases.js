require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./src/models/Question');

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const q = await Question.findOne({ slug: 'two-sum' });
    if (!q) {
        console.log('Question not found');
        return;
    }

    console.log('--- Test Cases ---');
    q.testCases.forEach((tc, i) => {
        console.log(`Case ${i + 1}:`);
        console.log('Input:', JSON.stringify(tc.input));
        console.log('Output:', JSON.stringify(tc.output));
        console.log('-------------------');
    });

    mongoose.connection.close();
};
run();
