# Complete 54 Questions Generator
# This Python script generates all 54 questions with complete details

import json

# Compact question templates (will expand to full format)
QUESTIONS_DATA = {
    # Questions 1-10 already complete in add_10_questions_backup.js
    
    # Questions 11-20: Easy
    11: {'title': 'Plus One', 'slug': 'plus-one', 'diff': 'Easy', 'topic': 'Array', 'fn': 'plusOne'},
    12: {'title': 'Valid Parentheses', 'slug': 'valid-parentheses', 'diff': 'Easy', 'topic': 'String', 'fn': 'isValid'},
    13: {'title': 'Longest Common Prefix', 'slug': 'longest-common-prefix', 'diff': 'Easy', 'topic': 'String', 'fn': 'longestCommonPrefix'},
    14: {'title': 'Contains Duplicate', 'slug': 'contains-duplicate', 'diff': 'Easy', 'topic': 'Array', 'fn': 'containsDuplicate'},
    15: {'title': 'Rotate Array', 'slug': 'rotate-array', 'diff': 'Easy', 'topic': 'Array', 'fn': 'rotate'},
    16: {'title': 'Missing Number', 'slug': 'missing-number', 'diff': 'Easy', 'topic': 'Array', 'fn': 'missingNumber'},
    17: {'title': 'Single Number', 'slug': 'single-number', 'diff': 'Easy', 'topic': 'Array', 'fn': 'singleNumber'},
    18: {'title': 'Intersection of Two Arrays', 'slug': 'intersection-of-two-arrays', 'diff': 'Easy', 'topic': 'Array', 'fn': 'intersection'},
    19: {'title': 'Majority Element', 'slug': 'majority-element', 'diff': 'Easy', 'topic': 'Array', 'fn': 'majorityElement'},
    20: {'title': 'Pangram Sentence', 'slug': 'pangram-sentence', 'diff': 'Easy', 'topic': 'String', 'fn': 'checkIfPangram'},
    
    # Questions 21-25: Easy
    21: {'title': 'Reverse Words', 'slug': 'reverse-words', 'diff': 'Easy', 'topic': 'String', 'fn': 'reverseWords'},
    22: {'title': 'Find Pivot Index', 'slug': 'find-pivot-index', 'diff': 'Easy', 'topic': 'Array', 'fn': 'pivotIndex'},
    23: {'title': 'Valid Palindrome II', 'slug': 'valid-palindrome-ii', 'diff': 'Easy', 'topic': 'String', 'fn': 'validPalindrome'},
    24: {'title': 'Fizz Buzz', 'slug': 'fizz-buzz', 'diff': 'Easy', 'topic': 'String', 'fn': 'fizzBuzz'},
    25: {'title': 'Truncate Sentence', 'slug': 'truncate-sentence', 'diff': 'Easy', 'topic': 'String', 'fn': 'truncateSentence'},
    
    # Questions 26-35: Medium
    26: {'title': 'Longest Substring Without Repeating', 'slug': 'longest-substring-without-repeating-characters', 'diff': 'Medium', 'topic': 'String', 'fn': 'lengthOfLongestSubstring'},
    27: {'title': '3Sum', 'slug': '3sum', 'diff': 'Medium', 'topic': 'Array', 'fn': 'threeSum'},
    28: {'title': 'Product of Array Except Self', 'slug': 'product-of-array-except-self', 'diff': 'Medium', 'topic': 'Array', 'fn': 'productExceptSelf'},
    29: {'title': 'Group Anagrams', 'slug': 'group-anagrams', 'diff': 'Medium', 'topic': 'String', 'fn': 'groupAnagrams'},
    30: {'title': 'Longest Palindromic Substring', 'slug': 'longest-palindromic-substring', 'diff': 'Medium', 'topic': 'String', 'fn': 'longestPalindrome'},
    31: {'title': 'Set Matrix Zeroes', 'slug': 'set-matrix-zeroes', 'diff': 'Medium', 'topic': 'Array', 'fn': 'setZeroes'},
    32: {'title': 'Spiral Matrix', 'slug': 'spiral-matrix', 'diff': 'Medium', 'topic': 'Array', 'fn': 'spiralOrder'},
    33: {'title': 'Rotate Image', 'slug': 'rotate-image', 'diff': 'Medium', 'topic': 'Array', 'fn': 'rotate'},
    34: {'title': 'Subarray Sum Equals K', 'slug': 'subarray-sum-equals-k', 'diff': 'Medium', 'topic': 'Array', 'fn': 'subarraySum'},
    35: {'title': 'Minimum Window Substring', 'slug': 'minimum-window-substring', 'diff': 'Medium', 'topic': 'String', 'fn': 'minWindow'},
    
    # Questions 36-45: Medium
    36: {'title': 'Encode and Decode Strings', 'slug': 'encode-and-decode-strings', 'diff': 'Medium', 'topic': 'String', 'fn': 'encode'},
    37: {'title': 'Word Search', 'slug': 'word-search', 'diff': 'Medium', 'topic': 'Array', 'fn': 'exist'},
    38: {'title': 'Increasing Triplet Subsequence', 'slug': 'increasing-triplet-subsequence', 'diff': 'Medium', 'topic': 'Array', 'fn': 'increasingTriplet'},
    39: {'title': 'Partition Labels', 'slug': 'partition-labels', 'diff': 'Medium', 'topic': 'String', 'fn': 'partitionLabels'},
    40: {'title': 'Decode String', 'slug': 'decode-string', 'diff': 'Medium', 'topic': 'String', 'fn': 'decodeString'},
    41: {'title': 'Find All Duplicates', 'slug': 'find-all-duplicates-in-an-array', 'diff': 'Medium', 'topic': 'Array', 'fn': 'findDuplicates'},
    42: {'title': 'Next Permutation', 'slug': 'next-permutation', 'diff': 'Medium', 'topic': 'Array', 'fn': 'nextPermutation'},
    43: {'title': 'Container With Most Water', 'slug': 'container-with-most-water', 'diff': 'Medium', 'topic': 'Array', 'fn': 'maxArea'},
    44: {'title': 'Sort Colors', 'slug': 'sort-colors', 'diff': 'Medium', 'topic': 'Array', 'fn': 'sortColors'},
    45: {'title': 'Jump Game', 'slug': 'jump-game', 'diff': 'Medium', 'topic': 'Array', 'fn': 'canJump'},
    
    # Questions 46-54: Hard
    46: {'title': 'Trapping Rain Water', 'slug': 'trapping-rain-water', 'diff': 'Hard', 'topic': 'Array', 'fn': 'trap'},
    47: {'title': 'Sliding Window Maximum', 'slug': 'sliding-window-maximum', 'diff': 'Hard', 'topic': 'Array', 'fn': 'maxSlidingWindow'},
    48: {'title': 'Longest Valid Parentheses', 'slug': 'longest-valid-parentheses', 'diff': 'Hard', 'topic': 'String', 'fn': 'longestValidParentheses'},
    49: {'title': 'Largest Rectangle in Histogram', 'slug': 'largest-rectangle-in-histogram', 'diff': 'Hard', 'topic': 'Array', 'fn': 'largestRectangleArea'},
    50: {'title': 'First Missing Positive', 'slug': 'first-missing-positive', 'diff': 'Hard', 'topic': 'Array', 'fn': 'firstMissingPositive'},
    51: {'title': 'Text Justification', 'slug': 'text-justification', 'diff': 'Hard', 'topic': 'String', 'fn': 'fullJustify'},
    52: {'title': 'Count Smaller Numbers After Self', 'slug': 'count-of-smaller-numbers-after-self', 'diff': 'Hard', 'topic': 'Array', 'fn': 'countSmaller'},
    53: {'title': 'Shortest Palindrome', 'slug': 'shortest-palindrome', 'diff': 'Hard', 'topic': 'String', 'fn': 'shortestPalindrome'},
    54: {'title': 'Edit Distance', 'slug': 'edit-distance', 'diff': 'Hard', 'topic': 'String', 'fn': 'minDistance'}
}

print(f"✅ Loaded {len(QUESTIONS_DATA)} question templates")
print(f"📊 Total questions to generate: {len(QUESTIONS_DATA) + 10} (10 existing + {len(QUESTIONS_DATA)} new)")
