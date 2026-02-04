require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./src/models/Question');

// Import existing 10 questions for consistency
const existing10 = require('./add_10_questions_backup.js').allQuestions;

// Helper to generate full question object
function createQuestion(title, slug, difficulty, topic, description, constraints, examples, testCases, fn, args, returnType, hints) {

    // Generate starter code dynamically
    const jsArgs = args.map(a => a.name).join(', ');
    const pyFn = fn.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    const pyArgs = args.map(a => a.name).join(', '); // Python args usually same names

    // Simple type mapping for starter code generation
    const typeMap = {
        'int': { java: 'int', cpp: 'int', c: 'int' },
        'int[]': { java: 'int[]', cpp: 'vector<int>&', c: 'int*' },
        'string': { java: 'String', cpp: 'string', c: 'char*' },
        'string[]': { java: 'String[]', cpp: 'vector<string>&', c: 'char**' },
        'char[]': { java: 'char[]', cpp: 'vector<char>&', c: 'char*' },
        'char[][]': { java: 'char[][]', cpp: 'vector<vector<char>>&', c: 'char**' },
        'boolean': { java: 'boolean', cpp: 'bool', c: 'bool' },
        'void': { java: 'void', cpp: 'void', c: 'void' },
        'ListNode': { java: 'ListNode', cpp: 'ListNode*', c: 'struct ListNode*' },
        'TreeNode': { java: 'TreeNode', cpp: 'TreeNode*', c: 'struct TreeNode*' },
        'int[][]': { java: 'int[][]', cpp: 'vector<vector<int>>&', c: 'int**' }
    };

    const getJavaType = (t) => typeMap[t]?.java || 'int';
    const getCppType = (t) => typeMap[t]?.cpp || 'int';
    const getCType = (t) => typeMap[t]?.c || 'int';

    const javaArgs = args.map(a => `${getJavaType(a.type)} ${a.name}`).join(', ');
    const cppArgs = args.map(a => `${getCppType(a.type)} ${a.name}`).join(', ');

    // C args handling (arrays need sizes)
    let cArgs = args.map(a => {
        let t = getCType(a.type);
        if (a.type.includes('[]')) {
            // Basic heuristic for array sizes
            if (a.type === 'string[]') return `char** ${a.name}, int ${a.name}Size`;
            if (a.type === 'int[]') return `int* ${a.name}, int ${a.name}Size`;
            if (a.type === 'char[][]') return `char** ${a.name}, int ${a.name}Size, int* ${a.name}ColSize`;
            if (a.type === 'int[][]') return `int** ${a.name}, int ${a.name}Size, int* ${a.name}ColSize`;
        }
        return `${t} ${a.name}`;
    }).join(', ');

    let cRet = getCType(returnType);
    if (returnType.includes('[]')) {
        cArgs += ', int* returnSize';
        if (returnType === 'int[][]') cArgs += ', int** returnColumnSizes';
    }

    const javaRet = getJavaType(returnType);
    const cppRet = getCppType(returnType);

    const starterCode = {
        javascript: `function ${fn}(${jsArgs}) {\n    // Your code here\n}`,
        python: `class Solution:\n    def ${pyFn}(self, ${pyArgs}):\n        # Your code here\n        pass`,
        java: `class Solution {\n    public ${javaRet} ${fn}(${javaArgs}) {\n        // Your code here\n    }\n}`,
        cpp: `class Solution {\npublic:\n    ${cppRet} ${fn}(${cppArgs}) {\n        // Your code here\n    }\n};`,
        c: `${cRet} ${fn}(${cArgs}) {\n    // Your code here\n}`
    };

    return {
        title, slug, description, difficulty, topic, constraints, examples,
        testCases: testCases.map((tc, i) => ({ ...tc, isHidden: i >= 3 })),
        starterCode, hints,
        meta: { args, returnType }
    };
}

// Define the remaining questions data concise 
const newQuestions = [
    // 11. Plus One
    createQuestion('Plus One', 'plus-one', 'Easy', 'Array',
        "You are given a large integer represented as an integer array `digits`, where each `digits[i]` is the `i`th digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading `0`'s.\n\nIncrement the large integer by one and return the resulting array of digits.",
        ['1 <= digits.length <= 100', '0 <= digits[i] <= 9', 'The large integer does not contain any leading 0\'s'],
        [{ input: 'digits = [1,2,3]', output: '[1,2,4]', explanation: '123 + 1 = 124' }, { input: 'digits = [9]', output: '[1,0]', explanation: '9 + 1 = 10' }],
        [{ input: '1 2 3', output: '1 2 4' }, { input: '4 3 2 1', output: '4 3 2 2' }, { input: '9', output: '1 0' }, { input: '9 9', output: '1 0 0' }, { input: '0', output: '1' }],
        'plusOne', [{ type: 'int[]', name: 'digits' }], 'int[]', ['Start from the end', 'Handle carry']),

    // 12. Valid Parentheses
    createQuestion('Valid Parentheses', 'valid-parentheses', 'Easy', 'String',
        'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
        ['1 <= s.length <= 10^4', 's consists of parentheses only'],
        [{ input: 's = "()"', output: 'true', explanation: '' }, { input: 's = "()[]{}"', output: 'true', explanation: '' }],
        [{ input: '()', output: 'true' }, { input: '()[]{}', output: 'true' }, { input: '(]', output: 'false' }, { input: '([)]', output: 'false' }, { input: '{[]}', output: 'true' }],
        'isValid', [{ type: 'string', name: 's' }], 'boolean', ['Use a stack']),

    // 13. Longest Common Prefix
    createQuestion('Longest Common Prefix', 'longest-common-prefix', 'Easy', 'String',
        'Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string "".',
        ['1 <= strs.length <= 200', '0 <= strs[i].length <= 200', 'strs[i] consists of only lowercase English letters'],
        [{ input: 'strs = ["flower","flow","flight"]', output: '"fl"', explanation: '' }, { input: 'strs = ["dog","racecar","car"]', output: '""', explanation: '' }],
        [{ input: 'flower flow flight', output: 'fl' }, { input: 'dog racecar car', output: '' }, { input: 'a', output: 'a' }, { input: 'ab a', output: 'a' }],
        'longestCommonPrefix', [{ type: 'string[]', name: 'strs' }], 'string', ['Sort the array', 'Compare first and last']),

    // 14. Contains Duplicate
    createQuestion('Contains Duplicate', 'contains-duplicate', 'Easy', 'Array',
        'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.',
        ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
        [{ input: 'nums = [1,2,3,1]', output: 'true', explanation: '' }, { input: 'nums = [1,2,3,4]', output: 'false', explanation: '' }],
        [{ input: '1 2 3 1', output: 'true' }, { input: '1 2 3 4', output: 'false' }, { input: '1 1 1 3 3 4 3 2 4 2', output: 'true' }, { input: '1', output: 'false' }],
        'containsDuplicate', [{ type: 'int[]', name: 'nums' }], 'boolean', ['Use a HashSet']),

    // 15. Rotate Array
    createQuestion('Rotate Array', 'rotate-array', 'Easy', 'Array',
        'Given an integer array `nums`, rotate the array to the right by `k` steps, where `k` is non-negative.',
        ['1 <= nums.length <= 10^5', '0 <= k <= 10^5'],
        [{ input: 'nums = [1,2,3,4,5,6,7], k = 3', output: '[5,6,7,1,2,3,4]', explanation: '' }],
        [{ input: '1 2 3 4 5 6 7\\n3', output: '5 6 7 1 2 3 4' }, { input: '-1 -100 3 99\\n2', output: '3 99 -1 -100' }, { input: '1\\n0', output: '1' }],
        'rotate', [{ type: 'int[]', name: 'nums' }, { type: 'int', name: 'k' }], 'int[]', ['Reverse the whole array, then parts']),

    // 16. Missing Number
    createQuestion('Missing Number', 'missing-number', 'Easy', 'Array',
        'Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.',
        ['n == nums.length', '1 <= n <= 10^4'],
        [{ input: 'nums = [3,0,1]', output: '2', explanation: '' }, { input: 'nums = [0,1]', output: '2', explanation: '' }],
        [{ input: '3 0 1', output: '2' }, { input: '0 1', output: '2' }, { input: '9 6 4 2 3 5 7 0 1', output: '8' }],
        'missingNumber', [{ type: 'int[]', name: 'nums' }], 'int', ['Sum formula']),

    // 17. Single Number
    createQuestion('Single Number', 'single-number', 'Easy', 'Array',
        'Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space.',
        ['1 <= nums.length <= 3 * 10^4', '-3 * 10^4 <= nums[i] <= 3 * 10^4'],
        [{ input: 'nums = [2,2,1]', output: '1', explanation: '' }, { input: 'nums = [4,1,2,1,2]', output: '4', explanation: '' }],
        [{ input: '2 2 1', output: '1' }, { input: '4 1 2 1 2', output: '4' }, { input: '1', output: '1' }],
        'singleNumber', [{ type: 'int[]', name: 'nums' }], 'int', ['XOR operation']),

    // 18. Intersection of Two Arrays
    createQuestion('Intersection of Two Arrays', 'intersection-of-two-arrays', 'Easy', 'Array',
        'Given two integer arrays `nums1` and `nums2`, return an array of their intersection. Each element in the result must be unique and you may return the result in any order.',
        ['1 <= nums1.length, nums2.length <= 1000'],
        [{ input: 'nums1 = [1,2,2,1], nums2 = [2,2]', output: '[2]', explanation: '' }],
        [{ input: '1 2 2 1\\n2 2', output: '2' }, { input: '4 9 5\\n9 4 9 8 4', output: '4 9' }, { input: '1\\n1', output: '1' }],
        'intersection', [{ type: 'int[]', name: 'nums1' }, { type: 'int[]', name: 'nums2' }], 'int[]', ['Use Sets']),

    // 19. Majority Element
    createQuestion('Majority Element', 'majority-element', 'Easy', 'Array',
        'Given an array `nums` of size `n`, return the majority element. The majority element is the element that appears more than `⌊n / 2⌋` times.',
        ['n == nums.length', '1 <= n <= 5 * 10^4'],
        [{ input: 'nums = [3,2,3]', output: '3', explanation: '' }, { input: 'nums = [2,2,1,1,1,2,2]', output: '2', explanation: '' }],
        [{ input: '3 2 3', output: '3' }, { input: '2 2 1 1 1 2 2', output: '2' }],
        'majorityElement', [{ type: 'int[]', name: 'nums' }], 'int', ['Boyer-Moore Voting Algorithm']),

    // 20. Pangram Sentence
    createQuestion('Pangram Sentence', 'pangram-sentence', 'Easy', 'String',
        'A pangram is a sentence where every letter of the English alphabet appears at least once. Given a string `sentence` containing only lowercase English letters, return `true` if `sentence` is a pangram, or `false` otherwise.',
        ['1 <= sentence.length <= 1000'],
        [{ input: 'sentence = "thequickbrownfoxjumpsoverthelazydog"', output: 'true', explanation: '' }],
        [{ input: 'thequickbrownfoxjumpsoverthelazydog', output: 'true' }, { input: 'leetcode', output: 'false' }],
        'checkIfPangram', [{ type: 'string', name: 'sentence' }], 'boolean', ['Use a Set or array of size 26']),

    // 21. Reverse Words
    createQuestion('Reverse Words', 'reverse-words', 'Easy', 'String',
        'Given an input string `s`, reverse the order of the words. A word is defined as a sequence of non-space characters. The words in `s` will be separated by at least one space. Return a string of the words in reverse order concatenated by a single space.',
        ['1 <= s.length <= 10^4'],
        [{ input: 's = "the sky is blue"', output: '"blue is sky the"', explanation: '' }],
        [{ input: 'the sky is blue', output: 'blue is sky the' }, { input: '  hello world  ', output: 'world hello' }, { input: 'a good   example', output: 'example good a' }],
        'reverseWords', [{ type: 'string', name: 's' }], 'string', ['Split and reverse']),

    // 22. Find Pivot Index
    createQuestion('Find Pivot Index', 'find-pivot-index', 'Easy', 'Array',
        'Given an array of integers `nums`, calculate the pivot index of this array. The pivot index is the index where the sum of all the numbers strictly to the left of the index is equal to the sum of all the numbers strictly to the index\\\'s right.',
        ['1 <= nums.length <= 10^4'],
        [{ input: 'nums = [1,7,3,6,5,6]', output: '3', explanation: 'Left sum = 1+7+3 = 11, Right sum = 5+6 = 11' }],
        [{ input: '1 7 3 6 5 6', output: '3' }, { input: '1 2 3', output: '-1' }, { input: '2 1 -1', output: '0' }],
        'pivotIndex', [{ type: 'int[]', name: 'nums' }], 'int', ['Prefix sums']),

    // 23. Valid Palindrome II
    createQuestion('Valid Palindrome II', 'valid-palindrome-ii', 'Easy', 'String',
        'Given a string `s`, return `true` if the `s` can be palindrome after deleting at most one character from it.',
        ['1 <= s.length <= 10^5'],
        [{ input: 's = "aba"', output: 'true', explanation: '' }, { input: 's = "abca"', output: 'true', explanation: 'Delete c' }],
        [{ input: 'aba', output: 'true' }, { input: 'abca', output: 'true' }, { input: 'abc', output: 'false' }],
        'validPalindrome', [{ type: 'string', name: 's' }], 'boolean', ['Two pointers', 'Try skipping left or right on mismatch']),

    // 24. Fizz Buzz
    createQuestion('Fizz Buzz', 'fizz-buzz', 'Easy', 'String',
        'Given an integer `n`, return a string array `answer` (1-indexed) where: `answer[i] == "FizzBuzz"` if `i` is divisible by 3 and 5. `answer[i] == "Fizz"` if `i` is divisible by 3. `answer[i] == "Buzz"` if `i` is divisible by 5. `answer[i] == i` (as a string) if none of the above conditions are true.',
        ['1 <= n <= 10^4'],
        [{ input: 'n = 3', output: '["1","2","Fizz"]', explanation: '' }],
        [{ input: '3', output: '1 2 Fizz' }, { input: '5', output: '1 2 Fizz 4 Buzz' }, { input: '15', output: '1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz' }],
        'fizzBuzz', [{ type: 'int', name: 'n' }], 'string[]', ['Modulo operator']),

    // 25. Truncate Sentence
    createQuestion('Truncate Sentence', 'truncate-sentence', 'Easy', 'String',
        'A sentence is a list of words that are separated by a single space with no leading or trailing spaces. You are given a sentence `s` and an integer `k`. You want to truncate `s` such that it contains only the first `k` words. Return `s` after truncating it.',
        ['1 <= s.length <= 500', '1 <= k <= 500'],
        [{ input: 's = "Hello how are you Contestant", k = 4', output: '"Hello how are you"', explanation: '' }],
        [{ input: 'Hello how are you Contestant\\n4', output: 'Hello how are you' }, { input: 'What is the solution to this problem\\n4', output: 'What is the solution' }, { input: 'chopper is not a tanuki\\n5', output: 'chopper is not a tanuki' }],
        'truncateSentence', [{ type: 'string', name: 's' }, { type: 'int', name: 'k' }], 'string', ['Count spaces']),

    // 26. Longest Substring Without Repeating Characters
    createQuestion('Longest Substring Without Repeating Characters', 'longest-substring-without-repeating-characters', 'Medium', 'String',
        'Given a string `s`, find the length of the longest substring without repeating characters.',
        ['0 <= s.length <= 5 * 10^4'],
        [{ input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' }, { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b".' }],
        [{ input: 'abcabcbb', output: '3' }, { input: 'bbbbb', output: '1' }, { input: 'pwwkew', output: '3' }, { input: '', output: '0' }],
        'lengthOfLongestSubstring', [{ type: 'string', name: 's' }], 'int', ['Sliding window', 'Map storing last index']),

    // 27. 3Sum
    createQuestion('3Sum', '3sum', 'Medium', 'Array',
        'Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`. Notice that the solution set must not contain duplicate triplets.',
        ['0 <= nums.length <= 3000'],
        [{ input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]', explanation: '' }, { input: 'nums = [0,1,1]', output: '[]', explanation: '' }],
        [{ input: '-1 0 1 2 -1 -4', output: '-1 -1 2 -1 0 1' }, { input: '0 1 1', output: '' }, { input: '0 0 0', output: '0 0 0' }],
        'threeSum', [{ type: 'int[]', name: 'nums' }], 'int[][]', ['Sort array', 'Two pointers for 2sum']),

    // 28. Product of Array Except Self
    createQuestion('Product of Array Except Self', 'product-of-array-except-self', 'Medium', 'Array',
        'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`. The product of any prefix or suffix of `nums` is guaranteed to fit in a 32-bit integer. You must write an algorithm that runs in O(n) time and without using the division operation.',
        ['2 <= nums.length <= 10^5'],
        [{ input: 'nums = [1,2,3,4]', output: '[24,12,8,6]', explanation: '' }, { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]', explanation: '' }],
        [{ input: '1 2 3 4', output: '24 12 8 6' }, { input: '-1 1 0 -3 3', output: '0 0 9 0 0' }],
        'productExceptSelf', [{ type: 'int[]', name: 'nums' }], 'int[]', ['Prefix and suffix products']),

    // 29. Group Anagrams
    createQuestion('Group Anagrams', 'group-anagrams', 'Medium', 'String',
        'Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.',
        ['1 <= strs.length <= 10^4'],
        [{ input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', explanation: '' }, { input: 'strs = [""]', output: '[[""]]', explanation: '' }],
        [{ input: 'eat tea tan ate nat bat', output: 'bat|nat tan|ate eat tea' }, { input: '', output: '' }, { input: 'a', output: 'a' }],
        'groupAnagrams', [{ type: 'string[]', name: 'strs' }], 'string[][]', ['Sort each string as key in hash map']),

    // 30. Longest Palindromic Substring
    createQuestion('Longest Palindromic Substring', 'longest-palindromic-substring', 'Medium', 'String',
        'Given a string `s`, return the longest palindromic substring in `s`.',
        ['1 <= s.length <= 1000'],
        [{ input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.' }, { input: 's = "cbbd"', output: '"bb"', explanation: '' }],
        [{ input: 'babad', output: 'bab' }, { input: 'cbbd', output: 'bb' }, { input: 'a', output: 'a' }, { input: 'ac', output: 'a' }],
        'longestPalindrome', [{ type: 'string', name: 's' }], 'string', ['Expand around center']),

    // 31. Set Matrix Zeroes
    createQuestion('Set Matrix Zeroes', 'set-matrix-zeroes', 'Medium', 'Array',
        'Given an `m x n` integer matrix `matrix`, if an element is `0`, set its entire row and column to `0`\'s.You must do it in -place.',
        ['m == matrix.length', 'n == matrix[0].length'],
        [{ input: 'matrix = [[1,1,1],[1,0,1],[1,1,1]]', output: '[[1,0,1],[0,0,0],[1,0,1]]', explanation: '' }],
        [{ input: '[[1,1,1],[1,0,1],[1,1,1]]', output: '[[1,0,1],[0,0,0],[1,0,1]]' }, { input: '[[0,1,2,0],[3,4,5,2],[1,3,1,5]]', output: '[[0,0,0,0],[0,4,5,0],[0,3,1,0]]' }],
        'setZeroes', [{ type: 'int[][]', name: 'matrix' }], 'void', ['Use first row/col as markers']),

    // 32. Spiral Matrix
    createQuestion('Spiral Matrix', 'spiral-matrix', 'Medium', 'Array',
        'Given an `m x n` matrix, return all elements of the matrix in spiral order.',
        ['m == matrix.length', 'n == matrix[i].length'],
        [{ input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[1,2,3,6,9,8,7,4,5]', explanation: '' }],
        [{ input: '[[1,2,3],[4,5,6],[7,8,9]]', output: '1 2 3 6 9 8 7 4 5' }],
        'spiralOrder', [{ type: 'int[][]', name: 'matrix' }], 'int[]', ['Simulation with boundaries']),

    // 33. Rotate Image
    createQuestion('Rotate Image', 'rotate-image', 'Medium', 'Array',
        'You are given an `n x n` 2D matrix representing an image, rotate the image by 90 degrees (clockwise). You have to rotate the image in-place, which means you have to modify the input 2D matrix directly.',
        ['n == matrix.length', 'n == matrix[i].length'],
        [{ input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[[7,4,1],[8,5,2],[9,6,3]]', explanation: '' }],
        [{ input: '[[1,2,3],[4,5,6],[7,8,9]]', output: '[[7,4,1],[8,5,2],[9,6,3]]' }],
        'rotate', [{ type: 'int[][]', name: 'matrix' }], 'void', ['Transpose then reverse rows']),

    // 34. Subarray Sum Equals K
    createQuestion('Subarray Sum Equals K', 'subarray-sum-equals-k', 'Medium', 'Array',
        'Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals to `k`.',
        ['1 <= nums.length <= 2 * 10^4'],
        [{ input: 'nums = [1,1,1], k = 2', output: '2', explanation: '' }, { input: 'nums = [1,2,3], k = 3', output: '2', explanation: '' }],
        [{ input: '1 1 1\\n2', output: '2' }, { input: '1 2 3\\n3', output: '2' }],
        'subarraySum', [{ type: 'int[]', name: 'nums' }, { type: 'int', name: 'k' }], 'int', ['Prefix sum map']),

    // 35. Minimum Window Substring
    createQuestion('Minimum Window Substring', 'minimum-window-substring', 'Medium', 'String',
        'Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string "".',
        ['m == s.length', 'n == t.length'],
        [{ input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', explanation: '' }],
        [{ input: 'ADOBECODEBANC\\nABC', output: 'BANC' }, { input: 'a\\na', output: 'a' }, { input: 'a\\naa', output: '' }],
        'minWindow', [{ type: 'string', name: 's' }, { type: 'string', name: 't' }], 'string', ['Sliding window', 'Character count map']),

    // 36. Encode and Decode Strings
    createQuestion('Encode and Decode Strings', 'encode-and-decode-strings', 'Medium', 'String',
        'Design an algorithm to encode a list of strings to a string. The encoded string is then sent over the network and is decoded back to the original list of strings.',
        ['1 <= strs.length <= 200'],
        [{ input: 'strs = ["lint","code","love","you"]', output: '["lint","code","love","you"]', explanation: '' }],
        [{ input: 'lint code love you', output: 'lint code love you' }],
        'encode', [{ type: 'string[]', name: 'strs' }], 'string', ['Length prefixing']),

    // 37. Word Search
    createQuestion('Word Search', 'word-search', 'Medium', 'Array',
        'Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.',
        ['m == board.length'],
        [{ input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true', explanation: '' }],
        [{ input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\\nABCCED', output: 'true' }, { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\\nSEE', output: 'true' }, { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\\nABCB', output: 'false' }],
        'exist', [{ type: 'char[][]', name: 'board' }, { type: 'string', name: 'word' }], 'boolean', ['DFS', 'Backtracking']),

    // 38. Increasing Triplet Subsequence
    createQuestion('Increasing Triplet Subsequence', 'increasing-triplet-subsequence', 'Medium', 'Array',
        'Given an integer array `nums`, return `true` if there exists a triple of indices `(i, j, k)` such that `i < j < k` and `nums[i] < nums[j] < nums[k]`. If no such indices exists, return `false`.',
        ['1 <= nums.length <= 5 * 10^5'],
        [{ input: 'nums = [1,2,3,4,5]', output: 'true', explanation: '' }, { input: 'nums = [5,4,3,2,1]', output: 'false', explanation: '' }],
        [{ input: '1 2 3 4 5', output: 'true' }, { input: '5 4 3 2 1', output: 'false' }, { input: '2 1 5 0 4 6', output: 'true' }],
        'increasingTriplet', [{ type: 'int[]', name: 'nums' }], 'boolean', ['Keep track of two smallest numbers']),

    // 39. Partition Labels
    createQuestion('Partition Labels', 'partition-labels', 'Medium', 'String',
        'You are given a string `s`. We want to partition the string into as many parts as possible so that each letter appears in at most one part. Return a list of integers representing the size of these parts.',
        ['1 <= s.length <= 500'],
        [{ input: 's = "ababcbacadefegdehijhklij"', output: '[9,7,8]', explanation: '' }],
        [{ input: 'ababcbacadefegdehijhklij', output: '9 7 8' }, { input: 'eccbbbbdec', output: '10' }],
        'partitionLabels', [{ type: 'string', name: 's' }], 'int[]', ['Last occurrence index map']),

    // 40. Decode String
    createQuestion('Decode String', 'decode-string', 'Medium', 'String',
        'Given an encoded string, return its decoded string. The encoding rule is: `k[encoded_string]`, where the `encoded_string` inside the square brackets is being repeated exactly `k` times. Note that `k` is guaranteed to be a positive integer.',
        ['1 <= s.length <= 30'],
        [{ input: 's = "3[a]2[bc]"', output: '"aaabcbc"', explanation: '' }, { input: 's = "3[a2[c]]"', output: '"accaccacc"', explanation: '' }],
        [{ input: '3[a]2[bc]', output: 'aaabcbc' }, { input: '3[a2[c]]', output: 'accaccacc' }, { input: '2[abc]3[cd]ef', output: 'abcabccdcdef' }],
        'decodeString', [{ type: 'string', name: 's' }], 'string', ['Stack', 'Recursion']),

    // 41. Find All Duplicates in an Array
    createQuestion('Find All Duplicates in an Array', 'find-all-duplicates-in-an-array', 'Medium', 'Array',
        'Given an integer array `nums` of length `n` where all the integers of `nums` are in the range `[1, n]` and each integer appears once or twice, return an array of all the integers that appears twice.',
        ['n == nums.length'],
        [{ input: 'nums = [4,3,2,7,8,2,3,1]', output: '[2,3]', explanation: '' }],
        [{ input: '4 3 2 7 8 2 3 1', output: '2 3' }, { input: '1 1 2', output: '1' }, { input: '1', output: '' }],
        'findDuplicates', [{ type: 'int[]', name: 'nums' }], 'int[]', ['Use index mapping (negate values)']),

    // 42. Next Permutation
    createQuestion('Next Permutation', 'next-permutation', 'Medium', 'Array',
        'A permutation of an array of integers is an arrangement of its members into a sequence or linear order. Given an array of integers `nums`, find the next permutation of `nums`.',
        ['1 <= nums.length <= 100'],
        [{ input: 'nums = [1,2,3]', output: '[1,3,2]', explanation: '' }, { input: 'nums = [3,2,1]', output: '[1,2,3]', explanation: '' }],
        [{ input: '1 2 3', output: '1 3 2' }, { input: '3 2 1', output: '1 2 3' }, { input: '1 1 5', output: '1 5 1' }],
        'nextPermutation', [{ type: 'int[]', name: 'nums' }], 'int[]', ['Find pivot, swap, reverse suffix']),

    // 43. Trapping Rain Water
    createQuestion('Trapping Rain Water', 'trapping-rain-water', 'Hard', 'Array',
        'Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.',
        ['n == height.length'],
        [{ input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: '' }, { input: 'height = [4,2,0,3,2,5]', output: '9', explanation: '' }],
        [{ input: '0 1 0 2 1 0 1 3 2 1 2 1', output: '6' }, { input: '4 2 0 3 2 5', output: '9' }],
        'trap', [{ type: 'int[]', name: 'height' }], 'int', ['Two pointers', 'Max left/right arrays']),

    // 44. Sliding Window Maximum
    createQuestion('Sliding Window Maximum', 'sliding-window-maximum', 'Hard', 'Array',
        'You are given an array of integers `nums`, there is a sliding window of size `k` which is moving from the very left of the array to the very right. You can only see the `k` numbers in the window. Each time the sliding window moves right by one position. Return the max sliding window.',
        ['1 <= k <= nums.length'],
        [{ input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]', explanation: '' }],
        [{ input: '1 3 -1 -3 5 3 6 7\\n3', output: '3 3 5 5 6 7' }, { input: '1\\n1', output: '1' }],
        'maxSlidingWindow', [{ type: 'int[]', name: 'nums' }, { type: 'int', name: 'k' }], 'int[]', ['Monotonic deque']),

    // 45. Longest Valid Parentheses
    createQuestion('Longest Valid Parentheses', 'longest-valid-parentheses', 'Hard', 'String',
        'Given a string containing just the characters `(` and `)`, return the length of the longest valid (well-formed) parentheses substring.',
        ['0 <= s.length <= 3 * 10^4'],
        [{ input: 's = "(()"', output: '2', explanation: '' }, { input: 's = ")()())"', output: '4', explanation: '' }],
        [{ input: '(()', output: '2' }, { input: ')()())', output: '4' }, { input: '', output: '0' }],
        'longestValidParentheses', [{ type: 'string', name: 's' }], 'int', ['Stack', 'DP', 'Two counters']),

    // 46. Largest Rectangle in Histogram
    createQuestion('Largest Rectangle in Histogram', 'largest-rectangle-in-histogram', 'Hard', 'Array',
        'Given an array of integers `heights` representing the histogram\'s bar height where the width of each bar is `1`, return the area of the largest rectangle in the histogram.',
        ['1 <= heights.length <= 10^5'],
        [{ input: 'heights = [2,1,5,6,2,3]', output: '10', explanation: '' }, { input: 'heights = [2,4]', output: '4', explanation: '' }],
        [{ input: '2 1 5 6 2 3', output: '10' }, { input: '2 4', output: '4' }],
        'largestRectangleArea', [{ type: 'int[]', name: 'heights' }], 'int', ['Monotonic stack']),

    // 47. First Missing Positive
    createQuestion('First Missing Positive', 'first-missing-positive', 'Hard', 'Array',
        'Given an unsorted integer array `nums`, return the smallest missing positive integer. You must implement an algorithm that runs in `O(n)` time and uses constant extra space.',
        ['1 <= nums.length <= 10^5'],
        [{ input: 'nums = [1,2,0]', output: '3', explanation: '' }, { input: 'nums = [3,4,-1,1]', output: '2', explanation: '' }],
        [{ input: '1 2 0', output: '3' }, { input: '3 4 -1 1', output: '2' }, { input: '7 8 9 11 12', output: '1' }],
        'firstMissingPositive', [{ type: 'int[]', name: 'nums' }], 'int', ['In-place swap to correct index']),

    // 48. Text Justification
    createQuestion('Text Justification', 'text-justification', 'Hard', 'String',
        'Given an array of strings `words` and a width `maxWidth`, format the text such that each line has exactly `maxWidth` characters and is fully (left and right) justified.',
        ['1 <= words.length <= 300'],
        [{ input: 'words = ["This", "is", "an", "example", "of", "text", "justification."], maxWidth = 16', output: '["This    is    an","example  of text","justification.  "]', explanation: '' }],
        [{ input: 'This is an example of text justification.\\n16', output: 'This    is    an|example  of text|justification.  ' }],
        'fullJustify', [{ type: 'string[]', name: 'words' }, { type: 'int', name: 'maxWidth' }], 'string[]', ['Greedy packing']),

    // 49. Count of Smaller Numbers After Self
    createQuestion('Count of Smaller Numbers After Self', 'count-of-smaller-numbers-after-self', 'Hard', 'Array',
        'Given an integer array `nums`, return an integer array `counts` where `counts[i]` is the number of smaller elements to the right of `nums[i]`.',
        ['1 <= nums.length <= 10^5'],
        [{ input: 'nums = [5,2,6,1]', output: '[2,1,1,0]', explanation: '' }, { input: 'nums = [-1]', output: '[0]', explanation: '' }],
        [{ input: '5 2 6 1', output: '2 1 1 0' }, { input: '-1', output: '0' }, { input: '-1 -1', output: '0 0' }],
        'countSmaller', [{ type: 'int[]', name: 'nums' }], 'int[]', ['Merge sort', 'Fenwick tree', 'Segment tree']),

    // 50. Shortest Palindrome
    createQuestion('Shortest Palindrome', 'shortest-palindrome', 'Hard', 'String',
        'You are given a string `s`. You can convert `s` to a palindrome by adding characters in front of it. Find and return the shortest palindrome you can find by performing this transformation.',
        ['0 <= s.length <= 5 * 10^4'],
        [{ input: 's = "aacecaaa"', output: '"aaacecaaa"', explanation: '' }, { input: 's = "abcd"', output: '"dcbabcd"', explanation: '' }],
        [{ input: 'aacecaaa', output: 'aaacecaaa' }, { input: 'abcd', output: 'dcbabcd' }],
        'shortestPalindrome', [{ type: 'string', name: 's' }], 'string', ['KMP Algorithm', 'String hashing']),

    // 51. Edit Distance
    createQuestion('Edit Distance', 'edit-distance', 'Hard', 'String',
        'Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`.',
        ['0 <= word1.length, word2.length <= 500'],
        [{ input: 'word1 = "horse", word2 = "ros"', output: '3', explanation: 'horse -> rorse (replace "h" with "r") -> rose (remove "r") -> ros (remove "e")' }],
        [{ input: 'horse\\nros', output: '3' }, { input: 'intention\\nexecution', output: '5' }],
        'minDistance', [{ type: 'string', name: 'word1' }, { type: 'string', name: 'word2' }], 'int', ['DP']),

    // 52. Merge Intervals
    createQuestion('Merge Intervals', 'merge-intervals', 'Medium', 'Array',
        'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
        ['1 <= intervals.length <= 10^4'],
        [{ input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: '' }],
        [{ input: '[[1,3],[2,6],[8,10],[15,18]]', output: '1 6 8 10 15 18' }, { input: '[[1,4],[4,5]]', output: '1 5' }],
        'merge', [{ type: 'int[][]', name: 'intervals' }], 'int[][]', ['Sort by start time']),

    // 53. Find Peak Element
    createQuestion('Find Peak Element', 'find-peak-element', 'Medium', 'Array',
        'A peak element is an element that is strictly greater than its neighbors. Given a 0-indexed integer array `nums`, find a peak element, and return its index. If the array contains multiple peaks, return the index to any of the peaks.',
        ['1 <= nums.length <= 1000'],
        [{ input: 'nums = [1,2,3,1]', output: '2', explanation: '3 is a peak element and your function should return the index number 2.' }],
        [{ input: '1 2 3 1', output: '2' }, { input: '1 2 1 3 5 6 4', output: '5' }],
        'findPeakElement', [{ type: 'int[]', name: 'nums' }], 'int', ['Binary search']),

    // 54. Maximum Product Subarray
    createQuestion('Maximum Product Subarray', 'maximum-product-subarray', 'Medium', 'Array',
        'Given an integer array `nums`, find a subarray that has the largest product, and return the product. The test cases are generated so that the answer will fit in a 32-bit integer.',
        ['1 <= nums.length <= 2 * 10^4'],
        [{ input: 'nums = [2,3,-2,4]', output: '6', explanation: '[2,3] has the largest product 6.' }, { input: 'nums = [-2,0,-1]', output: '0', explanation: 'The result cannot be 2, because [-2,-1] is not a subarray.' }],
        [{ input: '2 3 -2 4', output: '6' }, { input: '-2 0 -1', output: '0' }],
        'maxProduct', [{ type: 'int[]', name: 'nums' }], 'int', ['Track max and min product'])

];

const allQuestions = [...existing10, ...newQuestions];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform');
        console.log('Connected to DB');

        // await Question.deleteMany({});
        // console.log('Cleared questions');

        console.log('Upserting questions to preserve User history...');
        for (const q of allQuestions) {
            await Question.findOneAndUpdate(
                { slug: q.slug },
                q,
                { upsert: true, new: true }
            );
        }
        console.log(`Successfully processed ${allQuestions.length} questions`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

if (require.main === module) {
    seed();
}

module.exports = { allQuestions, seed };
