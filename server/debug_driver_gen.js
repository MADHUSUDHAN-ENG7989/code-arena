const { executeCode } = require('./src/services/codeExecutor');

// Mock axios to prevent actual network calls during this test
const axios = require('axios');
axios.post = async (url, data) => {
    console.log('[MOCK] Piston Payload:', JSON.stringify(data, null, 2));
    return { data: { run: { code: 0, stdout: 'Mock Success', stderr: '' } } };
};

const run = async () => {
    const code = `
class Solution {
    public int[] twoSum(int[] nums, int target) {
        return new int[]{0, 1};
    }
}
`;
    console.log('--- Testing Java Driver Generation ---');
    await executeCode(code, 'java', '2 7 11 15\n9', 'two-sum');
};

run();
