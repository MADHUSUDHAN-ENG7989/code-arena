const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { executeCode } = require('./src/services/codeExecutor');
const Question = require('./src/models/Question');
const mongoose = require('mongoose');

const SOLUTIONS = {
    'reverse-linked-list': {
        javascript: `function reverseList(head) { let prev = null; let curr = head; while (curr) { let next = curr.next; curr.next = prev; prev = curr; curr = next; } return prev; }`,
        python: `class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        prev = None\n        curr = head\n        while curr:\n            next_node = curr.next\n            curr.next = prev\n            prev = curr\n            curr = next_node\n        return prev`,
        cpp: `class Solution { public: ListNode* reverseList(ListNode* head) { ListNode* prev = nullptr; ListNode* curr = head; while (curr) { ListNode* next = curr->next; curr->next = prev; prev = curr; curr = next; } return prev; } };`,
        c: `struct ListNode* reverseList(struct ListNode* head) { struct ListNode* prev = NULL; struct ListNode* curr = head; while (curr) { struct ListNode* next = curr->next; curr->next = prev; prev = curr; curr = next; } return prev; }`
    },
    'valid-parentheses': {
        javascript: `function isValid(s) { const stack = []; const map = { '(': ')', '{': '}', '[': ']' }; for (let char of s) { if (map[char]) { stack.push(map[char]); } else { if (stack.pop() !== char) return false; } } return stack.length === 0; }`,
        python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        stack = []\n        mapping = {")": "(", "}": "{", "]": "["}\n        for char in s:\n            if char in mapping:\n                top_element = stack.pop() if stack else '#'\n                if mapping[char] != top_element:\n                    return False\n            else:\n                stack.append(char)\n        return not stack`,
        cpp: `class Solution { public: bool isValid(string s) { stack<char> st; for (char c : s) { if (c == '(' || c == '{' || c == '[') st.push(c); else { if (st.empty()) return false; if (c == ')' && st.top() != '(') return false; if (c == '}' && st.top() != '{') return false; if (c == ']' && st.top() != '[') return false; st.pop(); } } return st.empty(); } };`,
        c: `bool isValid(char * s){ char stack[10000]; int top = -1; for (int i = 0; s[i] != '\\0'; i++) { char c = s[i]; if (c == '(' || c == '{' || c == '[') { stack[++top] = c; } else { if (top == -1) return false; char open = stack[top--]; if (c == ')' && open != '(') return false; if (c == '}' && open != '{') return false; if (c == ']' && open != '[') return false; } } return top == -1; }`
    },
    'binary-tree-inorder-traversal': {
        javascript: `function inorderTraversal(root) { const res = []; function traverse(node) { if (!node) return; traverse(node.left); res.push(node.val); traverse(node.right); } traverse(root); return res; }`,
        python: `class Solution:\n    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:\n        res = []\n        def traverse(node):\n            if not node: return\n            traverse(node.left)\n            res.append(node.val)\n            traverse(node.right)\n        traverse(root)\n        return res`,
        cpp: `class Solution { public: vector<int> inorderTraversal(TreeNode* root) { vector<int> res; helper(root, res); return res; } void helper(TreeNode* node, vector<int>& res) { if (!node) return; helper(node->left, res); res.push_back(node->val); helper(node->right, res); } };`,
        c: `/** Definition for a binary tree node. struct TreeNode { int val; struct TreeNode *left; struct TreeNode *right; }; */ /** Note: The returned array must be malloced, assume caller calls free(). */ void helper(struct TreeNode* root, int* arr, int* size) { if (!root) return; helper(root->left, arr, size); arr[(*size)++] = root->val; helper(root->right, arr, size); } int* inorderTraversal(struct TreeNode* root, int* returnSize) { int* arr = (int*)malloc(100 * sizeof(int)); *returnSize = 0; helper(root, arr, returnSize); return arr; }`
    },
    'longest-increasing-subsequence': {
        javascript: `function lengthOfLIS(nums) { if (nums.length === 0) return 0; const dp = new Array(nums.length).fill(1); let max = 1; for (let i = 1; i < nums.length; i++) { for (let j = 0; j < i; j++) { if (nums[i] > nums[j]) { dp[i] = Math.max(dp[i], dp[j] + 1); } } max = Math.max(max, dp[i]); } return max; }`,
        python: `class Solution:\n    def lengthOfLIS(self, nums: List[int]) -> int:\n        if not nums: return 0\n        dp = [1] * len(nums)\n        for i in range(len(nums)):\n            for j in range(i):\n                if nums[i] > nums[j]:\n                    dp[i] = max(dp[i], dp[j] + 1)\n        return max(dp) if dp else 0`,
        cpp: `class Solution { public: int lengthOfLIS(vector<int>& nums) { if (nums.empty()) return 0; vector<int> dp(nums.size(), 1); int maxVal = 1; for (int i = 1; i < nums.size(); ++i) { for (int j = 0; j < i; ++j) { if (nums[i] > nums[j]) { dp[i] = max(dp[i], dp[j] + 1); } } maxVal = max(maxVal, dp[i]); } return maxVal; } };`,
        c: `int lengthOfLIS(int* nums, int numsSize) { if (numsSize == 0) return 0; int* dp = (int*)malloc(numsSize * sizeof(int)); for(int i=0; i<numsSize; i++) dp[i] = 1; int max = 1; for (int i = 1; i < numsSize; i++) { for (int j = 0; j < i; j++) { if (nums[i] > nums[j]) { if(dp[j] + 1 > dp[i]) dp[i] = dp[j] + 1; } } if(dp[i] > max) max = dp[i]; } free(dp); return max; }`
    }
};

async function verifyRemaining() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const questions = await Question.find({ slug: { $ne: 'two-sum' } });
        console.log(`Found ${questions.length} remaining questions.`);

        let totalTests = 0;
        let passedTests = 0;

        for (const question of questions) {
            const slug = question.slug;
            const relevantSolution = SOLUTIONS[slug];
            if (!relevantSolution) {
                console.log(`Skipping checking ${slug} (No solution defined)`);
                continue;
            }
            const sampleTestCase = question.testCases[0];
            const input = sampleTestCase.input;
            const expectedOutput = sampleTestCase.output;

            console.log(`\nTesting ${slug}...`);

            for (const [lang, code] of Object.entries(relevantSolution)) {
                totalTests++;
                process.stdout.write(`  [ ${lang} ] `);

                try {
                    const result = await executeCode(code, lang, input, slug);
                    const output = result.output ? result.output.trim() : '';
                    const expected = expectedOutput.trim();

                    if (output === expected || (slug === 'valid-parentheses' && output === expected.toLowerCase())) {
                        console.log('✅ Passed');
                        passedTests++;
                    } else {
                        console.log(`❌ Failed. Exp: '${expected}' Got: '${output}'`);
                        if (result.error) console.log(`Err: ${result.error}`);
                    }
                } catch (err) {
                    console.log(`❌ Failed (Exception): ${err.message}`);
                }
            }
        }
        console.log(`\nSummary: ${passedTests}/${totalTests} Passed`);
        process.exit(0);
    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
}

verifyRemaining();
