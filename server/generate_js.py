
import json

def gen_qs_call(q):
    constraints = json.dumps(q['constraints'])
    examples = json.dumps(q['examples'])
    test_cases = json.dumps(q['testCases'])
    args_json = json.dumps(q['args'])
    hints = json.dumps(q['hints'])
    
    return f"""
    // {q['id']}. {q['title']}
    createQuestion(
        {json.dumps(q['title'])}, 
        {json.dumps(q['slug'])}, 
        {json.dumps(q['difficulty'])}, 
        {json.dumps(q['topic'])},
        {json.dumps(q['description'])},
        {constraints},
        {examples},
        {test_cases},
        {json.dumps(q['fn'])},
        {args_json},
        {json.dumps(q['returnType'])},
        {hints}
    ),
"""

questions = [
    {
        "id": 11, "title": "Plus One", "slug": "plus-one", "difficulty": "Easy", "topic": "Array",
        "description": "You are given a large integer represented as an integer array `digits`, where each `digits[i]` is the `i`th digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading `0`'s.\n\nIncrement the large integer by one and return the resulting array of digits.",
        "constraints": ["1 <= digits.length <= 100", "0 <= digits[i] <= 9", "The large integer does not contain any leading 0's"],
        "examples": [{"input": "digits = [1,2,3]", "output": "[1,2,4]", "explanation": "123 + 1 = 124"}, {"input": "digits = [9]", "output": "[1,0]", "explanation": "9 + 1 = 10"}],
        "testCases": [{"input": "1 2 3", "output": "1 2 4"}, {"input": "4 3 2 1", "output": "4 3 2 2"}, {"input": "9", "output": "1 0"}],
        "fn": "plusOne", "args": [{"type": "int[]", "name": "digits"}], "returnType": "int[]",
        "hints": ["Start from the end", "Handle carry"]
    },
    {
        "id": 12, "title": "Valid Parentheses", "slug": "valid-parentheses", "difficulty": "Easy", "topic": "String",
        "description": "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
        "constraints": ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
        "examples": [{"input": "s = \"()\"", "output": "true", "explanation": "Valid parentheses."}, {"input": "s = \"()[]{}\"", "output": "true", "explanation": "All brackets are properly closed."}],
        "testCases": [{"input": "()", "output": "true"}, {"input": "()[]{}", "output": "true"}, {"input": "(]", "output": "false"}],
        "fn": "isValid", "args": [{"type": "string", "name": "s"}], "returnType": "boolean",
        "hints": ["Use a stack data structure.", "Push opening brackets, pop when encountering closing brackets.", "Check if the popped bracket matches the closing bracket."]
    },
    {
        "id": 13, "title": "Longest Common Prefix", "slug": "longest-common-prefix", "difficulty": "Easy", "topic": "String",
        "description": "Write a function to find the longest common prefix string amongst an array of strings.\n\nIf there is no common prefix, return an empty string \"\".",
        "constraints": ["1 <= strs.length <= 200", "0 <= strs[i].length <= 200", "strs[i] consists of only lowercase English letters."],
        "examples": [{"input": "strs = [\"flower\",\"flow\",\"flight\"]", "output": "\"fl\"", "explanation": "The longest common prefix is \"fl\"."}, {"input": "strs = [\"dog\",\"racecar\",\"car\"]", "output": "\"\"", "explanation": "There is no common prefix among the input strings."}],
        "testCases": [{"input": "flower flow flight", "output": "fl"}, {"input": "dog racecar car", "output": ""}],
        "fn": "longestCommonPrefix", "args": [{"type": "string[]", "name": "strs"}], "returnType": "string",
        "hints": ["Compare characters of all strings at each position.", "Stop when you find a mismatch or reach the end of any string.", "You can also sort the array and compare first and last strings."]
    },
    {
        "id": 14, "title": "Contains Duplicate", "slug": "contains-duplicate", "difficulty": "Easy", "topic": "Array",
        "description": "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
        "constraints": ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
        "examples": [{"input": "nums = [1,2,3,1]", "output": "true", "explanation": "1 appears twice in the array."}, {"input": "nums = [1,2,3,4]", "output": "false", "explanation": "All elements are distinct."}],
        "testCases": [{"input": "1 2 3 1", "output": "true"}, {"input": "1 2 3 4", "output": "false"}],
        "fn": "containsDuplicate", "args": [{"type": "int[]", "name": "nums"}], "returnType": "boolean",
        "hints": ["Use a hash set to track numbers you've seen.", "If you encounter a number already in the set, return true.", "Alternatively, sort the array and check adjacent elements."]
    },
    {
        "id": 15, "title": "Rotate Array", "slug": "rotate-array", "difficulty": "Easy", "topic": "Array",
        "description": "Given an integer array `nums`, rotate the array to the right by `k` steps, where `k` is non-negative.",
        "constraints": ["1 <= nums.length <= 10^5", "0 <= k <= 10^5"],
        "examples": [{"input": "nums = [1,2,3,4,5,6,7], k = 3", "output": "[5,6,7,1,2,3,4]", "explanation": "Rotate 1 step to the right: [7,1,2,3,4,5,6]. Rotate 2 steps: [6,7,1,2,3,4,5]. Rotate 3 steps: [5,6,7,1,2,3,4]."}],
        "testCases": [{"input": "1 2 3 4 5 6 7\\n3", "output": "5 6 7 1 2 3 4"}],
        "fn": "rotate", "args": [{"type": "int[]", "name": "nums"}, {"type": "int", "name": "k"}], "returnType": "int[]",
        "hints": ["k might be larger than array length - use k % length.", "Reverse the array, then reverse first k and last n-k parts."]
    },
    {
        "id": 16, "title": "Missing Number", "slug": "missing-number", "difficulty": "Easy", "topic": "Array",
        "description": "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.",
        "constraints": ["n == nums.length", "1 <= n <= 10^4"],
        "examples": [{"input": "nums = [3,0,1]", "output": "2", "explanation": "n = 3 since there are 3 numbers, so all numbers are in the range [0,3]. 2 is the missing number."}],
        "testCases": [{"input": "3 0 1", "output": "2"}, {"input": "0 1", "output": "2"}],
        "fn": "missingNumber", "args": [{"type": "int[]", "name": "nums"}], "returnType": "int",
        "hints": ["Sum of 0 to n = n*(n+1)/2", "Subtract sum of array from expected sum."]
    },
    {
        "id": 17, "title": "Single Number", "slug": "single-number", "difficulty": "Easy", "topic": "Array",
        "description": "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space.",
        "constraints": ["1 <= nums.length <= 3 * 10^4"],
        "examples": [{"input": "nums = [2,2,1]", "output": "1", "explanation": ""}, {"input": "nums = [4,1,2,1,2]", "output": "4", "explanation": ""}],
        "testCases": [{"input": "2 2 1", "output": "1"}, {"input": "4 1 2 1 2", "output": "4"}],
        "fn": "singleNumber", "args": [{"type": "int[]", "name": "nums"}], "returnType": "int",
        "hints": ["Think about XOR (^) operator properties.", "n ^ n = 0, n ^ 0 = n."]
    },
    {
        "id": 18, "title": "Intersection of Two Arrays", "slug": "intersection-of-two-arrays", "difficulty": "Easy", "topic": "Array",
        "description": "Given two integer arrays `nums1` and `nums2`, return an array of their intersection. Each element in the result must be unique and you may return the result in any order.",
        "constraints": ["1 <= nums1.length, nums2.length <= 1000"],
        "examples": [{"input": "nums1 = [1,2,2,1], nums2 = [2,2]", "output": "[2]", "explanation": ""}],
        "testCases": [{"input": "1 2 2 1\\n2 2", "output": "2"}, {"input": "4 9 5\\n9 4 9 8 4", "output": "4 9"}],
        "fn": "intersection", "args": [{"type": "int[]", "name": "nums1"}, {"type": "int[]", "name": "nums2"}], "returnType": "int[]",
        "hints": ["Use a Set to store elements from one array.", "Check if elements of second array exist in the Set."]
    },
    {
        "id": 19, "title": "Majority Element", "slug": "majority-element", "difficulty": "Easy", "topic": "Array",
        "description": "Given an array `nums` of size `n`, return the majority element. The majority element is the element that appears more than `⌊n / 2⌋` times. You may assume that the majority element always exists in the array.",
        "constraints": ["n == nums.length", "1 <= n <= 5 * 10^4"],
        "examples": [{"input": "nums = [3,2,3]", "output": "3", "explanation": ""}, {"input": "nums = [2,2,1,1,1,2,2]", "output": "2", "explanation": ""}],
        "testCases": [{"input": "3 2 3", "output": "3"}, {"input": "2 2 1 1 1 2 2", "output": "2"}],
        "fn": "majorityElement", "args": [{"type": "int[]", "name": "nums"}], "returnType": "int",
        "hints": ["Use a hash map to count occurrences.", "Boyer-Moore Voting Algorithm is O(n) time and O(1) space."]
    },
    {
        "id": 20, "title": "Pangram Sentence", "slug": "pangram-sentence", "difficulty": "Easy", "topic": "String",
        "description": "A pangram is a sentence where every letter of the English alphabet appears at least once. Given a string `sentence` containing only lowercase English letters, return `true` if `sentence` is a pangram, or `false` otherwise.",
        "constraints": ["1 <= sentence.length <= 1000"],
        "examples": [{"input": "sentence = \"thequickbrownfoxjumpsoverthelazydog\"", "output": "true", "explanation": "Contains at least one of every letter."}],
        "testCases": [{"input": "thequickbrownfoxjumpsoverthelazydog", "output": "true"}, {"input": "leetcode", "output": "false"}],
        "fn": "checkIfPangram", "args": [{"type": "string", "name": "sentence"}], "returnType": "boolean",
        "hints": ["Create a set/array to mark seen characters.", "Check if the set size is 26."]
    },
    {
        "id": 21, "title": "Reverse Words in a String", "slug": "reverse-words", "difficulty": "Easy", "topic": "String",
        "description": "Given an input string `s`, reverse the order of the words. A word is defined as a sequence of non-space characters. The words in `s` will be separated by at least one space. Return a string of the words in reverse order concatenated by a single space.",
        "constraints": ["1 <= s.length <= 10^4"],
        "examples": [{"input": "s = \"the sky is blue\"", "output": "\"blue is sky the\"", "explanation": ""}],
        "testCases": [{"input": "the sky is blue", "output": "blue is sky the"}, {"input": "  hello world  ", "output": "world hello"}],
        "fn": "reverseWords", "args": [{"type": "string", "name": "s"}], "returnType": "string",
        "hints": ["Split the string by spaces.", "Reverse the list of words.", "Join them back with a single space."]
    },
    {
        "id": 22, "title": "Find Pivot Index", "slug": "find-pivot-index", "difficulty": "Easy", "topic": "Array",
        "description": "Given an array of integers `nums`, calculate the pivot index of this array. The pivot index is the index where the sum of all the numbers strictly to the left of the index is equal to the sum of all the numbers strictly to the index's right.",
        "constraints": ["1 <= nums.length <= 10^4"],
        "examples": [{"input": "nums = [1,7,3,6,5,6]", "output": "3", "explanation": "Left sum = 1+7+3 = 11, Right sum = 5+6 = 11"}],
        "testCases": [{"input": "1 7 3 6 5 6", "output": "3"}, {"input": "1 2 3", "output": "-1"}],
        "fn": "pivotIndex", "args": [{"type": "int[]", "name": "nums"}], "returnType": "int",
        "hints": ["Calculate total sum.", "Iterate and keep track of left sum. right sum = total - left - current."]
    },
    { "id": 23, "title": "Valid Palindrome II", "slug": "valid-palindrome-ii", "difficulty": "Easy", "topic": "String",
      "description": "Given a string `s`, return `true` if the `s` can be palindrome after deleting at most one character from it.",
      "constraints": ["1 <= s.length <= 10^5"],
      "examples": [{"input": "s = \"aba\"", "output": "true", "explanation": ""}, {"input": "s = \"abca\"", "output": "true", "explanation": "Delete c"}],
      "testCases": [{"input": "aba", "output": "true"}, {"input": "abca", "output": "true"}],
      "fn": "validPalindrome", "args": [{"type": "string", "name": "s"}], "returnType": "boolean", "hints": ["Two pointers", "Match mismatches skipping one char"] },
    { "id": 24, "title": "Fizz Buzz", "slug": "fizz-buzz", "difficulty": "Easy", "topic": "String",
      "description": "Given an integer `n`, return a string array `answer` (1-indexed) where: `answer[i] == \"FizzBuzz\"` if `i` is divisible by 3 and 5. `answer[i] == \"Fizz\"` if `i` is divisible by 3. `answer[i] == \"Buzz\"` if `i` is divisible by 5. `answer[i] == i` if none of the above conditions are true.",
      "constraints": ["1 <= n <= 10^4"],
      "examples": [{"input": "n = 3", "output": "[\"1\",\"2\",\"Fizz\"]", "explanation": ""}],
      "testCases": [{"input": "3", "output": "1 2 Fizz"}],
      "fn": "fizzBuzz", "args": [{"type": "int", "name": "n"}], "returnType": "string[]", "hints": ["Modulo operator"] },
    { "id": 25, "title": "Truncate Sentence", "slug": "truncate-sentence", "difficulty": "Easy", "topic": "String",
      "description": "A sentence is a list of words that are separated by a single space with no leading or trailing spaces. You are given a sentence `s` and an integer `k`. You want to truncate `s` such that it contains only the first `k` words. Return `s` after truncating it.",
      "constraints": ["1 <= s.length <= 500", "1 <= k <= 500"],
      "examples": [{"input": "s = \"Hello how are you Contestant\", k = 4", "output": "\"Hello how are you\"", "explanation": ""}],
      "testCases": [{"input": "Hello how are you Contestant\\n4", "output": "Hello how are you"}],
      "fn": "truncateSentence", "args": [{"type": "string", "name": "s"}, {"type": "int", "name": "k"}], "returnType": "string", "hints": ["Count spaces"] },
    {
        "id": 26, "title": "Longest Substring Without Repeating Characters", "slug": "longest-substring-without-repeating-characters", "difficulty": "Medium", "topic": "String",
        "description": "Given a string `s`, find the length of the longest substring without repeating characters.",
        "constraints": ["0 <= s.length <= 5 * 10^4"],
        "examples": [{"input": "s = \"abcabcbb\"", "output": "3", "explanation": "The answer is \"abc\", with the length of 3."}],
        "testCases": [{"input": "abcabcbb", "output": "3"}, {"input": "bbbbb", "output": "1"}],
        "fn": "lengthOfLongestSubstring", "args": [{"type": "string", "name": "s"}], "returnType": "int",
        "hints": ["Use a sliding window.", "Keep track of characters in the current window using a Set or Map."]
    },
    { "id": 27, "title": "3Sum", "slug": "3sum", "difficulty": "Medium", "topic": "Array",
      "description": "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.",
      "constraints": ["0 <= nums.length <= 3000"],
      "examples": [{"input": "nums = [-1,0,1,2,-1,-4]", "output": "[[-1,-1,2],[-1,0,1]]", "explanation": ""}],
      "testCases": [{"input": "-1 0 1 2 -1 -4", "output": "-1 -1 2 -1 0 1"}],
      "fn": "threeSum", "args": [{"type": "int[]", "name": "nums"}], "returnType": "int[][]", "hints": ["Sort array", "Two pointers loops"] },
    { "id": 28, "title": "Product of Array Except Self", "slug": "product-of-array-except-self", "difficulty": "Medium", "topic": "Array",
      "description": "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.",
      "constraints": ["2 <= nums.length <= 10^5"],
      "examples": [{"input": "nums = [1,2,3,4]", "output": "[24,12,8,6]", "explanation": ""}],
      "testCases": [{"input": "1 2 3 4", "output": "24 12 8 6"}],
      "fn": "productExceptSelf", "args": [{"type": "int[]", "name": "nums"}], "returnType": "int[]", "hints": ["Prefix product array", "Suffix product array"] },
    { "id": 29, "title": "Group Anagrams", "slug": "group-anagrams", "difficulty": "Medium", "topic": "String",
      "description": "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
      "constraints": ["1 <= strs.length <= 10^4"],
      "examples": [{"input": "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", "output": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]", "explanation": ""}],
      "testCases": [{"input": "eat tea tan ate nat bat", "output": "bat|nat tan|ate eat tea"}],
      "fn": "groupAnagrams", "args": [{"type": "string[]", "name": "strs"}], "returnType": "string[][]", "hints": ["Sort each string to use as key", "Hash map"] },
    { "id": 30, "title": "Longest Palindromic Substring", "slug": "longest-palindromic-substring", "difficulty": "Medium", "topic": "String",
      "description": "Given a string `s`, return the longest palindromic substring in `s`.",
      "constraints": ["1 <= s.length <= 1000"],
      "examples": [{"input": "s = \"babad\"", "output": "\"bab\"", "explanation": ""}],
      "testCases": [{"input": "babad", "output": "bab"}],
      "fn": "longestPalindrome", "args": [{"type": "string", "name": "s"}], "returnType": "string", "hints": ["Expand around center"] },
    {
        "id": 31, "title": "Set Matrix Zeroes", "slug": "set-matrix-zeroes", "difficulty": "Medium", "topic": "Array",
        "description": "Given an `m x n` integer matrix `matrix`, if an element is `0`, set its entire row and column to `0`'s. You must do it in-place.",
        "constraints": ["m == matrix.length", "n == matrix[0].length"],
        "examples": [{"input": "matrix = [[1,1,1],[1,0,1],[1,1,1]]", "output": "[[1,0,1],[0,0,0],[1,0,1]]", "explanation": ""}],
        "testCases": [{"input": "[[1,1,1],[1,0,1],[1,1,1]]", "output": "[[1,0,1],[0,0,0],[1,0,1]]"}],
        "fn": "setZeroes", "args": [{"type": "int[][]", "name": "matrix"}], "returnType": "void",
        "hints": ["Use the first row and first column to store markers.", "Handle the first row/col separately."]
    },
    { "id": 32, "title": "Spiral Matrix", "slug": "spiral-matrix", "difficulty": "Medium", "topic": "Array",
      "description": "Given an `m x n` matrix, return all elements of the matrix in spiral order.",
      "constraints": ["m == matrix.length"],
      "examples": [{"input": "matrix = [[1,2,3],[4,5,6],[7,8,9]]", "output": "[1,2,3,6,9,8,7,4,5]", "explanation": ""}],
      "testCases": [{"input": "[[1,2,3],[4,5,6],[7,8,9]]", "output": "1 2 3 6 9 8 7 4 5"}],
      "fn": "spiralOrder", "args": [{"type": "int[][]", "name": "matrix"}], "returnType": "int[]", "hints": ["Simulate the process", "Keep track of visited boundaries"] },
    { "id": 33, "title": "Rotate Image", "slug": "rotate-image", "difficulty": "Medium", "topic": "Array",
      "description": "You are given an `n x n` 2D matrix representing an image, rotate the image by 90 degrees (clockwise). You have to rotate the image in-place.",
      "constraints": ["n == matrix.length"],
      "examples": [{"input": "matrix = [[1,2,3],[4,5,6],[7,8,9]]", "output": "[[7,4,1],[8,5,2],[9,6,3]]", "explanation": ""}],
      "testCases": [{"input": "[[1,2,3],[4,5,6],[7,8,9]]", "output": "[[7,4,1],[8,5,2],[9,6,3]]"}],
      "fn": "rotate", "args": [{"type": "int[][]", "name": "matrix"}], "returnType": "void", "hints": ["Transpose matrix", "Reverse each row"] },
    { "id": 34, "title": "Subarray Sum Equals K", "slug": "subarray-sum-equals-k", "difficulty": "Medium", "topic": "Array",
      "description": "Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals to `k`.",
      "constraints": ["1 <= nums.length <= 2*10^4"],
      "examples": [{"input": "nums = [1,1,1], k = 2", "output": "2", "explanation": ""}],
      "testCases": [{"input": "1 1 1\\n2", "output": "2"}],
      "fn": "subarraySum", "args": [{"type": "int[]", "name": "nums"}, {"type": "int", "name": "k"}], "returnType": "int", "hints": ["Prefix sum", "Hash map storing frequency of sums"] },
    { "id": 35, "title": "Minimum Window Substring", "slug": "minimum-window-substring", "difficulty": "Medium", "topic": "String",
      "description": "Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window.",
      "constraints": ["m == s.length"],
      "examples": [{"input": "s = \"ADOBECODEBANC\", t = \"ABC\"", "output": "\"BANC\"", "explanation": ""}],
      "testCases": [{"input": "ADOBECODEBANC ABC", "output": "BANC"}],
      "fn": "minWindow", "args": [{"type": "string", "name": "s"}, {"type": "string", "name": "t"}], "returnType": "string", "hints": ["Sliding window", "Two pointers"] },
    { "id": 36, "title": "Encode and Decode Strings", "slug": "encode-and-decode-strings", "difficulty": "Medium", "topic": "String",
      "description": "Design an algorithm to encode a list of strings to a string. The encoded string is then sent over the network and is decoded back to the original list of strings.",
      "constraints": ["1 <= strs.length <= 200"],
      "examples": [{"input": "strs = [\"lint\",\"code\",\"love\",\"you\"]", "output": "[\"lint\",\"code\",\"love\",\"you\"]", "explanation": ""}],
      "testCases": [{"input": "lint code love you", "output": "lint code love you"}],
      "fn": "encode", "args": [{"type": "string[]", "name": "strs"}], "returnType": "string", "hints": ["Length prefixing", "Delimiter"] },
    { "id": 37, "title": "Word Search", "slug": "word-search", "difficulty": "Medium", "topic": "Array",
      "description": "Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid. The word can be constructed from letters of sequentially adjacent cells.",
      "constraints": ["m == board.length"],
      "examples": [{"input": "board = [[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word = \"ABCCED\"", "output": "true", "explanation": ""}],
      "testCases": [{"input": "[[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]]\nABCCED", "output": "true"}],
      "fn": "exist", "args": [{"type": "char[][]", "name": "board"}, {"type": "string", "name": "word"}], "returnType": "boolean", "hints": ["DFS", "Backtracking"] },
    { "id": 38, "title": "Increasing Triplet Subsequence", "slug": "increasing-triplet-subsequence", "difficulty": "Medium", "topic": "Array",
      "description": "Given an integer array `nums`, return `true` if there exists a triple of indices `(i, j, k)` such that `i < j < k` and `nums[i] < nums[j] < nums[k]`.",
      "constraints": ["1 <= nums.length <= 5*10^5"],
      "examples": [{"input": "nums = [1,2,3,4,5]", "output": "true", "explanation": ""}],
      "testCases": [{"input": "1 2 3 4 5", "output": "true"}],
      "fn": "increasingTriplet", "args": [{"type": "int[]", "name": "nums"}], "returnType": "boolean", "hints": ["Track first and second smallest number"] },
    { "id": 39, "title": "Partition Labels", "slug": "partition-labels", "difficulty": "Medium", "topic": "String",
      "description": "You are given a string `s`. We want to partition the string into as many parts as possible so that each letter appears in at most one part. Return a list of integers representing the size of these parts.",
      "constraints": ["1 <= s.length <= 500"],
      "examples": [{"input": "s = \"ababcbacadefegdehijhklij\"", "output": "[9,7,8]", "explanation": ""}],
      "testCases": [{"input": "ababcbacadefegdehijhklij", "output": "9 7 8"}],
      "fn": "partitionLabels", "args": [{"type": "string", "name": "s"}], "returnType": "int[]", "hints": ["Greedy", "Last occurrence map"] },
    { "id": 40, "title": "Decode String", "slug": "decode-string", "difficulty": "Medium", "topic": "String",
      "description": "Given an encoded string, return its decoded string. The encoding rule is: `k[encoded_string]`, where the `encoded_string` inside the square brackets is being repeated exactly `k` times.",
      "constraints": ["1 <= s.length <= 30"],
      "examples": [{"input": "s = \"3[a]2[bc]\"", "output": "\"aaabcbc\"", "explanation": ""}],
      "testCases": [{"input": "3[a]2[bc]", "output": "aaabcbc"}],
      "fn": "decodeString", "args": [{"type": "string", "name": "s"}], "returnType": "string", "hints": ["Stack", "Recursion"] },
    { "id": 41, "title": "Find All Duplicates in an Array", "slug": "find-all-duplicates-in-an-array", "difficulty": "Medium", "topic": "Array",
      "description": "Given an integer array `nums` of length `n` where all the integers of `nums` are in the range `[1, n]` and each integer appears once or twice, return an array of all the integers that appears twice.",
      "constraints": ["n == nums.length"],
      "examples": [{"input": "nums = [4,3,2,7,8,2,3,1]", "output": "[2,3]", "explanation": ""}],
      "testCases": [{"input": "4 3 2 7 8 2 3 1", "output": "2 3"}],
      "fn": "findDuplicates", "args": [{"type": "int[]", "name": "nums"}], "returnType": "int[]", "hints": ["Use elements as indices", "Negate values to mark visited"] },
    { "id": 42, "title": "Next Permutation", "slug": "next-permutation", "difficulty": "Medium", "topic": "Array",
      "description": "A permutation of an array of integers is an arrangement of its members into a sequence or linear order. Given an array of integers `nums`, find the next permutation of `nums`.",
      "constraints": ["1 <= nums.length <= 100"],
      "examples": [{"input": "nums = [1,2,3]", "output": "[1,3,2]", "explanation": ""}],
      "testCases": [{"input": "1 2 3", "output": "1 3 2"}],
      "fn": "nextPermutation", "args": [{"type": "int[]", "name": "nums"}], "returnType": "int[]", "hints": ["Find pivot (first smaller from right)", "Swap", "Reverse suffix"] },
    {
        "id": 43, "title": "Trapping Rain Water", "slug": "trapping-rain-water", "difficulty": "Hard", "topic": "Array",
        "description": "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.",
        "constraints": ["n == height.length"],
        "examples": [{"input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6", "explanation": ""}],
        "testCases": [{"input": "0 1 0 2 1 0 1 3 2 1 2 1", "output": "6"}],
        "fn": "trap", "args": [{"type": "int[]", "name": "height"}], "returnType": "int",
        "hints": ["Compute max height to the left for each element.", "Compute max height to the right.", "Water at i = min(max_left, max_right) - height[i]."]
    },
    { "id": 44, "title": "Sliding Window Maximum", "slug": "sliding-window-maximum", "difficulty": "Hard", "topic": "Array",
      "description": "You are given an array of integers `nums`, there is a sliding window of size `k` which is moving from the very left of the array to the very right. Return the max sliding window.",
      "constraints": ["1 <= k <= nums.length"],
      "examples": [{"input": "nums = [1,3,-1,-3,5,3,6,7], k = 3", "output": "[3,3,5,5,6,7]", "explanation": ""}],
      "testCases": [{"input": "1 3 -1 -3 5 3 6 7\\n3", "output": "3 3 5 5 6 7"}],
      "fn": "maxSlidingWindow", "args": [{"type": "int[]", "name": "nums"}, {"type": "int", "name": "k"}], "returnType": "int[]", "hints": ["Monotonic deque", "Store indices"] },
    { "id": 45, "title": "Longest Valid Parentheses", "slug": "longest-valid-parentheses", "difficulty": "Hard", "topic": "String",
      "description": "Given a string containing just the characters `(` and `)`, return the length of the longest valid (well-formed) parentheses substring.",
      "constraints": ["0 <= s.length <= 3*10^4"],
      "examples": [{"input": "s = \"(()\"", "output": "2", "explanation": ""}],
      "testCases": [{"input": "(()", "output": "2"}],
      "fn": "longestValidParentheses", "args": [{"type": "string", "name": "s"}], "returnType": "int", "hints": ["Stack indices", "DP"] },
    { "id": 46, "title": "Largest Rectangle in Histogram", "slug": "largest-rectangle-in-histogram", "difficulty": "Hard", "topic": "Array",
      "description": "Given an array of integers `heights` representing the histogram's bar height where the width of each bar is `1`, return the area of the largest rectangle in the histogram.",
      "constraints": ["1 <= heights.length <= 10^5"],
      "examples": [{"input": "heights = [2,1,5,6,2,3]", "output": "10", "explanation": ""}],
      "testCases": [{"input": "2 1 5 6 2 3", "output": "10"}],
      "fn": "largestRectangleArea", "args": [{"type": "int[]", "name": "heights"}], "returnType": "int", "hints": ["Monotonic stack"] },
    { "id": 47, "title": "First Missing Positive", "slug": "first-missing-positive", "difficulty": "Hard", "topic": "Array",
      "description": "Given an unsorted integer array `nums`, return the smallest missing positive integer.",
      "constraints": ["1 <= nums.length <= 10^5"],
      "examples": [{"input": "nums = [1,2,0]", "output": "3", "explanation": ""}],
      "testCases": [{"input": "1 2 0", "output": "3"}],
      "fn": "firstMissingPositive", "args": [{"type": "int[]", "name": "nums"}], "returnType": "int", "hints": ["Place 1 to index 0, 2 to index 1...", "First index i where nums[i] != i+1 is answer"] },
    { "id": 48, "title": "Text Justification", "slug": "text-justification", "difficulty": "Hard", "topic": "String",
      "description": "Given an array of strings `words` and a width `maxWidth`, format the text such that each line has exactly `maxWidth` characters and is fully (left and right) justified.",
      "constraints": ["1 <= words.length <= 300"],
      "examples": [{"input": "words = [\"This\", \"is\", \"an\", \"example\", \"of\", \"text\", \"justification.\"], maxWidth = 16", "output": "[\"This    is    an\",\"example  of text\",\"justification.  \"]", "explanation": ""}],
      "testCases": [{"input": "This is an example of text justification.\\n16", "output": "This    is    an|example  of text|justification.  "}],
      "fn": "fullJustify", "args": [{"type": "string[]", "name": "words"}, {"type": "int", "name": "maxWidth"}], "returnType": "string[]", "hints": ["Greedy packing", "Calculate spaces"] },
    { "id": 49, "title": "Count of Smaller Numbers After Self", "slug": "count-of-smaller-numbers-after-self", "difficulty": "Hard", "topic": "Array",
      "description": "Given an integer array `nums`, return an integer array `counts` where `counts[i]` is the number of smaller elements to the right of `nums[i]`.",
      "constraints": ["1 <= nums.length <= 10^5"],
      "examples": [{"input": "nums = [5,2,6,1]", "output": "[2,1,1,0]", "explanation": ""}],
      "testCases": [{"input": "5 2 6 1", "output": "2 1 1 0"}],
      "fn": "countSmaller", "args": [{"type": "int[]", "name": "nums"}], "returnType": "int[]", "hints": ["Merge sort", "Fenwick Tree"] },
    { "id": 50, "title": "Shortest Palindrome", "slug": "shortest-palindrome", "difficulty": "Hard", "topic": "String",
      "description": "You are given a string `s`. You can convert `s` to a palindrome by adding characters in front of it. Find and return the shortest palindrome you can find by performing this transformation.",
      "constraints": ["0 <= s.length <= 5*10^4"],
      "examples": [{"input": "s = \"aacecaaa\"", "output": "\"aaacecaaa\"", "explanation": ""}],
      "testCases": [{"input": "aacecaaa", "output": "aaacecaaa"}],
      "fn": "shortestPalindrome", "args": [{"type": "string", "name": "s"}], "returnType": "string", "hints": ["KMP algorithm"] },
    { "id": 51, "title": "Edit Distance", "slug": "edit-distance", "difficulty": "Hard", "topic": "String",
      "description": "Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`.",
      "constraints": ["0 <= word1.length, word2.length <= 500"],
      "examples": [{"input": "word1 = \"horse\", word2 = \"ros\"", "output": "3", "explanation": ""}],
      "testCases": [{"input": "horse ros", "output": "3"}],
      "fn": "minDistance", "args": [{"type": "string", "name": "word1"}, {"type": "string", "name": "word2"}], "returnType": "int", "hints": ["Dynamic Programming"] },
    { "id": 52, "title": "Merge Intervals", "slug": "merge-intervals", "difficulty": "Medium", "topic": "Array",
      "description": "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.",
      "constraints": ["1 <= intervals.length <= 10^4"],
      "examples": [{"input": "intervals = [[1,3],[2,6],[8,10],[15,18]]", "output": "[[1,6],[8,10],[15,18]]", "explanation": ""}],
      "testCases": [{"input": "[[1,3],[2,6],[8,10],[15,18]]", "output": "[[1,6],[8,10],[15,18]]"}],
      "fn": "merge", "args": [{"type": "int[][]", "name": "intervals"}], "returnType": "int[][]", "hints": ["Sort by start time"] },
    { "id": 53, "title": "Find Peak Element", "slug": "find-peak-element", "difficulty": "Medium", "topic": "Array",
      "description": "A peak element is an element that is strictly greater than its neighbors. Given a 0-indexed integer array `nums`, find a peak element, and return its index.",
      "constraints": ["1 <= nums.length <= 1000"],
      "examples": [{"input": "nums = [1,2,3,1]", "output": "2", "explanation": ""}],
      "testCases": [{"input": "1 2 3 1", "output": "2"}],
      "fn": "findPeakElement", "args": [{"type": "int[]", "name": "nums"}], "returnType": "int", "hints": ["Binary search"] },
    { "id": 54, "title": "Maximum Product Subarray", "slug": "maximum-product-subarray", "difficulty": "Medium", "topic": "Array",
      "description": "Given an integer array `nums`, find a subarray that has the largest product, and return the product.",
      "constraints": ["1 <= nums.length <= 2*10^4"],
      "examples": [{"input": "nums = [2,3,-2,4]", "output": "6", "explanation": ""}],
      "testCases": [{"input": "2 3 -2 4", "output": "6"}],
      "fn": "maxProduct", "args": [{"type": "int[]", "name": "nums"}], "returnType": "int", "hints": ["Track max and min product"] }
]

js_content = """require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./src/models/Question');

// Import existing 10 questions for consistency
const existing10 = require('./add_10_questions_backup.js').allQuestions;

// Helper to generate full question object
function createQuestion(title, slug, difficulty, topic, description, constraints, examples, testCases, fn, args, returnType, hints) {
    
    // Generate starter code dynamically
    const jsArgs = args.map(a => a.name).join(', ');
    const pyFn = fn.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    const pyArgs = args.map(a => a.name).join(', '); 
    
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
    
    let cArgs = args.map(a => {
        let t = getCType(a.type);
        if (a.type.includes('[]')) {
            if(a.type === 'string[]') return `char** ${a.name}, int ${a.name}Size`;
            if(a.type === 'int[]') return `int* ${a.name}, int ${a.name}Size`;
             if(a.type === 'char[][]') return `char** ${a.name}, int ${a.name}Size, int* ${a.name}ColSize`;
             if(a.type === 'int[][]') return `int** ${a.name}, int ${a.name}Size, int* ${a.name}ColSize`;
        }
        return `${t} ${a.name}`;
    }).join(', ');
    
    let cRet = getCType(returnType);
    if (returnType.includes('[]')) {
        cArgs += ', int* returnSize'; 
        if(returnType === 'int[][]') cArgs += ', int** returnColumnSizes';
    }

    const javaRet = getJavaType(returnType);
    const cppRet = getCppType(returnType);

    const starterCode = {
        javascript: `function ${fn}(${jsArgs}) {\\n    // Your code here\\n}`,
        python: `class Solution:\\n    def ${pyFn}(self, ${pyArgs}):\\n        # Your code here\\n        pass`,
        java: `class Solution {\\n    public ${javaRet} ${fn}(${javaArgs}) {\\n        // Your code here\\n    }\\n}`,
        cpp: `class Solution {\\npublic:\\n    ${cppRet} ${fn}(${cppArgs}) {\\n        // Your code here\\n    }\\n};`,
        c: `${cRet} ${fn}(${cArgs}) {\\n    // Your code here\\n}`
    };

    return {
        title, slug, description, difficulty, topic, constraints, examples, 
        testCases: testCases.map((tc, i) => ({ ...tc, isHidden: i >= 3 })), 
        starterCode, hints
    };
}

const newQuestions = [
"""

for q in questions:
    js_content += gen_qs_call(q)

js_content += """
];

const allQuestions = [...existing10, ...newQuestions];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform');
        console.log('Connected to DB');
        
        await Question.deleteMany({});
        console.log('Cleared questions');
        
        await Question.insertMany(allQuestions);
        console.log(`Successfully added ${allQuestions.length} questions`);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

if (require.main === module) {
    seed();
}
"""


# Generate problemConfig.js
config_content = """
const PROBLEM_CONFIG = {
"""

for q in questions:
    args_js = []
    for arg in q['args']:
        args_js.append(f"{{ type: '{arg['type']}', name: '{arg['name']}' }}")
    
    args_str = ", ".join(args_js)
    
    config_content += f"""
    '{q['slug']}': {{
        fn: '{q['fn']}',
        args: [{args_str}],
        returnType: '{q['returnType']}'
    }},
"""

# Add existing 10 configs if needed, or just overwrite with all 54? 
# The 'questions' list has all 54 technically? No, existing10 are imported in JS but I don't have them in Python list.
# I need to add the first 10 to the Python list if I want to generate FULL config.
# Or I can manually append the first 10 here.

# Let's add the first 10 manually or assume 'questions' list has specific range.
# My 'questions' list in this file starts at ID 11.
# I need IDs 1-10.
# I will copy them from the original 'problemConfig.js' OR just add them to the python list.
# Adding them to Python list is safer.

config_content += """
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
"""

with open('src/configs/problemConfig.js', 'w', encoding='utf-8') as f:
    f.write(config_content)

print("Generated src/configs/problemConfig.js successfully")

