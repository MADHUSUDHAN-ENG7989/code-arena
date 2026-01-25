const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const Question = require('./src/models/Question');
const { runTestCases } = require('./src/services/codeExecutor');

// Correct solutions for the 5 seeded questions (JavaScript)
const solutions = {
    'two-sum': `
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
}`,
    'reverse-linked-list': `
function reverseList(head) {
    let prev = null;
    let curr = head;
    while (curr !== null) {
        let nextTemp = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nextTemp;
    }
    return prev;
}`,
    'valid-parentheses': `
function isValid(s) {
    const stack = [];
    const map = {
        '(': ')',
        '[': ']',
        '{': '}'
    };
    for (let i = 0; i < s.length; i++) {
        const char = s[i];
        if (map[char]) {
            stack.push(map[char]);
        } else {
            if (stack.pop() !== char) return false;
        }
    }
    return stack.length === 0;
}`,
    'binary-tree-inorder-traversal': `
function inorderTraversal(root) {
    const result = [];
    function traverse(node) {
        if (!node) return;
        traverse(node.left);
        result.push(node.val);
        traverse(node.right);
    }
    traverse(root);
    return result;
}`,
    'longest-increasing-subsequence': `
function lengthOfLIS(nums) {
    if (nums.length === 0) return 0;
    const dp = new Array(nums.length).fill(1);
    let maxLen = 1;
    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        maxLen = Math.max(maxLen, dp[i]);
    }
    return maxLen;
}`
};

async function verifyQuestions() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform';
        console.log('Connecting to:', uri.replace(/:([^:@]+)@/, ':****@'));
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const questions = await Question.find({});
        console.log(`Found ${questions.length} questions.`);

        for (const question of questions) {
            console.log(`\nTesting: ${question.title} (${question.slug})`);
            const code = solutions[question.slug];
            if (!code) {
                console.log(`No solution defined for ${question.slug}, skipping...`);
                continue;
            }

            // Using 'javascript' for all, since we defined JS solutions
            const userId = null; // No socket emission needed
            const result = await runTestCases(code, 'javascript', question.testCases, question.slug, userId);

            console.log(`Passed: ${result.passed}/${result.total}`);
            if (result.passed !== result.total) {
                console.log('FAILED CASES:');
                result.results.filter(r => !r.isCorrect).forEach(r => {
                    console.log(`Input: ${r.input}`);
                    console.log(`Expected: ${r.expectedOutput}`);
                    console.log(`Actual: ${r.actualOutput}`);
                    console.log(`Error: ${r.error || 'N/A'}`);
                });
            } else {
                console.log('ALL PASSED');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error verifying questions:', error);
        process.exit(1);
    }
}

verifyQuestions();
