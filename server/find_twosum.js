const mongoose = require('mongoose');
require('dotenv').config();
const Question = require('./src/models/Question');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const q = await Question.findOne({ title: 'Two Sum' });
        if (q) {
            console.log('TWO_SUM_ID:', q._id.toString());
            console.log('Test Cases:', q.testCases ? q.testCases.length : 'MISSING');
            console.log('Starter Code Keys:', q.starterCode ? Object.keys(q.starterCode) : 'MISSING');
            if (q.testCases && q.testCases.length > 0) {
                console.log('First Test Case:', JSON.stringify(q.testCases[0]));
            }
        } else {
            console.log('Two Sum not found');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
