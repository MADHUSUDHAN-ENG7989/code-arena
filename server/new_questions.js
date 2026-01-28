const questions = [
    {
        "title": "Palindrome Number",
        "slug": "palindrome-number",
        "description": "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\nAn integer is a palindrome when it reads the same forward and backward.\nFor example, `121` is a palindrome while `123` is not.",
        "difficulty": "Easy",
        "topic": "Math",
        "constraints": [
            "-2^31 <= x <= 2^31 - 1"
        ],
        "examples": [
            {
                "input": "x = 121",
                "output": "true",
                "explanation": "121 reads as 121 from left to right and from right to left."
            },
            {
                "input": "x = -121",
                "output": "false",
                "explanation": "From left to right, it reads -121. From right to left, it becomes 121-."
            }
        ],
        "testCases": [
            {
                "input": "121",
                "output": "true",
                "isHidden": false
            },
            {
                "input": "-121",
                "output": "false",
                "isHidden": false
            },
            {
                "input": "10",
                "output": "false",
                "isHidden": false
            },
            {
                "input": "0",
                "output": "true",
                "isHidden": true
            },
            {
                "input": "12321",
                "output": "true",
                "isHidden": true
            },
            {
                "input": "1001",
                "output": "true",
                "isHidden": true
            },
            {
                "input": "11",
                "output": "true",
                "isHidden": true
            }
        ],
        "starterCode": {
            "javascript": "function isPalindrome(x) {\n    // Your code here\n}",
            "python": "class Solution:\n    def isPalindrome(self, x):\n        # Your code here\n        pass",
            "java": "class Solution {\n    public boolean isPalindrome(int x) {\n        // Your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        // Your code here\n    }\n};",
            "c": "bool isPalindrome(int x) {\n    // Your code here\n}"
        }
    },
    {
        "title": "Missing Number",
        "slug": "missing-number",
        "description": "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.",
        "difficulty": "Easy",
        "topic": "Arrays",
        "constraints": [
            "n == nums.length",
            "1 <= n <= 10^4",
            "0 <= nums[i] <= n",
            "All the numbers of nums are unique."
        ],
        "examples": [
            {
                "input": "nums = [3,0,1]",
                "output": "2",
                "explanation": "n = 3 since there are 3 numbers, so all numbers are in the range [0,3]. 2 is the missing number."
            },
            {
                "input": "nums = [0,1]",
                "output": "2",
                "explanation": "n = 2 since there are 2 numbers, so all numbers are in the range [0,2]. 2 is the missing number."
            }
        ],
        "testCases": [
            {
                "input": "3 0 1",
                "output": "2",
                "isHidden": false
            },
            {
                "input": "0 1",
                "output": "2",
                "isHidden": false
            },
            {
                "input": "9 6 4 2 3 5 7 0 1",
                "output": "8",
                "isHidden": false
            },
            {
                "input": "0",
                "output": "1",
                "isHidden": true
            }
        ],
        "starterCode": {
            "javascript": "function missingNumber(nums) {\n    // Your code here\n}",
            "python": "class Solution:\n    def missingNumber(self, nums):\n        # Your code here\n        pass",
            "java": "class Solution {\n    public int missingNumber(int[] nums) {\n        // Your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int missingNumber(vector<int>& nums) {\n        // Your code here\n    }\n};",
            "c": "int missingNumber(int* nums, int numsSize) {\n    // Your code here\n}"
        }
    },
    {
        "title": "Climbing Stairs",
        "slug": "climbing-stairs",
        "description": "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        "difficulty": "Easy",
        "topic": "Dynamic Programming",
        "constraints": [
            "1 <= n <= 45"
        ],
        "examples": [
            {
                "input": "n = 2",
                "output": "2",
                "explanation": "There are two ways to climb to the top. 1. 1 step + 1 step. 2. 2 steps."
            },
            {
                "input": "n = 3",
                "output": "3",
                "explanation": "Three ways: 1+1+1, 1+2, 2+1."
            }
        ],
        "testCases": [
            {
                "input": "2",
                "output": "2",
                "isHidden": false
            },
            {
                "input": "3",
                "output": "3",
                "isHidden": false
            },
            {
                "input": "4",
                "output": "5",
                "isHidden": true
            },
            {
                "input": "5",
                "output": "8",
                "isHidden": true
            },
            {
                "input": "1",
                "output": "1",
                "isHidden": true
            },
            {
                "input": "10",
                "output": "89",
                "isHidden": true
            }
        ],
        "starterCode": {
            "javascript": "function climbStairs(n) {\n    // Your code here\n}",
            "python": "class Solution:\n    def climbStairs(self, n):\n        # Your code here\n        pass",
            "java": "class Solution {\n    public int climbStairs(int n) {\n        // Your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int climbStairs(int n) {\n        // Your code here\n    }\n};",
            "c": "int climbStairs(int n) {\n    // Your code here\n}"
        }
    },
    {
        "title": "Best Time to Buy and Sell Stock",
        "slug": "best-time-to-buy-and-sell-stock",
        "description": "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
        "difficulty": "Easy",
        "topic": "Dynamic Programming",
        "constraints": [
            "1 <= prices.length <= 10^5",
            "0 <= prices[i] <= 10^4"
        ],
        "examples": [
            {
                "input": "prices = [7,1,5,3,6,4]",
                "output": "5",
                "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
            },
            {
                "input": "prices = [7,6,4,3,1]",
                "output": "0",
                "explanation": "In this case, no transactions are done and the max profit = 0."
            }
        ],
        "testCases": [
            {
                "input": "7 1 5 3 6 4",
                "output": "5",
                "isHidden": false
            },
            {
                "input": "7 6 4 3 1",
                "output": "0",
                "isHidden": false
            },
            {
                "input": "1 2",
                "output": "1",
                "isHidden": true
            },
            {
                "input": "2 4 1",
                "output": "2",
                "isHidden": true
            },
            {
                "input": "2 1 2 0 1",
                "output": "1",
                "isHidden": true
            }
        ],
        "starterCode": {
            "javascript": "function maxProfit(prices) {\n    // Your code here\n}",
            "python": "class Solution:\n    def maxProfit(self, prices):\n        # Your code here\n        pass",
            "java": "class Solution {\n    public int maxProfit(int[] prices) {\n        // Your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Your code here\n    }\n};",
            "c": "int maxProfit(int* prices, int pricesSize) {\n    // Your code here\n}"
        }
    },
    {
        "title": "Search Insert Position",
        "slug": "search-insert-position",
        "description": "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
        "difficulty": "Easy",
        "topic": "Arrays",
        "constraints": [
            "1 <= nums.length <= 10^4",
            "-10^4 <= nums[i] <= 10^4",
            "nums contains distinct values sorted in ascending order.",
            "-10^4 <= target <= 10^4"
        ],
        "examples": [
            {
                "input": "nums = [1,3,5,6], target = 5",
                "output": "2",
                "explanation": "5 is at index 2."
            },
            {
                "input": "nums = [1,3,5,6], target = 2",
                "output": "1",
                "explanation": "2 should be inserted at index 1."
            }
        ],
        "testCases": [
            {
                "input": "1 3 5 6\\n5",
                "output": "2",
                "isHidden": false
            },
            {
                "input": "1 3 5 6\\n2",
                "output": "1",
                "isHidden": false
            },
            {
                "input": "1 3 5 6\\n7",
                "output": "4",
                "isHidden": false
            },
            {
                "input": "1 3 5 6\\n0",
                "output": "0",
                "isHidden": true
            },
            {
                "input": "1\\n0",
                "output": "0",
                "isHidden": true
            }
        ],
        "starterCode": {
            "javascript": "function searchInsert(nums, target) {\n    // Your code here\n}",
            "python": "class Solution:\n    def searchInsert(self, nums, target):\n        # Your code here\n        pass",
            "java": "class Solution {\n    public int searchInsert(int[] nums, int target) {\n        // Your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int searchInsert(vector<int>& nums, int target) {\n        // Your code here\n    }\n};",
            "c": "int searchInsert(int* nums, int numsSize, int target) {\n    // Your code here\n}"
        }
    }
];

module.exports = questions;
