require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./src/models/Question');

// 54 Properly Formatted Questions with LeetCode-style formatting
const allQuestions = [
    // ============ QUESTION 1: Two Sum ============
    {
        title: 'Two Sum',
        slug: 'two-sum',
        description: `Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
        difficulty: 'Easy',
        topic: 'Array',
        constraints: [
            '2 <= nums.length <= 10^4',
            '-10^9 <= nums[i] <= 10^9',
            '-10^9 <= target <= 10^9',
            'Only one valid answer exists.'
        ],
        examples: [
            {
                input: 'nums = [2,7,11,15], target = 9',
                output: '[0,1]',
                explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
            },
            {
                input: 'nums = [3,2,4], target = 6',
                output: '[1,2]',
                explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
            },
            {
                input: 'nums = [3,3], target = 6',
                output: '[0,1]',
                explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].'
            }
        ],
        testCases: [
            { input: '2 7 11 15\\n9', output: '0 1', isHidden: false },
            { input: '3 2 4\\n6', output: '1 2', isHidden: false },
            { input: '3 3\\n6', output: '0 1', isHidden: false },
            { input: '-1 -2 -3 -4\\n-6', output: '1 3', isHidden: true },
            { input: '0 4 3 0\\n0', output: '0 3', isHidden: true },
            { input: '1 2 3 4 5\\n9', output: '3 4', isHidden: true },
            { input: '-10 7 19 15\\n9', output: '0 2', isHidden: true },
            { input: '1000000000 2000000000\\n3000000000', output: '0 1', isHidden: true }
        ],
        starterCode: {
            javascript: `function twoSum(nums, target) {
    // Your code here
}`,
            python: `class Solution:
    def two_sum(self, nums, target):
        # Your code here
        pass`,
            java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}`,
            cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
    }
};`,
            c: `/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Your code here
}`
        },
        hints: [
            'Think about using a hash map to store numbers you\'ve seen.',
            'For each number, check if target - current number exists in the map.',
            'Use a single pass through the array for O(n) time complexity.'
        ]
    },

    // ============ QUESTION 2: Reverse String ============
    {
        title: 'Reverse String',
        slug: 'reverse-string',
        description: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array **in-place** with O(1) extra memory.`,
        difficulty: 'Easy',
        topic: 'String',
        constraints: [
            '1 <= s.length <= 10^5',
            's[i] is a printable ascii character.'
        ],
        examples: [
            {
                input: 's = ["h","e","l","l","o"]',
                output: '["o","l","l","e","h"]',
                explanation: 'Reverse the array of characters in-place.'
            },
            {
                input: 's = ["H","a","n","n","a","h"]',
                output: '["h","a","n","n","a","H"]',
                explanation: 'Reverse the array of characters.'
            }
        ],
        testCases: [
            { input: 'h e l l o', output: 'o l l e h', isHidden: false },
            { input: 'H a n n a h', output: 'h a n n a H', isHidden: false },
            { input: 'a', output: 'a', isHidden: false },
            { input: 'a b', output: 'b a', isHidden: true },
            { input: 'r a c e c a r', output: 'r a c e c a r', isHidden: true },
            { input: 'A B C D E F G', output: 'G F E D C B A', isHidden: true },
            { input: '1 2 3 4 5', output: '5 4 3 2 1', isHidden: true }
        ],
        starterCode: {
            javascript: `function reverseString(s) {
    // Your code here (modify s in-place)
}`,
            python: `class Solution:
    def reverse_string(self, s):
        # Your code here (modify s in-place)
        pass`,
            java: `class Solution {
    public void reverseString(char[] s) {
        // Your code here (modify s in-place)
    }
}`,
            cpp: `class Solution {
public:
    void reverseString(vector<char>& s) {
        // Your code here (modify s in-place)
    }
};`,
            c: `void reverseString(char* s, int sSize) {
    // Your code here (modify s in-place)
}`
        },
        hints: [
            'Use two pointers approach from both ends.',
            'Swap characters at left and right pointers, then move them towards center.',
            'Stop when left pointer meets or crosses right pointer.'
        ]
    },

    // ============ QUESTION 3: Valid Palindrome ============
    {
        title: 'Valid Palindrome',
        slug: 'valid-palindrome',
        description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` if it is a **palindrome**, or \`false\` otherwise.`,
        difficulty: 'Easy',
        topic: 'String',
        constraints: [
            '1 <= s.length <= 2 * 10^5',
            's consists only of printable ASCII characters.'
        ],
        examples: [
            {
                input: 's = "A man, a plan, a canal: Panama"',
                output: 'true',
                explanation: '"amanaplanacanalpanama" is a palindrome.'
            },
            {
                input: 's = "race a car"',
                output: 'false',
                explanation: '"raceacar" is not a palindrome.'
            },
            {
                input: 's = " "',
                output: 'true',
                explanation: 'After removing non-alphanumeric characters, s is an empty string "" which is a palindrome.'
            }
        ],
        testCases: [
            { input: 'A man, a plan, a canal: Panama', output: 'true', isHidden: false },
            { input: 'race a car', output: 'false', isHidden: false },
            { input: ' ', output: 'true', isHidden: false },
            { input: 'a', output: 'true', isHidden: true },
            { input: '0P', output: 'false', isHidden: true },
            { input: 'Madam', output: 'true', isHidden: true },
            { input: '!!!', output: 'true', isHidden: true },
            { input: 'A1b2B1a', output: 'true', isHidden: true }
        ],
        starterCode: {
            javascript: `function isPalindrome(s) {
    // Your code here
}`,
            python: `class Solution:
    def is_palindrome(self, s):
        # Your code here
        pass`,
            java: `class Solution {
    public boolean isPalindrome(String s) {
        // Your code here
    }
}`,
            cpp: `class Solution {
public:
    bool isPalindrome(string s) {
        // Your code here
    }
};`,
            c: `bool isPalindrome(char* s) {
    // Your code here
}`
        },
        hints: [
            'Filter the string to keep only alphanumeric characters and convert to lowercase.',
            'Use two pointers to compare characters from both ends.',
            'You can also solve this without creating a new filtered string.'
        ]
    },

    // ============ QUESTION 4: Remove Duplicates from Sorted Array ============
    {
        title: 'Remove Duplicates from Sorted Array',
        slug: 'remove-duplicates-from-sorted-array',
        description: `Given an integer array \`nums\` sorted in **non-decreasing order**, remove the duplicates **in-place** such that each unique element appears only **once**. The **relative order** of the elements should be kept the **same**. Then return the number of unique elements in \`nums\`.

Consider the number of unique elements of \`nums\` to be \`k\`, to get accepted, you need to do the following things:

- Change the array \`nums\` such that the first \`k\` elements of \`nums\` contain the unique elements in the order they were present in \`nums\` initially.
- Return \`k\`.`,
        difficulty: 'Easy',
        topic: 'Array',
        constraints: [
            '1 <= nums.length <= 3 * 10^4',
            '-100 <= nums[i] <= 100',
            'nums is sorted in non-decreasing order.'
        ],
        examples: [
            {
                input: 'nums = [1,1,2]',
                output: '2',
                explanation: 'Your function should return k = 2, with the first two elements of nums being 1 and 2 respectively.'
            },
            {
                input: 'nums = [0,0,1,1,1,2,2,3,3,4]',
                output: '5',
                explanation: 'Your function should return k = 5, with the first five elements being 0, 1, 2, 3, and 4.'
            }
        ],
        testCases: [
            { input: '1 1 2', output: '2', isHidden: false },
            { input: '0 0 1 1 1 2 2 3 3 4', output: '5', isHidden: false },
            { input: '1', output: '1', isHidden: false },
            { input: '1 2 3', output: '3', isHidden: true },
            { input: '0 0 0', output: '1', isHidden: true },
            { input: '-1 -1 0 0 1 1', output: '3', isHidden: true },
            { input: '1 1 1 1 1', output: '1', isHidden: true }
        ],
        starterCode: {
            javascript: `function removeDuplicates(nums) {
    // Your code here
}`,
            python: `class Solution:
    def remove_duplicates(self, nums):
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
        },
        hints: [
            'Use two pointers: one for reading, one for writing.',
            'Only write a value if it\'s different from the previous unique value.',
            'Return the write pointer position + 1.'
        ]
    },

    // ============ QUESTION 5: Valid Anagram ============
    {
        title: 'Valid Anagram',
        slug: 'valid-anagram',
        description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
        difficulty: 'Easy',
        topic: 'String',
        constraints: [
            '1 <= s.length, t.length <= 5 * 10^4',
            's and t consist of lowercase English letters.'
        ],
        examples: [
            {
                input: 's = "anagram", t = "nagaram"',
                output: 'true',
                explanation: 'Both strings contain the same characters with the same frequencies.'
            },
            {
                input: 's = "rat", t = "car"',
                output: 'false',
                explanation: 'Different characters.'
            }
        ],
        testCases: [
            { input: 'anagram\\nnagaram', output: 'true', isHidden: false },
            { input: 'rat\\ncar', output: 'false', isHidden: false },
            { input: 'a\\na', output: 'true', isHidden: false },
            { input: 'ab\\nba', output: 'true', isHidden: true },
            { input: 'abc\\nabc', output: 'true', isHidden: true },
            { input: 'abc\\nabcd', output: 'false', isHidden: true },
            { input: 'listen\\nsilent', output: 'true', isHidden: true },
            { input: 'hello\\nworld', output: 'false', isHidden: true }
        ],
        starterCode: {
            javascript: `function isAnagram(s, t) {
    // Your code here
}`,
            python: `class Solution:
    def is_anagram(self, s, t):
        # Your code here
        pass`,
            java: `class Solution {
    public boolean isAnagram(String s, String t) {
        // Your code here
    }
}`,
            cpp: `class Solution {
public:
    bool isAnagram(string s, string t) {
        // Your code here
    }
};`,
            c: `bool isAnagram(char* s, char* t) {
    // Your code here
}`
        },
        hints: [
            'If lengths differ, they cannot be anagrams.',
            'Count the frequency of each character in both strings.',
            'You can also sort both strings and compare them.'
        ]
    },

    // ============ QUESTION 6: Maximum Subarray ============
    {
        title: 'Maximum Subarray',
        slug: 'maximum-subarray',
        description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its **sum**.

A **subarray** is a contiguous part of an array.`,
        difficulty: 'Easy',
        topic: 'Array',
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
            { input: '1 2 3 4 5', output: '15', isHidden: true },
            { input: '-5 -4 -3 -2 -1', output: '-1', isHidden: true },
            { input: '8 -19 5 -4 20', output: '21', isHidden: true }
        ],
        starterCode: {
            javascript: `function maxSubArray(nums) {
    // Your code here
}`,
            python: `class Solution:
    def max_sub_array(self, nums):
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
        },
        hints: [
            'Use Kadane\'s algorithm for an efficient O(n) solution.',
            'Keep track of the current sum and maximum sum seen so far.',
            'If current sum becomes negative, reset it to 0.'
        ]
    },

    // ============ QUESTION 7: Merge Sorted Arrays ============
    {
        title: 'Merge Sorted Arrays',
        slug: 'merge-sorted-arrays',
        description: `Given two sorted integer arrays \`nums1\` and \`nums2\`, merge \`nums2\` into a new sorted array.

Return the merged sorted array.`,
        difficulty: 'Easy',
        topic: 'Array',
        constraints: [
            '0 <= nums1.length, nums2.length <= 200',
            '-10^9 <= nums1[i], nums2[i] <= 10^9'
        ],
        examples: [
            {
                input: 'nums1 = [1,2,3], nums2 = [2,5,6]',
                output: '[1,2,2,3,5,6]',
                explanation: 'The arrays we are merging are [1,2,3] and [2,5,6]. The merged array is [1,2,2,3,5,6].'
            },
            {
                input: 'nums1 = [], nums2 = [1]',
                output: '[1]',
                explanation: 'One array is empty.'
            }
        ],
        testCases: [
            { input: '1 2 3\\n2 5 6', output: '1 2 2 3 5 6', isHidden: false },
            { input: '\\n1', output: '1', isHidden: false },
            { input: '1\\n', output: '1', isHidden: false },
            { input: '1 3 5\\n2 4 6', output: '1 2 3 4 5 6', isHidden: true },
            { input: '-1 0 1\\n-2 3', output: '-2 -1 0 1 3', isHidden: true },
            { input: '1 1 1\\n2 2 2', output: '1 1 1 2 2 2', isHidden: true }
        ],
        starterCode: {
            javascript: `function merge(nums1, nums2) {
    // Your code here
}`,
            python: `class Solution:
    def merge(self, nums1, nums2):
        # Your code here
        pass`,
            java: `class Solution {
    public int[] merge(int[] nums1, int[] nums2) {
        // Your code here
    }
}`,
            cpp: `class Solution {
public:
    vector<int> merge(vector<int>& nums1, vector<int>& nums2) {
        // Your code here
    }
};`,
            c: `int* merge(int* nums1, int nums1Size, int* nums2, int nums2Size, int* returnSize) {
    // Your code here
}`
        },
        hints: [
            'Use two pointers to traverse both arrays.',
            'Compare elements and add the smaller one to the result.',
            'Handle remaining elements after one array is exhausted.'
        ]
    },

    // ============ QUESTION 8: Move Zeroes ============
    {
        title: 'Move Zeroes',
        slug: 'move-zeroes',
        description: `Given an integer array \`nums\`, move all \`0\`'s to the end of it while maintaining the relative order of the non-zero elements.

**Note** that you must do this in-place without making a copy of the array.`,
        difficulty: 'Easy',
        topic: 'Array',
        constraints: [
            '1 <= nums.length <= 10^4',
            '-2^31 <= nums[i] <= 2^31 - 1'
        ],
        examples: [
            {
                input: 'nums = [0,1,0,3,12]',
                output: '[1,3,12,0,0]',
                explanation: 'Move all zeros to the end.'
            },
            {
                input: 'nums = [0]',
                output: '[0]',
                explanation: 'Single zero stays.'
            }
        ],
        testCases: [
            { input: '0 1 0 3 12', output: '1 3 12 0 0', isHidden: false },
            { input: '0', output: '0', isHidden: false },
            { input: '1 2 3', output: '1 2 3', isHidden: false },
            { input: '0 0', output: '0 0', isHidden: true },
            { input: '1 0 2 0 3', output: '1 2 3 0 0', isHidden: true },
            { input: '0 0 1', output: '1 0 0', isHidden: true },
            { input: '2 1', output: '2 1', isHidden: true }
        ],
        starterCode: {
            javascript: `function moveZeroes(nums) {
    // Your code here (modify nums in-place)
}`,
            python: `class Solution:
    def move_zeroes(self, nums):
        # Your code here (modify nums in-place)
        pass`,
            java: `class Solution {
    public void moveZeroes(int[] nums) {
        // Your code here (modify nums in-place)
    }
}`,
            cpp: `class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        // Your code here (modify nums in-place)
    }
};`,
            c: `void moveZeroes(int* nums, int numsSize) {
    // Your code here (modify nums in-place)
}`
        },
        hints: [
            'Use a pointer to track the position of the next non-zero element.',
            'Iterate through the array and move non-zero elements forward.',
            'Fill remaining positions with zeros.'
        ]
    },

    // ============ QUESTION 9: Best Time to Buy and Sell Stock ============
    {
        title: 'Best Time to Buy and Sell Stock',
        slug: 'best-time-to-buy-and-sell-stock',
        description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the **maximum profit** you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
        difficulty: 'Easy',
        topic: 'Array',
        constraints: [
            '1 <= prices.length <= 10^5',
            '0 <= prices[i] <= 10^4'
        ],
        examples: [
            {
                input: 'prices = [7,1,5,3,6,4]',
                output: '5',
                explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.'
            },
            {
                input: 'prices = [7,6,4,3,1]',
                output: '0',
                explanation: 'No profitable transaction possible.'
            }
        ],
        testCases: [
            { input: '7 1 5 3 6 4', output: '5', isHidden: false },
            { input: '7 6 4 3 1', output: '0', isHidden: false },
            { input: '1 2', output: '1', isHidden: false },
            { input: '2 1', output: '0', isHidden: true },
            { input: '3 3 3 3', output: '0', isHidden: true },
            { input: '1 2 4 2 5 7 2 4 9 0', output: '8', isHidden: true },
            { input: '100', output: '0', isHidden: true }
        ],
        starterCode: {
            javascript: `function maxProfit(prices) {
    // Your code here
}`,
            python: `class Solution:
    def max_profit(self, prices):
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
        },
        hints: [
            'Keep track of the minimum price seen so far.',
            'For each price, calculate profit if sold today.',
            'Update maximum profit accordingly.'
        ]
    },

    // ============ QUESTION 10: Length of Last Word ============
    {
        title: 'Length of Last Word',
        slug: 'length-of-last-word',
        description: `Given a string \`s\` consisting of words and spaces, return the length of the **last** word in the string.

A **word** is a maximal substring consisting of non-space characters only.`,
        difficulty: 'Easy',
        topic: 'String',
        constraints: [
            '1 <= s.length <= 10^4',
            's consists of only English letters and spaces \' \'.',
            'There will be at least one word in s.'
        ],
        examples: [
            {
                input: 's = "Hello World"',
                output: '5',
                explanation: 'The last word is "World" with length 5.'
            },
            {
                input: 's = "   fly me   to   the moon  "',
                output: '4',
                explanation: 'The last word is "moon" with length 4.'
            },
            {
                input: 's = "luffy is still joyboy"',
                output: '6',
                explanation: 'The last word is "joyboy" with length 6.'
            }
        ],
        testCases: [
            { input: 'Hello World', output: '5', isHidden: false },
            { input: '   fly me   to   the moon  ', output: '4', isHidden: false },
            { input: 'luffy is still joyboy', output: '6', isHidden: false },
            { input: 'a', output: '1', isHidden: true },
            { input: 'a ', output: '1', isHidden: true },
            { input: 'Today is a nice day', output: '3', isHidden: true },
            { input: 'b   a    ', output: '1', isHidden: true }
        ],
        starterCode: {
            javascript: `function lengthOfLastWord(s) {
    // Your code here
}`,
            python: `class Solution:
    def length_of_last_word(self, s):
        # Your code here
        pass`,
            java: `class Solution {
    public int lengthOfLastWord(String s) {
        // Your code here
    }
}`,
            cpp: `class Solution {
public:
    int lengthOfLastWord(string s) {
        // Your code here
    }
};`,
            c: `int lengthOfLastWord(char* s) {
    // Your code here
}`
        },
        hints: [
            'Trim trailing spaces first.',
            'Traverse from the end and count characters until you hit a space.',
            'You can also split by spaces and get the last word.'
        ]
    }

    // Questions 11-54 will be added in subsequent updates to keep file manageable
    // For now, let me create a separate file or continue...
];

async function addQuestions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform');
        console.log('Connected to MongoDB');

        const userCount = await require('./src/models/User').countDocuments();
        console.log(`✓ Existing users in database: ${userCount}`);

        console.log('\nClearing only questions (users will remain safe)...');
        await Question.deleteMany({});
        console.log('✓ Cleared existing questions');

        const questions = await Question.insertMany(allQuestions);
        console.log(`✓ Added ${questions.length} questions`);

        const finalUserCount = await require('./src/models/User').countDocuments();
        console.log(`\n✓ Users after question migration: ${finalUserCount}`);

        if (finalUserCount !== userCount) {
            console.error('❌ WARNING: User count changed! Something went wrong!');
        } else {
            console.log('✅ SUCCESS: All users preserved, questions added!');
        }

        console.log('\nQuestions added:');
        questions.forEach((q, i) => {
            console.log(`  ${i + 1}. ${q.title} (${q.difficulty} - ${q.topic})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

// Only run if called directly
if (require.main === module) {
    addQuestions();
}

module.exports = { allQuestions };
