const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { executeCode } = require('./src/services/codeExecutor');

// Mock Questions Data (Simulating what will be in DB)
const QUESTIONS = {
    'remove-duplicates-from-sorted-array': {
        slug: 'remove-duplicates-from-sorted-array',
        testCases: [
            { input: '1 1 2', output: '2', isHidden: false },
            { input: '0 0 1 1 1 2 2 3 3 4', output: '5', isHidden: false },
            { input: '1 2 3', output: '3', isHidden: true },
            { input: '1 1', output: '1', isHidden: true },
        ],
        solutions: {
            javascript: `function removeDuplicates(nums) {
    if (nums.length === 0) return 0;
    let i = 0;
    for (let j = 1; j < nums.length; j++) {
        if (nums[j] !== nums[i]) {
            i++;
            nums[i] = nums[j];
        }
    }
    return i + 1;
}`,
            python: `class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        if not nums: return 0
        i = 0
        for j in range(1, len(nums)):
            if nums[j] != nums[i]:
                i += 1
                nums[i] = nums[j]
        return i + 1`,
            java: `class Solution {
    public int removeDuplicates(int[] nums) {
        if (nums.length == 0) return 0;
        int i = 0;
        for (int j = 1; j < nums.length; j++) {
            if (nums[j] != nums[i]) {
                i++;
                nums[i] = nums[j];
            }
        }
        return i + 1;
    }
}`,
            cpp: `class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        if (nums.empty()) return 0;
        int i = 0;
        for (int j = 1; j < nums.size(); j++) {
            if (nums[j] != nums[i]) {
                i++;
                nums[i] = nums[j];
            }
        }
        return i + 1;
    }
};`,
            c: `int removeDuplicates(int* nums, int numsSize) {
    if (numsSize == 0) return 0;
    int i = 0;
    for (int j = 1; j < numsSize; j++) {
        if (nums[j] != nums[i]) {
            i++;
            nums[i] = nums[j];
        }
    }
    return i + 1;
}`
        }
    },
    'maximum-subarray': {
        slug: 'maximum-subarray',
        testCases: [
            { input: '-2 1 -3 4 -1 2 1 -5 4', output: '6', isHidden: false },
            { input: '1', output: '1', isHidden: false },
            { input: '5 4 -1 7 8', output: '23', isHidden: false },
            { input: '-1', output: '-1', isHidden: true },
            { input: '-2 -1', output: '-1', isHidden: true },
        ],
        solutions: {
            javascript: `function maxSubArray(nums) {
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    for (let i = 1; i < nums.length; i++) {
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    return maxSoFar;
}`,
            python: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        max_so_far = nums[0]
        max_ending_here = nums[0]
        for i in range(1, len(nums)):
            max_ending_here = max(nums[i], max_ending_here + nums[i])
            max_so_far = max(max_so_far, max_ending_here)
        return max_so_far`,
            java: `class Solution {
    public int maxSubArray(int[] nums) {
        int maxSoFar = nums[0];
        int maxEndingHere = nums[0];
        for (int i = 1; i < nums.length; i++) {
            maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
            maxSoFar = Math.max(maxSoFar, maxEndingHere);
        }
        return maxSoFar;
    }
}`,
            cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int maxSoFar = nums[0];
        int maxEndingHere = nums[0];
        for (int i = 1; i < nums.size(); i++) {
            maxEndingHere = max(nums[i], maxEndingHere + nums[i]);
            maxSoFar = max(maxSoFar, maxEndingHere);
        }
        return maxSoFar;
    }
};`,
            c: `int maxSubArray(int* nums, int numsSize) {
    int maxSoFar = nums[0];
    int maxEndingHere = nums[0];
    for (int i = 1; i < numsSize; i++) {
        if (maxEndingHere + nums[i] > nums[i]) {
            maxEndingHere += nums[i];
        } else {
            maxEndingHere = nums[i];
        }
        if (maxEndingHere > maxSoFar) {
            maxSoFar = maxEndingHere;
        }
    }
    return maxSoFar;
}`
        }
    },
    'best-time-to-buy-and-sell-stock': {
        slug: 'best-time-to-buy-and-sell-stock',
        testCases: [
            { input: '7 1 5 3 6 4', output: '5', isHidden: false },
            { input: '7 6 4 3 1', output: '0', isHidden: false },
            { input: '2 4 1', output: '2', isHidden: true },
        ],
        solutions: {
            javascript: `function maxProfit(prices) {
    let minPrice = Infinity;
    let maxProfit = 0;
    for (let price of prices) {
        if (price < minPrice) {
            minPrice = price;
        } else if (price - minPrice > maxProfit) {
            maxProfit = price - minPrice;
        }
    }
    return maxProfit;
}`,
            python: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        min_price = float('inf')
        max_profit = 0
        for price in prices:
            if price < min_price:
                min_price = price
            elif price - min_price > max_profit:
                max_profit = price - min_price
        return max_profit`,
            java: `class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int price : prices) {
            if (price < minPrice) {
                minPrice = price;
            } else if (price - minPrice > maxProfit) {
                maxProfit = price - minPrice;
            }
        }
        return maxProfit;
    }
}`,
            cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = INT_MAX;
        int maxProfit = 0;
        for (int price : prices) {
            if (price < minPrice) {
                minPrice = price;
            } else if (price - minPrice > maxProfit) {
                maxProfit = price - minPrice;
            }
        }
        return maxProfit;
    }
};`,
            c: `int maxProfit(int* prices, int pricesSize) {
    int minPrice = 2147483647;
    int maxProfit = 0;
    for (int i = 0; i < pricesSize; i++) {
        if (prices[i] < minPrice) {
            minPrice = prices[i];
        } else if (prices[i] - minPrice > maxProfit) {
            maxProfit = prices[i] - minPrice;
        }
    }
    return maxProfit;
}`
        }
    }
};

async function testAll() {
    console.log("Starting Verification for New Questions...\n");
    let globalFail = false;

    for (const [slug, data] of Object.entries(QUESTIONS)) {
        console.log(`=== Testing Question: ${slug} ===`);
        for (const [lang, code] of Object.entries(data.solutions)) {
            process.stdout.write(`  Language: ${lang.padEnd(10)} | `);
            let langPass = true;
            for (const tc of data.testCases) {
                try {
                    const result = await executeCode(code, lang, tc.input, slug);
                    const output = result.output ? result.output.trim() : '';
                    const expected = tc.output.trim();
                    if (output !== expected) {
                        console.log(`\n    [FAIL] Input: ${tc.input}`);
                        console.log(`           Expected: ${expected}`);
                        console.log(`           Got:      ${output}`);
                        if (result.error) console.log(`           Error:    ${result.error}`);
                        langPass = false;
                        globalFail = true;
                        break; // Stop testing this lang on first fail
                    }
                } catch (e) {
                    console.log(`\n    [ERROR] Exception: ${e.message}`);
                    langPass = false;
                    globalFail = true;
                    break;
                }
            }
            if (langPass) {
                console.log("PASSED (All Test Cases)");
            } else {
                console.log("-> FAILED");
            }
        }
        console.log("");
    }

    if (globalFail) {
        console.error("❌ Some tests failed. Please fix before seeding.");
        process.exit(1);
    } else {
        console.log("✅ All tests passed! Ready to seed.");
        process.exit(0);
    }
}

testAll();
