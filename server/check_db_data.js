require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./src/models/Question');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const checkData = async () => {
    await connectDB();
    const question = await Question.findOne({ slug: 'two-sum' });
    if (!question) {
        console.log('Question not found');
    } else {
        console.log('Question found:', question.title);
        console.log('Test Cases:');
        question.testCases.forEach((tc, i) => {
            console.log(`Case ${i + 1}:`);
            console.log('Input:', JSON.stringify(tc.input));
            console.log('Output:', JSON.stringify(tc.output));
            console.log('IsHidden:', tc.isHidden);
        });
    }
    process.exit();
};

checkData();
