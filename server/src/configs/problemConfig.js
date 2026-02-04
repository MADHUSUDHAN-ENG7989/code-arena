
const PROBLEM_CONFIG = {

    'plus-one': {
        fn: 'plusOne',
        args: [{ type: 'int[]', name: 'digits' }],
        returnType: 'int[]'
    },

    'valid-parentheses': {
        fn: 'isValid',
        args: [{ type: 'string', name: 's' }],
        returnType: 'boolean'
    },

    'longest-common-prefix': {
        fn: 'longestCommonPrefix',
        args: [{ type: 'string[]', name: 'strs' }],
        returnType: 'string'
    },

    'contains-duplicate': {
        fn: 'containsDuplicate',
        args: [{ type: 'int[]', name: 'nums' }],
        returnType: 'boolean'
    },

    'rotate-array': {
        fn: 'rotate',
        args: [{ type: 'int[]', name: 'nums' }, { type: 'int', name: 'k' }],
        returnType: 'int[]'
    },

    'missing-number': {
        fn: 'missingNumber',
        args: [{ type: 'int[]', name: 'nums' }],
        returnType: 'int'
    },

    'single-number': {
        fn: 'singleNumber',
        args: [{ type: 'int[]', name: 'nums' }],
        returnType: 'int'
    },

    'intersection-of-two-arrays': {
        fn: 'intersection',
        args: [{ type: 'int[]', name: 'nums1' }, { type: 'int[]', name: 'nums2' }],
        returnType: 'int[]'
    },

    'majority-element': {
        fn: 'majorityElement',
        args: [{ type: 'int[]', name: 'nums' }],
        returnType: 'int'
    },

    'pangram-sentence': {
        fn: 'checkIfPangram',
        args: [{ type: 'string', name: 'sentence' }],
        returnType: 'boolean'
    },

    'reverse-words': {
        fn: 'reverseWords',
        args: [{ type: 'string', name: 's' }],
        returnType: 'string'
    },

    'find-pivot-index': {
        fn: 'pivotIndex',
        args: [{ type: 'int[]', name: 'nums' }],
        returnType: 'int'
    },

    'valid-palindrome-ii': {
        fn: 'validPalindrome',
        args: [{ type: 'string', name: 's' }],
        returnType: 'boolean'
    },

    'fizz-buzz': {
        fn: 'fizzBuzz',
        args: [{ type: 'int', name: 'n' }],
        returnType: 'string[]'
    },

    'truncate-sentence': {
        fn: 'truncateSentence',
        args: [{ type: 'string', name: 's' }, { type: 'int', name: 'k' }],
        returnType: 'string'
    },

    'longest-substring-without-repeating-characters': {
        fn: 'lengthOfLongestSubstring',
        args: [{ type: 'string', name: 's' }],
        returnType: 'int'
    },

    '3sum': {
        fn: 'threeSum',
        args: [{ type: 'int[]', name: 'nums' }],
        returnType: 'int[][]'
    },

    'product-of-array-except-self': {
        fn: 'productExceptSelf',
        args: [{ type: 'int[]', name: 'nums' }],
        returnType: 'int[]'
    },

    'group-anagrams': {
        fn: 'groupAnagrams',
        args: [{ type: 'string[]', name: 'strs' }],
        returnType: 'string[][]'
    },

    'longest-palindromic-substring': {
        fn: 'longestPalindrome',
        args: [{ type: 'string', name: 's' }],
        returnType: 'string'
    },

    'set-matrix-zeroes': {
        fn: 'setZeroes',
        args: [{ type: 'int[][]', name: 'matrix' }],
        returnType: 'void'
    },

    'spiral-matrix': {
        fn: 'spiralOrder',
        args: [{ type: 'int[][]', name: 'matrix' }],
        returnType: 'int[]'
    },

    'rotate-image': {
        fn: 'rotate',
        args: [{ type: 'int[][]', name: 'matrix' }],
        returnType: 'void'
    },

    'subarray-sum-equals-k': {
        fn: 'subarraySum',
        args: [{ type: 'int[]', name: 'nums' }, { type: 'int', name: 'k' }],
        returnType: 'int'
    },

    'minimum-window-substring': {
        fn: 'minWindow',
        args: [{ type: 'string', name: 's' }, { type: 'string', name: 't' }],
        returnType: 'string'
    },

    'encode-and-decode-strings': {
        fn: 'encode',
        args: [{ type: 'string[]', name: 'strs' }],
        returnType: 'string'
    },

    'word-search': {
        fn: 'exist',
        args: [{ type: 'char[][]', name: 'board' }, { type: 'string', name: 'word' }],
        returnType: 'boolean'
    },

    'increasing-triplet-subsequence': {
        fn: 'increasingTriplet',
        args: [{ type: 'int[]', name: 'nums' }],
        returnType: 'boolean'
    },

    'partition-labels': {
        fn: 'partitionLabels',
        args: [{ type: 'string', name: 's' }],
        returnType: 'int[]'
    },

    'decode-string': {
        fn: 'decodeString',
        args: [{ type: 'string', name: 's' }],
        returnType: 'string'
    },

    'find-all-duplicates-in-an-array': {
        fn: 'findDuplicates',
        args: [{ type: 'int[]', name: 'nums' }],
        returnType: 'int[]'
    },

    'next-permutation': {
        fn: 'nextPermutation',
        args: [{ type: 'int[]', name: 'nums' }],
        returnType: 'int[]'
    },

    'trapping-rain-water': {
        fn: 'trap',
        args: [{ type: 'int[]', name: 'height' }],
        returnType: 'int'
    },

    'sliding-window-maximum': {
        fn: 'maxSlidingWindow',
        args: [{ type: 'int[]', name: 'nums' }, { type: 'int', name: 'k' }],
        returnType: 'int[]'
    },

    'longest-valid-parentheses': {
        fn: 'longestValidParentheses',
        args: [{ type: 'string', name: 's' }],
        returnType: 'int'
    },

    'largest-rectangle-in-histogram': {
        fn: 'largestRectangleArea',
        args: [{ type: 'int[]', name: 'heights' }],
        returnType: 'int'
    },

    'first-missing-positive': {
        fn: 'firstMissingPositive',
        args: [{ type: 'int[]', name: 'nums' }],
        returnType: 'int'
    },

    'text-justification': {
        fn: 'fullJustify',
        args: [{ type: 'string[]', name: 'words' }, { type: 'int', name: 'maxWidth' }],
        returnType: 'string[]'
    },

    'count-of-smaller-numbers-after-self': {
        fn: 'countSmaller',
        args: [{ type: 'int[]', name: 'nums' }],
        returnType: 'int[]'
    },

    'shortest-palindrome': {
        fn: 'shortestPalindrome',
        args: [{ type: 'string', name: 's' }],
        returnType: 'string'
    },

    'edit-distance': {
        fn: 'minDistance',
        args: [{ type: 'string', name: 'word1' }, { type: 'string', name: 'word2' }],
        returnType: 'int'
    },

    'merge-intervals': {
        fn: 'merge',
        args: [{ type: 'int[][]', name: 'intervals' }],
        returnType: 'int[][]'
    },

    'find-peak-element': {
        fn: 'findPeakElement',
        args: [{ type: 'int[]', name: 'nums' }],
        returnType: 'int'
    },

    'maximum-product-subarray': {
        fn: 'maxProduct',
        args: [{ type: 'int[]', name: 'nums' }],
        returnType: 'int'
    },

    // Legacy/First 10 Questions (Manual Addition for completeness if not in list)
    'two-sum': { fn: 'twoSum', args: [{ type: 'int[]', name: 'nums' }, { type: 'int', name: 'target' }], returnType: 'int[]', sortResult: true },
    'reverse-string': { fn: 'reverseString', args: [{ type: 'char[]', name: 's' }], returnType: 'void' },
    'valid-palindrome': { fn: 'isPalindrome', args: [{ type: 'string', name: 's' }], returnType: 'boolean' },
    'remove-duplicates-from-sorted-array': { fn: 'removeDuplicates', args: [{ type: 'int[]', name: 'nums' }], returnType: 'int' },
    'valid-anagram': { fn: 'isAnagram', args: [{ type: 'string', name: 's' }, { type: 'string', name: 't' }], returnType: 'boolean' },
    'maximum-subarray': { fn: 'maxSubArray', args: [{ type: 'int[]', name: 'nums' }], returnType: 'int' },
    'merge-sorted-array': { fn: 'merge', args: [{ type: 'int[]', name: 'nums1' }, { type: 'int', name: 'm' }, { type: 'int[]', name: 'nums2' }, { type: 'int', name: 'n' }], returnType: 'void' },
    'move-zeroes': { fn: 'moveZeroes', args: [{ type: 'int[]', name: 'nums' }], returnType: 'void' },
    'best-time-to-buy-and-sell-stock': { fn: 'maxProfit', args: [{ type: 'int[]', name: 'prices' }], returnType: 'int' },
    'length-of-last-word': { fn: 'lengthOfLastWord', args: [{ type: 'string', name: 's' }], returnType: 'int' },
};

module.exports = PROBLEM_CONFIG;
