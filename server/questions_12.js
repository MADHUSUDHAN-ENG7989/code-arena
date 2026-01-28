const questions12 = [
    {
        title: 'Subarray with Given Sum',
        slug: 'subarray-with-given-sum',
        description: `Given an unsorted array \`nums\` of non-negative integers and an integer \`target\`, find a continuous subarray which adds to a given number. return the starting and ending positions (0-indexed) of the first occurrence of the subarray. If no such subarray exists, return \`[-1, -1]\`.`,
        difficulty: 'Medium',
        topic: 'Arrays',
        constraints: ['1 <= nums.length <= 10^5', '0 <= nums[i] <= 10^9', '0 <= target <= 10^9'],
        examples: [
            { input: 'nums = [1, 4, 20, 3, 10, 5], target = 33', output: '[2, 4]', explanation: 'Sum of elements between indices 2 and 4 is 20 + 3 + 10 = 33.' },
            { input: 'nums = [1, 4, 0, 0, 3, 10, 5], target = 7', output: '[1, 4]', explanation: 'Sum of elements between indices 1 and 4 is 4 + 0 + 0 + 3 = 7.' }
        ],
        testCases: [
            { input: '1 4 20 3 10 5\\n33', output: '2 4', isHidden: false },
            { input: '1 4 0 0 3 10 5\\n7', output: '1 4', isHidden: false },
            { input: '1 2 3 7 5\\n12', output: '1 3', isHidden: true },
            { input: '1 2 3\\n100', output: '-1 -1', isHidden: true }
        ],
        starterCode: {
            javascript: `function subarraySum(nums, target) {\n    // Your code here\n}`,
            python: `class Solution:\n    def subarraySum(self, nums: List[int], target: int) -> List[int]:\n        # Your code here\n        pass`,
            java: `class Solution {\n    public int[] subarraySum(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}`,
            cpp: `class Solution {\npublic:\n    vector<int> subarraySum(vector<int>& nums, int target) {\n        // Your code here\n        return {};\n    }\n};`,
            c: `int* subarraySum(int* nums, int numsSize, int target, int* returnSize) {\n    // Your code here\n    *returnSize = 0;\n    return NULL;\n}`
        }
    },
    {
        title: 'Maximum Product Subarray',
        slug: 'maximum-product-subarray',
        description: `Given an integer array \`nums\`, find a contiguous non-empty subarray within the array that has the largest product, and return the product.`,
        difficulty: 'Medium',
        topic: 'Arrays',
        constraints: ['1 <= nums.length <= 2 * 10^4', '-10 <= nums[i] <= 10'],
        examples: [
            { input: 'nums = [2,3,-2,4]', output: '6', explanation: '[2,3] has the largest product 6.' },
            { input: 'nums = [-2,0,-1]', output: '0', explanation: 'The result cannot be 2, because [-2,-1] is not a subarray.' }
        ],
        testCases: [
            { input: '2 3 -2 4', output: '6', isHidden: false },
            { input: '-2 0 -1', output: '0', isHidden: false },
            { input: '-2 3 -4', output: '24', isHidden: true },
            { input: '0 2', output: '2', isHidden: true }
        ],
        starterCode: {
            javascript: `function maxProduct(nums) {\n    // Your code here\n}`,
            python: `class Solution:\n    def maxProduct(self, nums: List[int]) -> int:\n        # Your code here\n        pass`,
            java: `class Solution {\n    public int maxProduct(int[] nums) {\n        // Your code here\n        return 0;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    int maxProduct(vector<int>& nums) {\n        // Your code here\n        return 0;\n    }\n};`,
            c: `int maxProduct(int* nums, int numsSize) {\n    // Your code here\n    return 0;\n}`
        }
    },
    {
        title: 'Rotate Array by K Positions',
        slug: 'rotate-array-by-k-positions',
        description: `Given an array \`nums\`, rotate the array to the right by \`k\` steps, where \`k\` is non-negative. Do this in-place.`,
        difficulty: 'Medium',
        topic: 'Arrays',
        constraints: ['1 <= nums.length <= 10^5', '0 <= k <= 10^5'],
        examples: [
            { input: 'nums = [1,2,3,4,5,6,7], k = 3', output: '[5,6,7,1,2,3,4]', explanation: 'rotate 1 steps to the right: [7,1,2,3,4,5,6]\nrotate 2 steps to the right: [6,7,1,2,3,4,5]\nrotate 3 steps to the right: [5,6,7,1,2,3,4]' }
        ],
        testCases: [
            { input: '1 2 3 4 5 6 7\\n3', output: '5 6 7 1 2 3 4', isHidden: false },
            { input: '-1 -100 3 99\\n2', output: '3 99 -1 -100', isHidden: false },
            { input: '1 2\\n3', output: '2 1', isHidden: true }
        ],
        starterCode: {
            javascript: `function rotate(nums, k) {\n    // Your code here - return the rotated array\n}`,
            python: `class Solution:\n    def rotate(self, nums: List[int], k: int) -> List[int]:\n        # Your code here\n        return nums`,
            java: `class Solution {\n    public int[] rotate(int[] nums, int k) {\n        // Your code here - return result for validation\n        return nums;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    vector<int> rotate(vector<int>& nums, int k) {\n        // Your code here\n        return nums;\n    }\n};`,
            c: `int* rotate(int* nums, int numsSize, int k, int* returnSize) {\n    // Your code here - return modified array\n    *returnSize = numsSize;\n    return nums;\n}`
        }
    },
    {
        title: 'Find All Leaders in an Array',
        slug: 'find-all-leaders-in-an-array',
        description: `An element is a leader if it is strictly greater than all elements to its right side. The rightmost element is always a leader. Return all leaders in the array.`,
        difficulty: 'Medium',
        topic: 'Arrays',
        constraints: ['1 <= nums.length <= 10^6'],
        examples: [
            { input: 'nums = [16, 17, 4, 3, 5, 2]', output: '[17, 5, 2]', explanation: '17 > 4,3,5,2. 5 > 2. 2 is rightmost.' }
        ],
        testCases: [
            { input: '16 17 4 3 5 2', output: '17 5 2', isHidden: false },
            { input: '1 2 3 4 5', output: '5', isHidden: false },
            { input: '5 4 3 2 1', output: '5 4 3 2 1', isHidden: true }
        ],
        starterCode: {
            javascript: `function leaders(nums) {\n    // Your code here\n}`,
            python: `class Solution:\n    def leaders(self, nums: List[int]) -> List[int]:\n        # Your code here\n        pass`,
            java: `class Solution {\n    public int[] leaders(int[] nums) {\n        // Your code here\n        return new int[]{};\n    }\n}`,
            cpp: `class Solution {\npublic:\n    vector<int> leaders(vector<int>& nums) {\n        // Your code here\n        return {};\n    }\n};`,
            c: `int* leaders(int* nums, int numsSize, int* returnSize) {\n    // Your code here\n    *returnSize = 0;\n    return NULL;\n}`
        }
    },
    {
        title: 'Longest Consecutive Subsequence',
        slug: 'longest-consecutive-subsequence',
        description: `Given an unsorted array of integers \`nums\`, find the length of the longest consecutive elements sequence. You must write an algorithm that runs in \`O(n)\` time.`,
        difficulty: 'Medium',
        topic: 'Arrays',
        constraints: ['0 <= nums.length <= 10^5'],
        examples: [
            { input: 'nums = [100,4,200,1,3,2]', output: '4', explanation: 'The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4.' }
        ],
        testCases: [
            { input: '100 4 200 1 3 2', output: '4', isHidden: false },
            { input: '0 3 7 2 5 8 4 6 0 1', output: '9', isHidden: false },
            { input: '1 2 0 1', output: '3', isHidden: true }
        ],
        starterCode: {
            javascript: `function longestConsecutive(nums) {\n    // Your code here\n}`,
            python: `class Solution:\n    def longestConsecutive(self, nums: List[int]) -> int:\n        # Your code here\n        pass`,
            java: `class Solution {\n    public int longestConsecutive(int[] nums) {\n        // Your code here\n        return 0;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    int longestConsecutive(vector<int>& nums) {\n        // Your code here\n        return 0;\n    }\n};`,
            c: `int longestConsecutive(int* nums, int numsSize) {\n    // Your code here\n    return 0;\n}`
        }
    },
    {
        title: 'Rearrange Array Alternately',
        slug: 'rearrange-array-alternately',
        description: `Given a sorted array of positive integers, rearrange the array elements alternatively i.e first element should be the maximum value, second should be the minimum value, third should be the second maximum, fourth the second minimum and so on.`,
        difficulty: 'Medium',
        topic: 'Arrays',
        constraints: ['1 <= nums.length <= 10^5'],
        examples: [
            { input: 'nums = [1,2,3,4,5,6]', output: '[6,1,5,2,4,3]', explanation: '' }
        ],
        testCases: [
            { input: '1 2 3 4 5 6', output: '6 1 5 2 4 3', isHidden: false },
            { input: '10 20 30 40 50', output: '50 10 40 20 30', isHidden: false },
            { input: '1', output: '1', isHidden: true }
        ],
        starterCode: {
            javascript: `function rearrange(nums) {\n    // Return the modified array\n}`,
            python: `class Solution:\n    def rearrange(self, nums: List[int]) -> List[int]:\n        # Return the modified list\n        return nums`,
            java: `class Solution {\n    public int[] rearrange(int[] nums) {\n        // Return the modified array\n        return nums;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    vector<int> rearrange(vector<int>& nums) {\n        // Return the modified array\n        return nums;\n    }\n};`,
            c: `int* rearrange(int* nums, int numsSize, int* returnSize) {\n    // Return the modified array\n    *returnSize = numsSize;\n    return nums;\n}`
        }
    },
    {
        title: 'Find Missing and Repeating Number',
        slug: 'find-missing-and-repeating-number',
        description: `Given an unsorted array \`arr\` of size \`n\` of non-negative integers. One number 'A' from set {1, 2, .... n} is missing and one number 'B' occurs twice in array. Find these two numbers. Return as [B, A] (repeating, missing).`,
        difficulty: 'Medium',
        topic: 'Arrays',
        constraints: ['1 <= n <= 10^5'],
        examples: [
            { input: 'arr = [1, 3, 3]', output: '[3, 2]', explanation: 'Repeating is 3, Missing is 2' }
        ],
        testCases: [
            { input: '1 3 3', output: '3 2', isHidden: false },
            { input: '4 3 6 2 1 1', output: '1 5', isHidden: false },
            { input: '1 2', output: '-1 -1', isHidden: true }
        ],
        starterCode: {
            javascript: `function findTwoElement(arr) {\n    // Your code here\n}`,
            python: `class Solution:\n    def findTwoElement(self, arr: List[int]) -> List[int]:\n        # Your code here\n        pass`,
            java: `class Solution {\n    public int[] findTwoElement(int[] arr) {\n        // Your code here\n        return new int[]{};\n    }\n}`,
            cpp: `class Solution {\npublic:\n    vector<int> findTwoElement(vector<int>& arr) {\n        // Your code here\n        return {};\n    }\n};`,
            c: `int* findTwoElement(int* arr, int arrSize, int* returnSize) {\n    // Your code here\n    *returnSize = 0;\n    return NULL;\n}`
        }
    },
    {
        title: 'Count Subarrays with Equal 0s and 1s',
        slug: 'count-subarrays-with-equal-0s-and-1s',
        description: `Given a binary array \`arr\`, count the number of subarrays with an equal number of 0s and 1s.`,
        difficulty: 'Medium',
        topic: 'Arrays',
        constraints: ['1 <= arr.length <= 10^5', 'arr[i] is 0 or 1'],
        examples: [
            { input: 'arr = [1,0,0,1,0,1,1]', output: '8', explanation: '' }
        ],
        testCases: [
            { input: '1 0 0 1 0 1 1', output: '8', isHidden: false },
            { input: '1 0', output: '1', isHidden: false },
            { input: '1 1 1', output: '0', isHidden: true }
        ],
        starterCode: {
            javascript: `function countSubarrWithEqualZeroAndOne(arr) {\n    // Your code here\n}`,
            python: `class Solution:\n    def countSubarrWithEqualZeroAndOne(self, arr: List[int]) -> int:\n        # Your code here\n        pass`,
            java: `class Solution {\n    public int countSubarrWithEqualZeroAndOne(int[] arr) {\n        // Your code here\n        return 0;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    int countSubarrWithEqualZeroAndOne(vector<int>& arr) {\n        // Your code here\n        return 0;\n    }\n};`,
            c: `int countSubarrWithEqualZeroAndOne(int* arr, int arrSize) {\n    // Your code here\n    return 0;\n}`
        }
    },
    {
        title: 'Merge Intervals',
        slug: 'merge-intervals',
        description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.\\n\\nInput Format: A string representation of the intervals, e.g., "[[1,3],[2,6],[8,10]]".\\nOutput Format: A string representation of the merged intervals.`,
        difficulty: 'Medium',
        topic: 'Arrays',
        constraints: ['1 <= intervals.length <= 10^4'],
        examples: [
            { input: 'intervals = "[[1,3],[2,6],[8,10],[15,18]]"', output: '[[1,6],[8,10],[15,18]]', explanation: 'Intervals [1,3] and [2,6] overlap, merging them into [1,6].' }
        ],
        testCases: [
            { input: '[[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', isHidden: false },
            { input: '[[1,4],[4,5]]', output: '[[1,5]]', isHidden: false },
            { input: '[[1,4],[0,4]]', output: '[[0,4]]', isHidden: true }
        ],
        starterCode: {
            javascript: `function merge(intervalsStr) {\n    const intervals = JSON.parse(intervalsStr);\n    // Your code here\n    // Return array of arrays\n}`,
            python: `import json\nclass Solution:\n    def merge(self, intervalsStr: str) -> str:\n        intervals = json.loads(intervalsStr)\n        # Your code here\n        # Return list of lists or string\n        pass`,
            java: `class Solution {\n    public String merge(String intervalsStr) {\n        // Parse input string manually or assume helper\n        return "[]";\n    }\n}`,
            cpp: `class Solution {\npublic:\n    string merge(string intervalsStr) {\n        // Your code here\n        return "[]";\n    }\n};`,
            c: `char* merge(char* intervalsStr) {\n    // Your code here\n    return "[]";\n}`
        }
    },
    {
        title: 'Find Peak Element',
        slug: 'find-peak-element',
        description: `A peak element is an element that is strictly greater than its neighbors. Given a 0-indexed integer array \`nums\`, find a peak element, and return its index. If the array contains multiple peaks, return the index to any of the peaks.`,
        difficulty: 'Medium',
        topic: 'Binary Search',
        constraints: ['1 <= nums.length <= 1000'],
        examples: [
            { input: 'nums = [1,2,3,1]', output: '2', explanation: '3 is a peak element and your function should return the index number 2.' }
        ],
        testCases: [
            { input: '1 2 3 1', output: '2', isHidden: false },
            { input: '1 2 1 3 5 6 4', output: '5', isHidden: false } // 6 is peak at index 5. 2 is also peak at index 1.
        ],
        starterCode: {
            javascript: `function findPeakElement(nums) {\n    // Your code here\n}`,
            python: `class Solution:\n    def findPeakElement(self, nums: List[int]) -> int:\n        # Your code here\n        pass`,
            java: `class Solution {\n    public int findPeakElement(int[] nums) {\n        // Your code here\n        return 0;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    int findPeakElement(vector<int>& nums) {\n        // Your code here\n        return 0;\n    }\n};`,
            c: `int findPeakElement(int* nums, int numsSize) {\n    // Your code here\n    return 0;\n}`
        }
    },
    {
        title: 'Smallest Subarray with Sum Greater Than X',
        slug: 'smallest-subarray-with-sum-greater-than-x',
        description: `Given an array of integers \`a\` and a number \`x\`, find the smallest subarray with sum greater than the given value. If no such subarray exists, return 0.`,
        difficulty: 'Medium',
        topic: 'Arrays',
        constraints: ['1 <= a.length <= 10^5', '0 <= x <= 10^9'],
        examples: [
            { input: 'a = [1, 4, 45, 6, 0, 19], x = 51', output: '3', explanation: 'Minimum length subarray is [4, 45, 6].' }
        ],
        testCases: [
            { input: '1 4 45 6 0 19\\n51', output: '3', isHidden: false },
            { input: '1 10 5 2 7\\n9', output: '1', isHidden: false },
            { input: '1 2 3 4\\n100', output: '0', isHidden: true }
        ],
        starterCode: {
            javascript: `function smallestSubWithSum(a, x) {\n    // Your code here\n}`,
            python: `class Solution:\n    def smallestSubWithSum(self, a: List[int], x: int) -> int:\n        # Your code here\n        pass`,
            java: `class Solution {\n    public int smallestSubWithSum(int[] a, int x) {\n        // Your code here\n        return 0;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    int smallestSubWithSum(vector<int>& a, int x) {\n        // Your code here\n        return 0;\n    }\n};`,
            c: `int smallestSubWithSum(int* a, int aSize, int x) {\n    // Your code here\n    return 0;\n}`
        }
    },
    {
        title: 'Maximum Sum Circular Subarray',
        slug: 'maximum-sum-circular-subarray',
        description: `Given a circular integer array \`nums\` of length \`n\`, return the maximum possible sum of a non-empty subarray of \`nums\`.`,
        difficulty: 'Medium',
        topic: 'Arrays',
        constraints: ['1 <= nums.length <= 3 * 10^4'],
        examples: [
            { input: 'nums = [1,-2,3,-2]', output: '3', explanation: 'Subarray [3] has maximum sum 3.' },
            { input: 'nums = [5,-3,5]', output: '10', explanation: 'Subarray [5,5] has maximum sum 5 + 5 = 10.' }
        ],
        testCases: [
            { input: '1 -2 3 -2', output: '3', isHidden: false },
            { input: '5 -3 5', output: '10', isHidden: false },
            { input: '-3 -2 -3', output: '-2', isHidden: true }
        ],
        starterCode: {
            javascript: `function maxSubarraySumCircular(nums) {\n    // Your code here\n}`,
            python: `class Solution:\n    def maxSubarraySumCircular(self, nums: List[int]) -> int:\n        # Your code here\n        pass`,
            java: `class Solution {\n    public int maxSubarraySumCircular(int[] nums) {\n        // Your code here\n        return 0;\n    }\n}`,
            cpp: `class Solution {\npublic:\n    int maxSubarraySumCircular(vector<int>& nums) {\n        // Your code here\n        return 0;\n    }\n};`,
            c: `int maxSubarraySumCircular(int* nums, int numsSize) {\n    // Your code here\n    return 0;\n}`
        }
    }
];

module.exports = questions12;
