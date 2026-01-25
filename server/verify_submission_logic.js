const mongoose = require('mongoose');
const Question = require('./src/models/Question');
const { runTestCases } = require('./src/services/codeExecutor');
require('dotenv').config();

async function testExecutionLogic() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform');

        const question = await Question.findOne({ slug: 'two-sum' });
        if (!question) throw new Error('Question not found');

        const validCode = `
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`;

        console.log('Testing RUN Logic (Visible Cases Only)...');
        const visibleCases = question.testCases.filter(tc => !tc.isHidden);
        console.log(`Visible cases count: ${visibleCases.length}`);

        const runResult = await runTestCases(validCode, 'javascript', visibleCases.map(tc => ({ input: tc.input, output: tc.output })), 'two-sum');
        console.log(`Run Result: Passed ${runResult.passed}/${runResult.total}`);

        if (runResult.total !== 3) console.error('FAIL: Expected 3 visible cases');

        console.log('\nTesting SUBMIT Logic (All Cases)...');
        const allCases = question.testCases;
        console.log(`All cases count: ${allCases.length}`);

        const submitResult = await runTestCases(validCode, 'javascript', allCases.map(tc => ({ input: tc.input, output: tc.output })), 'two-sum');
        console.log(`Submit Result: Passed ${submitResult.passed}/${submitResult.total}`);

        if (submitResult.total !== 10) console.error('FAIL: Expected 10 total cases');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testExecutionLogic();
