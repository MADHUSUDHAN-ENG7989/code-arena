const axios = require('axios');

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

const userCode = `def two_sum(nums, target):
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]`;

const sysRead = `
import sys
input_str = sys.stdin.read().strip()
if not input_str:
    sys.exit(0)
lines = input_str.split('\\n')
`;

const driverCode = `
${sysRead}
nums = list(map(int, lines[0].strip().split()))
target = int(lines[1].strip())
result = two_sum(nums, target)
if isinstance(result, list):
    print(f"{result[0]} {result[1]}")
else:
    print(result)
`;

const finalCode = userCode + driverCode;

const inputs = [
    { input: '2 7 11 15\n9', expected: '0 1' },
    { input: '3 2 4\n6', expected: '1 2' }
];

async function run() {
    for (const test of inputs) {
        console.log('--- Testing Input:', JSON.stringify(test.input), '---');
        console.log('Code length:', finalCode.length);

        try {
            const response = await axios.post(PISTON_API_URL, {
                language: 'python',
                version: '3.10.0',
                files: [{ content: finalCode }],
                stdin: test.input
            });

            const run = response.data.run;
            console.log('Status:', run.code === 0 ? 'Success' : 'Failed');
            console.log('Stdout:', JSON.stringify(run.stdout));
            console.log('Stderr:', run.stderr);

            const actual = run.stdout ? run.stdout.trim() : '';
            console.log('Match?', actual === test.expected);
        } catch (e) {
            console.error('Error:', e.message);
            if (e.response) console.error(e.response.data);
        }
    }
}

run();
