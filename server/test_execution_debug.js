const { runTestCases } = require('./src/services/codeExecutor');

const code = `function twoSum(nums, target) {
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

const language = 'javascript';
const slug = 'two-sum';
const testCases = [
    { input: '2 7 11 15\n9', output: '0 1' },
    { input: '3 2 4\n6', output: '1 2' }
];

async function test() {
    console.log('Starting test execution...');
    try {
        const result = await runTestCases(code, language, testCases, slug);
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
