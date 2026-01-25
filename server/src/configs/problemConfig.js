const PROBLEM_CONFIG = {
    // --- Existing 10 Questions ---
    'two-sum': {
        fn: 'twoSum',
        args: [
            { type: 'int[]', name: 'nums' },
            { type: 'int', name: 'target' }
        ],
        returnType: 'int[]',
        sortResult: true
    },
    'reverse-linked-list': {
        fn: 'reverseList',
        args: [
            { type: 'ListNode', name: 'head' }
        ],
        returnType: 'ListNode'
    },
    'valid-parentheses': {
        fn: 'isValid',
        args: [
            { type: 'string', name: 's' }
        ],
        returnType: 'boolean'
    },
    'binary-tree-inorder-traversal': {
        fn: 'inorderTraversal',
        args: [
            { type: 'TreeNode', name: 'root' }
        ],
        returnType: 'int[]' // Actually List<Integer> in Java, but driver handles conversion
    },
    'longest-increasing-subsequence': {
        fn: 'lengthOfLIS',
        args: [
            { type: 'int[]', name: 'nums' }
        ],
        returnType: 'int'
    },
    'palindrome-number': {
        fn: 'isPalindrome',
        args: [
            { type: 'int', name: 'x' }
        ],
        returnType: 'boolean'
    },
    'missing-number': {
        fn: 'missingNumber',
        args: [
            { type: 'int[]', name: 'nums' }
        ],
        returnType: 'int'
    },
    'climbing-stairs': {
        fn: 'climbStairs',
        args: [
            { type: 'int', name: 'n' }
        ],
        returnType: 'int'
    },
    'best-time-to-buy-and-sell-stock': {
        fn: 'maxProfit',
        args: [
            { type: 'int[]', name: 'prices' }
        ],
        returnType: 'int'
    },
    'search-insert-position': {
        fn: 'searchInsert',
        args: [
            { type: 'int[]', name: 'nums' },
            { type: 'int', name: 'target' }
        ],
        returnType: 'int'
    },
    // --- New 20 Questions ---
    'contains-duplicate': { fn: 'containsDuplicate', args: [{ type: 'int[]', name: 'nums' }], returnType: 'boolean' },
    'move-zeroes': { fn: 'moveZeroes', args: [{ type: 'int[]', name: 'nums' }], returnType: 'int[]' },
    'plus-one': { fn: 'plusOne', args: [{ type: 'int[]', name: 'digits' }], returnType: 'int[]' },
    'valid-anagram': { fn: 'isAnagram', args: [{ type: 'string', name: 's' }, { type: 'string', name: 't' }], returnType: 'boolean' },
    'length-of-last-word': { fn: 'lengthOfLastWord', args: [{ type: 'string', name: 's' }], returnType: 'int' },
    'power-of-two': { fn: 'isPowerOfTwo', args: [{ type: 'int', name: 'n' }], returnType: 'boolean' },
    'single-number': { fn: 'singleNumber', args: [{ type: 'int[]', name: 'nums' }], returnType: 'int' },
    'same-tree': { fn: 'isSameTree', args: [{ type: 'TreeNode', name: 'p' }, { type: 'TreeNode', name: 'q' }], returnType: 'boolean' },
    'invert-binary-tree': { fn: 'invertTree', args: [{ type: 'TreeNode', name: 'root' }], returnType: 'TreeNode' },
    'maximum-depth-of-binary-tree': { fn: 'maxDepth', args: [{ type: 'TreeNode', name: 'root' }], returnType: 'int' },
    'fibonacci-number': { fn: 'fib', args: [{ type: 'int', name: 'n' }], returnType: 'int' },
    'reverse-string': { fn: 'reverseString', args: [{ type: 'char[]', name: 's' }], returnType: 'void' }, // Warning: char[] support pending
    'majority-element': { fn: 'majorityElement', args: [{ type: 'int[]', name: 'nums' }], returnType: 'int' },
    'convert-sorted-array-to-binary-search-tree': { fn: 'sortedArrayToBST', args: [{ type: 'int[]', name: 'nums' }], returnType: 'TreeNode' },
    'intersection-of-two-arrays-ii': { fn: 'intersect', args: [{ type: 'int[]', name: 'nums1' }, { type: 'int[]', name: 'nums2' }], returnType: 'int[]', sortResult: true },
    'power-of-three': { fn: 'isPowerOfThree', args: [{ type: 'int', name: 'n' }], returnType: 'boolean' },
    'remove-duplicates-from-sorted-list': { fn: 'deleteDuplicates', args: [{ type: 'ListNode', name: 'head' }], returnType: 'ListNode' },
    'merge-two-sorted-lists': { fn: 'mergeTwoLists', args: [{ type: 'ListNode', name: 'list1' }, { type: 'ListNode', name: 'list2' }], returnType: 'ListNode' },
    'symmetric-tree': { fn: 'isSymmetric', args: [{ type: 'TreeNode', name: 'root' }], returnType: 'boolean' },
    'first-unique-character-in-a-string': { fn: 'firstUniqChar', args: [{ type: 'string', name: 's' }], returnType: 'int' }
};

module.exports = PROBLEM_CONFIG;
