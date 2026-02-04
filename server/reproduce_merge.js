
const { runTestCases } = require('./src/services/codeExecutor');
const Question = require('./src/models/Question');
const mongoose = require('mongoose');
require('dotenv').config();

async function reproduce() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform');

        // Target Merge Intervals
        const q = await Question.findOne({ slug: 'merge-intervals' });
        console.log(`Reproducing Python 2D Array Output for Q: ${q.title}`);

        const starterCode = q.starterCode['python'];
        console.log('Starter Code:\n', starterCode);

        const result = await runTestCases(starterCode, 'python', q.testCases.slice(0, 1), q.slug, null);
        console.log('Result:', JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
reproduce();
