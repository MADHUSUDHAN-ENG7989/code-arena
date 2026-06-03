const mongoose = require('mongoose');
const Question = require('./src/models/Question');
const { runTestCases } = require('./src/services/codeExecutor');
require('dotenv').config();

async function main() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // Get the first question
        const question = await Question.findOne().sort({ id: 1 });
        if (!question) {
            console.log('No questions found in the database.');
            process.exit(0);
        }

        console.log('\n--- Question Info ---');
        console.log('ID:', question.id);
        console.log('Title:', question.title);
        console.log('Slug:', question.slug);
        console.log('Starter Code (Python):', question.starterCode.python);
        console.log('Starter Code (JavaScript):', question.starterCode.javascript);
        console.log('Test Cases:', JSON.stringify(question.testCases, null, 2));

        // Let's run with starter code first (should fail logic, but pass infra)
        console.log('\n--- Running Starter Code (Python) ---');
        const starterResult = await runTestCases(
            question.starterCode.python,
            'python',
            question.testCases,
            question.slug,
            null
        );
        console.log('Starter Code Results:', JSON.stringify(starterResult, null, 2));

        // Now let's try a correct solution
        let solution = '';
        let language = 'python';

        if (question.slug === 'valid-palindrome') {
            solution = `
class Solution:
    def is_palindrome(self, s):
        filtered = "".join(ch.lower() for ch in s if ch.isalnum())
        return filtered == filtered[::-1]
`;
        } else if (question.slug === 'two-sum') {
            solution = `
class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            remaining = target - num
            if remaining in seen:
                return [seen[remaining], i]
            seen[num] = i
        return []
`;
        } else {
            console.log('\nUnsupported question slug for custom correct solution. Please write custom logic.');
            process.exit(0);
        }

        console.log('\n--- Running Correct Solution (Python) ---');
        const solutionResult = await runTestCases(
            solution,
            language,
            question.testCases,
            question.slug,
            null
        );
        console.log('Correct Solution Results:', JSON.stringify(solutionResult, null, 2));

        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}
main();
