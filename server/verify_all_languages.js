const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { executeCode } = require('./src/services/codeExecutor');
const Question = require('./src/models/Question');
const mongoose = require('mongoose');

const SOLUTIONS = {
    'two-sum': {
        javascript: `function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }`,
        python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            complement = target - num\n            if complement in seen:\n                return [seen[complement], i]\n            seen[num] = i\n        return []`,
        java: `class Solution { public int[] twoSum(int[] nums, int target) { Map<Integer, Integer> map = new HashMap<>(); for (int i = 0; i < nums.length; i++) { int complement = target - nums[i]; if (map.containsKey(complement)) { return new int[] { map.get(complement), i }; } map.put(nums[i], i); } return new int[0]; } }`,
        cpp: `class Solution { public: vector<int> twoSum(vector<int>& nums, int target) { unordered_map<int, int> map; for (int i = 0; i < nums.size(); i++) { int complement = target - nums[i]; if (map.count(complement)) { return {map[complement], i}; } map[nums[i]] = i; } return {}; } };`,
        c: `/** Note: The returned array must be malloced. */ int* twoSum(int* nums, int numsSize, int target, int* returnSize) { for (int i = 0; i < numsSize; i++) { for (int j = i + 1; j < numsSize; j++) { if (nums[i] + nums[j] == target) { int* ret = (int*)malloc(2 * sizeof(int)); ret[0] = i; ret[1] = j; *returnSize = 2; return ret; } } } *returnSize = 0; return 0; }`
    }
};

async function verifyAll() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const questions = await Question.find({ slug: 'two-sum' });
        console.log('Testing Two Sum...');

        let totalTests = 0;
        let passedTests = 0;

        for (const question of questions) {
            const slug = question.slug;
            const relevantSolution = SOLUTIONS[slug];
            const sampleTestCase = question.testCases[0];
            const input = sampleTestCase.input;
            const expectedOutput = sampleTestCase.output;

            for (const [lang, code] of Object.entries(relevantSolution)) {
                totalTests++;
                process.stdout.write(`Testing ${lang}... `);

                try {
                    const result = await executeCode(code, lang, input, slug);
                    const output = result.output ? result.output.trim() : '';
                    const expected = expectedOutput.trim();

                    if (output === expected) {
                        console.log('PASSED');
                        passedTests++;
                    } else {
                        console.log(`FAILED (Mismatch) Exp: '${expected}' Got: '${output}'`);
                        if (result.error) console.log(`Error: ${result.error}`);
                    }
                } catch (err) {
                    console.log(`FAILED (Exception): ${err.message}`);
                }
            }
        }
        console.log(`Summary: ${passedTests}/${totalTests} Passed`);
        process.exit(0);
    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
}

verifyAll();
