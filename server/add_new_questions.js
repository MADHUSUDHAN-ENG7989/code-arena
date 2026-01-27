require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./src/models/Question');

const newQuestionsData = [
    {
        title: 'Remove Duplicates from Sorted Array',
        slug: 'remove-duplicates-from-sorted-array',
        description: `Given an integer array \`nums\` sorted in **non-decreasing order**, remove the duplicates **in-place** such that each unique element appears only **once**. The relative order of the elements should be kept the **same**.

Since it is impossible to change the length of the array in some languages, you must instead have the result be placed in the **first part** of the array \`nums\`. More formally, if there are \`k\` elements after removing the duplicates, then the first \`k\` elements of \`nums\` should hold the final result. It does not matter what you leave beyond the first \`k\` elements.

Return \`k\` after placing the final result in the first \`k\` slots of \`nums\`.

Do **not** allocate extra space for another array. You must do this by **modifying the input array in-place** with O(1) extra memory.`,
        difficulty: 'Easy',
        topic: 'Arrays',
        constraints: [
            '1 <= nums.length <= 3 * 10^4',
            '-100 <= nums[i] <= 100',
            'nums is sorted in non-decreasing order.'
        ],
        examples: [
            {
                input: 'nums = [1,1,2]',
                output: '2', // Simplified output for platform
                explanation: 'Your function should return k = 2, with the first two elements of nums being 1 and 2 respectively.'
            },
            {
                input: 'nums = [0,0,1,1,1,2,2,3,3,4]',
                output: '5',
                explanation: 'Your function should return k = 5, with the first five elements of nums being 0, 1, 2, 3, and 4 respectively.'
            }
        ],
        testCases: [
            { input: '1 1 2', output: '2', isHidden: false },
            { input: '0 0 1 1 1 2 2 3 3 4', output: '5', isHidden: false },
            { input: '1 2 3', output: '3', isHidden: true },
            { input: '1 1', output: '1', isHidden: true },
        ],
        starterCode: {
            javascript: `function removeDuplicates(nums) {
    // Your code here
}`,
            python: `class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        # Your code here
        pass`,
            java: `class Solution {
    public int removeDuplicates(int[] nums) {
        // Your code here
    }
}`,
            cpp: `class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        // Your code here
    }
};`,
            c: `int removeDuplicates(int* nums, int numsSize) {
    // Your code here
}`
        }
    },
    {
        title: 'Maximum Subarray',
        slug: 'maximum-subarray',
        description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.`,
        difficulty: 'Medium',
        topic: 'Arrays',
        constraints: [
            '1 <= nums.length <= 10^5',
            '-10^4 <= nums[i] <= 10^4'
        ],
        examples: [
            {
                input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
                output: '6',
                explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
            },
            {
                input: 'nums = [1]',
                output: '1',
                explanation: 'The subarray [1] has the largest sum 1.'
            },
            {
                input: 'nums = [5,4,-1,7,8]',
                output: '23',
                explanation: 'The subarray [5,4,-1,7,8] has the largest sum 23.'
            }
        ],
        testCases: [
            { input: '-2 1 -3 4 -1 2 1 -5 4', output: '6', isHidden: false },
            { input: '1', output: '1', isHidden: false },
            { input: '5 4 -1 7 8', output: '23', isHidden: false },
            { input: '-1', output: '-1', isHidden: true },
            { input: '-2 -1', output: '-1', isHidden: true },
        ],
        starterCode: {
            javascript: `function maxSubArray(nums) {
    // Your code here
}`,
            python: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        # Your code here
        pass`,
            java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Your code here
    }
}`,
            cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Your code here
    }
};`,
            c: `int maxSubArray(int* nums, int numsSize) {
    // Your code here
}`
        }
    },
    {
        title: 'Best Time to Buy and Sell Stock',
        slug: 'best-time-to-buy-and-sell-stock',
        description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return *the maximum profit you can achieve from this transaction*. If you cannot achieve any profit, return \`0\`.`,
        difficulty: 'Easy',
        topic: 'Dynamic Programming',
        constraints: [
            '1 <= prices.length <= 10^5',
            '0 <= prices[i] <= 10^4'
        ],
        examples: [
            {
                input: 'prices = [7,1,5,3,6,4]',
                output: '5',
                explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5. Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.'
            },
            {
                input: 'prices = [7,6,4,3,1]',
                output: '0',
                explanation: 'In this case, no transactions are done and the max profit = 0.'
            }
        ],
        testCases: [
            { input: '7 1 5 3 6 4', output: '5', isHidden: false },
            { input: '7 6 4 3 1', output: '0', isHidden: false },
            { input: '2 4 1', output: '2', isHidden: true },
            { input: '2 1 2 0 1', output: '1', isHidden: true },
        ],
        starterCode: {
            javascript: `function maxProfit(prices) {
    // Your code here
}`,
            python: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        # Your code here
        pass`,
            java: `class Solution {
    public int maxProfit(int[] prices) {
        // Your code here
    }
}`,
            cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        // Your code here
    }
};`,
            c: `int maxProfit(int* prices, int pricesSize) {
    // Your code here
}`
        }
    }
];

async function seedNewQuestions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        for (const q of newQuestionsData) {
            console.log(`Processing: ${q.title}`);
            await Question.findOneAndUpdate(
                { slug: q.slug },
                q,
                { upsert: true, new: true }
            );
            console.log(`  -> Upserted successfully.`);
        }

        console.log('\nAll new questions added/updated!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding new questions:', error);
        process.exit(1);
    }
}

seedNewQuestions();
