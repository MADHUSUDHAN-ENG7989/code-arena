
const { runTestCases } = require('./src/services/codeExecutor');
const Question = require('./src/models/Question');
const mongoose = require('mongoose');
require('dotenv').config();

async function testPython() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform');

        // Find "Reverse String" or "Two Sum"
        const q = await Question.findOne({ slug: 'reverse-string' });
        if (!q) {
            console.error("Question 'reverse-string' not found!");
            process.exit(1);
        }

        console.log(`Testing Python for Q: ${q.title}`);
        const starterCode = q.starterCode['python'];
        console.log('Starter Code:\n', starterCode);

        // Run
        const result = await runTestCases(starterCode, 'python', q.testCases, q.slug, null);
        console.log('Result:', JSON.stringify(result, null, 2));

        if (result.passed > 0) {
            console.log("✅ PYTHON FIX VERIFIED!");
        } else {
            console.log("❌ PYTHON FAILED");
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testPython();
