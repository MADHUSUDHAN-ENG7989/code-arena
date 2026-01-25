const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { executeCode } = require('./src/services/codeExecutor');

async function testPythonLIS() {
    console.log('Testing Python LIS Execution...');

    const pythonCode = `
class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        if not nums:
            return 0
        dp = []
        for x in nums:
            import bisect
            i = bisect.bisect_left(dp, x)
            if i == len(dp):
                dp.append(x)
            else:
                dp[i] = x
        return len(dp)
`;

    const input = `
10 9 2 5 3 7 101 18
`;

    try {
        const result = await executeCode(pythonCode, 'python', input, 'longest-increasing-subsequence');
        console.log('Execution Result:', JSON.stringify(result, null, 2));

        if (result.status === 'success' && result.output.trim() === '4') {
            console.log('✅ Python LIS Test Passed!');
        } else {
            console.error('❌ Python LIS Test Failed!');
        }
    } catch (error) {
        console.error('Execution Error:', error);
    }
}

testPythonLIS();
