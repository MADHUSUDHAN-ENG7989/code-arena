const { executeCode } = require('./src/services/codeExecutor');

const runTests = async () => {
    console.log("--- Testing Two Sum (JS) ---");
    const jsTwoSum = `
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
}
    `;
    const res1 = await executeCode(jsTwoSum, 'javascript', '2 7 11 15\n9', 'two-sum');
    console.log("Result:", res1);

    console.log("\n--- Testing Valid Parentheses (Python) ---");
    const pyValid = `
def is_valid(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return False
        else:
            stack.append(char)
    return not stack
    `;
    const res2 = await executeCode(pyValid, 'python', '()[]{}', 'valid-parentheses');
    console.log("Result:", res2);
};

runTests();
