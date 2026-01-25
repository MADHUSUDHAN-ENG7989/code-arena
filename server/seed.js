require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Question = require('./src/models/Question');
const DailyChallenge = require('./src/models/DailyChallenge');
const Notification = require('./src/models/Notification');
const questionsData = require('./new_questions');
const questions20 = require('./questions_20');

const sampleQuestions = [
    {
        title: 'Two Sum',
        slug: 'two-sum',
        description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
        difficulty: 'Easy',
        topic: 'Arrays',
        constraints: [
            '2 <= nums.length <= 10^4',
            '-10^9 <= nums[i] <= 10^9',
            '-10^9 <= target <= 10^9',
            'Only one valid answer exists.'
        ],
        examples: [
            {
                input: '[2,7,11,15], target = 9',
                output: '[0,1]',
                explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
            },
            {
                input: '[3,2,4], target = 6',
                output: '[1,2]',
                explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
            }
        ],
        testCases: [
            { input: '2 7 11 15\\n9', output: '0 1', isHidden: false },
            { input: '3 2 4\\n6', output: '1 2', isHidden: false },
            { input: '3 3\\n6', output: '0 1', isHidden: false },
            { input: '0 4 3 0\\n0', output: '0 3', isHidden: true },
            { input: '-1 -2 -3 -4 -5\\n-8', output: '2 4', isHidden: true },
            { input: '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20\\n39', output: '18 19', isHidden: true },
            { input: '-10 7 19 15\\n9', output: '0 2', isHidden: true },
            { input: '2 2\\n4', output: '0 1', isHidden: true },
            { input: '1 5 9 13 17\\n22', output: '2 3', isHidden: true },
            { input: '1000 2000 3000\\n5000', output: '1 2', isHidden: true },
        ],
        starterCode: {
            javascript: `function twoSum(nums, target) {
    // Your code here
}`,
            python: `def two_sum(nums, target):
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
            'For each number, check if target - current number exists in the map.'
        ]
    },
    {
        title: 'Reverse LinkedList',
        slug: 'reverse-linked-list',
        description: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
        difficulty: 'Easy',
        topic: 'Linked List',
        constraints: [
            'The number of nodes in the list is the range [0, 5000].',
            '-5000 <= Node.val <= 5000'
        ],
        examples: [
            {
                input: '[1,2,3,4,5]',
                output: '[5,4,3,2,1]',
                explanation: 'Reverse the entire linked list.'
            },
            {
                input: '[1,2]',
                output: '[2,1]',
                explanation: 'Reverse the list with two nodes.'
            }
        ],
        testCases: [
            { input: '1 2 3 4 5', output: '5 4 3 2 1', isHidden: false },
            { input: '1 2', output: '2 1', isHidden: false },
            { input: '1', output: '1', isHidden: false },
            { input: '1 2 3', output: '3 2 1', isHidden: true },
            { input: '10 20 30 40', output: '40 30 20 10', isHidden: true },
            { input: '5 5 5 5', output: '5 5 5 5', isHidden: true },
            { input: '1 2 3 4 5 6 7 8 9 10', output: '10 9 8 7 6 5 4 3 2 1', isHidden: true },
            { input: '-1 -2 -3', output: '-3 -2 -1', isHidden: true },
            { input: '0 1 0', output: '0 1 0', isHidden: true },
            { input: '100 200', output: '200 100', isHidden: true },
        ],
        starterCode: {
            javascript: `function reverseList(head) {
    // Your code here
}`,
            python: `def reverse_list(head):
    # Your code here
    pass`,
            java: `class Solution {
    public ListNode reverseList(ListNode head) {
        // Your code here
    }
}`,
            cpp: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Your code here
    }
};`,
            c: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     struct ListNode *next;
 * };
 */
struct ListNode* reverseList(struct ListNode* head) {
    // Your code here
}`
        },
        hints: [
            'Use three pointers: prev, current, and next.',
            'Iterate through the list and reverse the pointers one by one.'
        ]
    },
    {
        title: 'Valid Parentheses',
        slug: 'valid-parentheses',
        description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
        difficulty: 'Easy',
        topic: 'Stack',
        constraints: [
            '1 <= s.length <= 10^4',
            's consists of parentheses only \'()[]{}\''
        ],
        examples: [
            {
                input: '()',
                output: 'true',
                explanation: 'The string is valid.'
            },
            {
                input: '()[]{}',
                output: 'true',
                explanation: 'All brackets are closed in correct order.'
            },
            {
                input: '(]',
                output: 'false',
                explanation: 'Brackets are not matching.'
            }
        ],
        testCases: [
            { input: '()', output: 'true', isHidden: false },
            { input: '()[]{}', output: 'true', isHidden: false },
            { input: '(]', output: 'false', isHidden: false },
            { input: '([)]', output: 'false', isHidden: true },
            { input: '{[]}', output: 'true', isHidden: true },
            { input: '(((', output: 'false', isHidden: true },
            { input: ')))', output: 'false', isHidden: true },
            { input: '((()))', output: 'true', isHidden: true },
            { input: '({[]})', output: 'true', isHidden: true },
            { input: '[', output: 'false', isHidden: true },
        ],
        starterCode: {
            javascript: `function isValid(s) {
    // Your code here
}`,
            python: `def is_valid(s):
    # Your code here
    pass`,
            java: `class Solution {
    public boolean isValid(String s) {
        // Your code here
    }
}`,
            cpp: `class Solution {
public:
    bool isValid(string s) {
        // Your code here
    }
};`,
            c: `bool isValid(char * s){
    // Your code here
}`
        },
        hints: [
            'Use a stack data structure.',
            'Push opening brackets onto the stack, pop when you encounter a closing bracket.'
        ]
    },
    {
        title: 'Binary Tree Inorder Traversal',
        slug: 'binary-tree-inorder-traversal',
        description: `Given the root of a binary tree, return the inorder traversal of its nodes' values.

Inorder traversal visits nodes in this order: Left -> Root -> Right`,
        difficulty: 'Medium',
        topic: 'Trees',
        constraints: [
            'The number of nodes in the tree is in the range [0, 100].',
            '-100 <= Node.val <= 100'
        ],
        examples: [
            {
                input: '[1,null,2,3]',
                output: '[1,3,2]',
                explanation: 'Inorder traversal of the tree.'
            }
        ],
        testCases: [
            { input: '1 null 2 3', output: '1 3 2', isHidden: false },
            { input: '1 2 3', output: '2 1 3', isHidden: false },
            { input: '1', output: '1', isHidden: false },
            { input: '1 null 2', output: '1 2', isHidden: true },
            { input: '1 2', output: '2 1', isHidden: true },
            { input: '3 1 2', output: '1 3 2', isHidden: true },
            { input: '1 2 3 4 5', output: '4 2 5 1 3', isHidden: true },
            { input: '1 null 2 null 3', output: '1 2 3', isHidden: true },
            { input: '1 2 null 3', output: '3 2 1', isHidden: true },
            { input: '1 2 3 4 5 6 7', output: '4 2 5 1 6 3 7', isHidden: true },
        ],
        starterCode: {
            javascript: `function inorderTraversal(root) {
    // Your code here
}`,
            python: `def inorder_traversal(root):
    # Your code here
    pass`,
            java: `class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        // Your code here
    }
}`,
            cpp: `class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        // Your code here
    }
};`,
            c: `/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     struct TreeNode *left;
 *     struct TreeNode *right;
 * };
 */
/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* inorderTraversal(struct TreeNode* root, int* returnSize) {
    // Your code here
}`
        },
        hints: [
            'Can be solved recursively or iteratively.',
            'Recursive: Process left subtree, current node, then right subtree.',
            'Iterative: Use a stack to simulate recursion.'
        ]
    },
    {
        title: 'Longest Increasing Subsequence',
        slug: 'longest-increasing-subsequence',
        description: `Given an integer array \`nums\`, return the length of the longest strictly increasing subsequence.

A subsequence is a sequence that can be derived from an array by deleting some or no elements without changing the order of the remaining elements.`,
        difficulty: 'Hard',
        topic: 'Dynamic Programming',
        constraints: [
            '1 <= nums.length <= 2500',
            '-10^4 <= nums[i] <= 10^4'
        ],
        examples: [
            {
                input: '[10,9,2,5,3,7,101,18]',
                output: '4',
                explanation: 'The longest increasing subsequence is [2,3,7,101], therefore the length is 4.'
            },
            {
                input: '[0,1,0,3,2,3]',
                output: '4',
                explanation: 'The longest increasing subsequence is [0,1,2,3].'
            }
        ],
        testCases: [
            { input: '10 9 2 5 3 7 101 18', output: '4', isHidden: false },
            { input: '0 1 0 3 2 3', output: '4', isHidden: false },
            { input: '7 7 7 7 7', output: '1', isHidden: false },
            { input: '1 2 3 4 5', output: '5', isHidden: true },
            { input: '5 4 3 2 1', output: '1', isHidden: true },
            { input: '1 3 6 7 9 4 10 5 6', output: '6', isHidden: true },
            { input: '0', output: '1', isHidden: true },
            { input: '-2 -1', output: '2', isHidden: true },
            { input: '10 20 10 30 15 40', output: '4', isHidden: true },
            { input: '1 2 1 2 1 2', output: '2', isHidden: true },
        ],
        starterCode: {
            javascript: `function lengthOfLIS(nums) {
    // Your code here
}`,
            python: `def length_of_lis(nums):
    # Your code here
    pass`,
            java: `class Solution {
    public int lengthOfLIS(int[] nums) {
        // Your code here
    }
}`,
            cpp: `class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        // Your code here
    }
};`,
            c: `int lengthOfLIS(int* nums, int numsSize) {
    // Your code here
}`
        },
        hints: [
            'Use dynamic programming.',
            'dp[i] represents the length of longest increasing subsequence ending at index i.',
            'For each element, check all previous elements smaller than it.'
        ]
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform');
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Question.deleteMany({});
        await DailyChallenge.deleteMany({});
        await Notification.deleteMany({});
        console.log('Cleared existing data');

        // Create admin user
        const admin = await User.create({
            rollNumber: 'ADMIN001',
            password: 'admin123',
            name: 'Admin User',
            email: 'admin@college.edu',
            isAdmin: true,
            isFirstLogin: false,
        });
        console.log('Created admin user:', admin.rollNumber);

        // Create sample students
        const student1 = await User.create({
            rollNumber: '2024001',
            password: 'student123',
            name: 'John Doe',
            email: 'john@college.edu',
            isAdmin: false,
            isFirstLogin: true,
        });

        const student2 = await User.create({
            rollNumber: '2024002',
            password: 'student123',
            name: 'Jane Smith',
            email: 'jane@college.edu',
            isAdmin: false,
            isFirstLogin: true,
        });

        const student3 = await User.create({
            rollNumber: 'uday',
            password: 'uday',
            name: 'Uday',
            email: 'uday@college.edu',
            isAdmin: false,
            isFirstLogin: true,
        });

        const student4 = await User.create({
            rollNumber: 'madhu',
            password: 'madhu',
            name: 'Madhu',
            email: 'madhu@college.edu',
            isAdmin: false,
            isFirstLogin: true,
        });

        console.log('Created sample students');

        // Create questions
        // Combine all questions
        const allQuestions = [...sampleQuestions, ...questionsData, ...questions20];

        const questions = await Question.insertMany(allQuestions);
        console.log(`Created ${allQuestions.length} sample questions`);

        // Set first question as today's challenge
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await DailyChallenge.create({
            date: today,
            questionId: questions[0]._id,
        });
        console.log('Set daily challenge');

        console.log('\\n=== Database seeded successfully! ===');
        console.log('\\nAdmin Credentials:');
        console.log('Roll Number: ADMIN001');
        console.log('Password: admin123');
        console.log('\\nSample Student Credentials:');
        console.log('Roll Number: 2024001, Password: student123');
        console.log('Roll Number: 2024002, Password: student123');
        console.log('\\n(Students must change password on first login)');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
