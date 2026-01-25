const axios = require('axios');
const code = `
def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i+1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
`;

const driver = `
import sys
if __name__ == '__main__':
    try:
        input_str = sys.stdin.read().strip()
        if input_str:
            lines = input_str.split('\\n')
            nums = list(map(int, lines[0].strip().split()))
            target = int(lines[1].strip())
            ret = two_sum(nums, target)
            if isinstance(ret, list):
                print(f"{ret[0]} {ret[1]}")
            else:
                print(ret)
    except Exception as e:
        print(e)
`;

const finalCode = code + driver;
const input = "2 7 11 15\n9";

(async () => {
    try {
        console.log('Testing Full Piston Payload...');
        const res = await axios.post('https://emkc.org/api/v2/piston/execute', {
            language: 'python',
            version: '3.10.0',
            files: [{ content: finalCode }],
            stdin: input
        });
        console.log('Response:', JSON.stringify(res.data.run));
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) console.error('Data:', e.response.data);
    }
})();
