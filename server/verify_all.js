const { executeCode } = require('./src/services/codeExecutor');
const axios = require('axios');

// Mock Piston to avoid network calls and just inspect the generated driver
axios.post = async (url, payload) => {
    console.log(`\n--- [MOCK PISTON] Language: ${payload.language} ---`);
    console.log("File Name:", payload.files[0].name);
    console.log("File Content Preview (First 500 chars):");
    console.log(payload.files[0].content.substring(0, 500));
    console.log("...\nFile Content Tail (Last 500 chars):");
    console.log(payload.files[0].content.slice(-500));
    return { data: { run: { code: 0, stdout: 'Mock Success', stderr: '' } } };
};

const run = async () => {
    // 1. Test C++ Two Sum
    const cppCode = `
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        return {0, 1};
    }
};
`;
    await executeCode(cppCode, 'cpp', '2 7 11 15\n9', 'two-sum');

    // 2. Test C Two Sum
    const cCode = `
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* res = (int*)malloc(2 * sizeof(int));
    res[0] = 0; res[1] = 1;
    return res;
}
`;
    await executeCode(cCode, 'c', '2 7 11 15\n9', 'two-sum');
};

run();
