const questions = [
    {
        "title": "Contains Duplicate",
        "slug": "contains-duplicate",
        "description": "Given an integer array `nums`, return `true` if any value appears **at least twice** in the array, and return `false` if every element is distinct.",
        "difficulty": "Easy",
        "topic": "Arrays",
        "constraints": [
            "1 <= nums.length <= 10^5",
            "-10^9 <= nums[i] <= 10^9"
        ],
        "examples": [
            {
                "input": "nums = [1,2,3,1]",
                "output": "true",
                "explanation": "1 appears twice."
            },
            {
                "input": "nums = [1,2,3,4]",
                "output": "false",
                "explanation": "All elements are distinct."
            }
        ],
        "testCases": [
            {
                "input": "1 2 3 1",
                "output": "true",
                "isHidden": false
            },
            {
                "input": "1 2 3 4",
                "output": "false",
                "isHidden": false
            },
            {
                "input": "1 1 1 3 3 4 3 2 4 2",
                "output": "true",
                "isHidden": true
            }
        ],
        "starterCode": {
            "javascript": "function containsDuplicate(nums) {\n    // Your code here\n}",
            "python": "class Solution:\n    def containsDuplicate(self, nums):\n        # Your code here\n        pass",
            "java": "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        // Your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        // Your code here\n    }\n};",
            "c": "bool containsDuplicate(int* nums, int numsSize) {\n    // Your code here\n}"
        }
    },
    {
        "title": "Move Zeroes",
        "slug": "move-zeroes",
        "description": "Given an integer array `nums`, move all `0`'s to the end of it while maintaining the relative order of the non-zero elements.\\n\\nNote that you must do this in-place without making a copy of the array. Return the modified array.",
        "difficulty": "Easy",
        "topic": "Arrays",
        "constraints": [
            "1 <= nums.length <= 10^4",
            "-2^31 <= nums[i] <= 2^31 - 1"
        ],
        "examples": [
            {
                "input": "nums = [0,1,0,3,12]",
                "output": "[1,3,12,0,0]",
                "explanation": "0s moved to right."
            },
            {
                "input": "nums = [0]",
                "output": "[0]",
                "explanation": "No change."
            }
        ],
        "testCases": [
            {
                "input": "0 1 0 3 12",
                "output": "1 3 12 0 0",
                "isHidden": false
            },
            {
                "input": "0",
                "output": "0",
                "isHidden": false
            },
            {
                "input": "1 2 3",
                "output": "1 2 3",
                "isHidden": true
            }
        ],
        "starterCode": {
            "javascript": "function moveZeroes(nums) {\n    // Your code here - return array\n}",
            "python": "class Solution:\n    def moveZeroes(self, nums):\n        # Your code here\n        pass",
            "java": "class Solution {\n    public int[] moveZeroes(int[] nums) {\n        // Your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    vector<int> moveZeroes(vector<int>& nums) {\n        // Your code here\n    }\n};",
            "c": "int* moveZeroes(int* nums, int numsSize, int* returnSize) {\n    // Your code here\n}"
        }
    },
    {
        "title": "Plus One",
        "slug": "plus-one",
        "description": "You are given a large integer represented as an integer array `digits`, where each `digits[i]` is the `i`th digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading 0's.\\n\\nIncrement the large integer by one and return the resulting array of digits.",
        "difficulty": "Easy",
        "topic": "Arrays",
        "constraints": [
            "1 <= digits.length <= 100",
            "0 <= digits[i] <= 9"
        ],
        "examples": [
            {
                "input": "digits = [1,2,3]",
                "output": "[1,2,4]",
                "explanation": "123 + 1 = 124"
            },
            {
                "input": "digits = [4,3,2,1]",
                "output": "[4,3,2,2]",
                "explanation": "4321 + 1 = 4322"
            },
            {
                "input": "digits = [9]",
                "output": "[1,0]",
                "explanation": "9 + 1 = 10"
            }
        ],
        "testCases": [
            {
                "input": "1 2 3",
                "output": "1 2 4",
                "isHidden": false
            },
            {
                "input": "4 3 2 1",
                "output": "4 3 2 2",
                "isHidden": false
            },
            {
                "input": "9",
                "output": "1 0",
                "isHidden": false
            },
            {
                "input": "9 9",
                "output": "1 0 0",
                "isHidden": true
            }
        ],
        "starterCode": {
            "javascript": "function plusOne(digits) {\n    // Your code here\n}",
            "python": "class Solution:\n    def plusOne(self, digits):\n        # Your code here\n        pass",
            "java": "class Solution {\n    public int[] plusOne(int[] digits) {\n        // Your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    vector<int> plusOne(vector<int>& digits) {\n        // Your code here\n    }\n};",
            "c": "int* plusOne(int* digits, int digitsSize, int* returnSize) {\n    // Your code here\n}"
        }
    },
    {
        "title": "Valid Anagram",
        "slug": "valid-anagram",
        "description": "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
        "difficulty": "Easy",
        "topic": "Strings",
        "constraints": [
            "1 <= s.length, t.length <= 5 * 10^4",
            "s and t consist of lowercase English letters."
        ],
        "examples": [
            {
                "input": "s = \"anagram\", t = \"nagaram\"",
                "output": "true",
                "explanation": "Letters match."
            },
            {
                "input": "s = \"rat\", t = \"car\"",
                "output": "false",
                "explanation": "Letters do not match."
            }
        ],
        "testCases": [
            {
                "input": "anagram nagaram",
                "output": "true",
                "isHidden": false
            },
            {
                "input": "rat car",
                "output": "false",
                "isHidden": false
            },
            {
                "input": "a a",
                "output": "true",
                "isHidden": true
            },
            {
                "input": "ab a",
                "output": "false",
                "isHidden": true
            }
        ],
        "starterCode": {
            "javascript": "function isAnagram(s, t) {\n    // Your code here\n}",
            "python": "class Solution:\n    def isAnagram(self, s, t):\n        # Your code here\n        pass",
            "java": "class Solution {\n    public boolean isAnagram(String s, String t) {\n        // Your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        // Your code here\n    }\n};",
            "c": "bool isAnagram(char* s, char* t) {\n    // Your code here\n}"
        }
    },
    {
        "title": "Length of Last Word",
        "slug": "length-of-last-word",
        "description": "Given a string `s` consisting of words and spaces, return the length of the last word in the string. A word is a maximal substring consisting of non-space characters.",
        "difficulty": "Easy",
        "topic": "Strings",
        "constraints": [
            "1 <= s.length <= 10^4"
        ],
        "examples": [
            {
                "input": "s = \"Hello World\"",
                "output": "5",
                "explanation": "\"World\" length is 5."
            },
            {
                "input": "s = \"   fly me   to   the moon  \"",
                "output": "4",
                "explanation": "\"moon\" length is 4."
            }
        ],
        "testCases": [
            {
                "input": "Hello World",
                "output": "5",
                "isHidden": false
            },
            {
                "input": "   fly me   to   the moon  ",
                "output": "4",
                "isHidden": false
            },
            {
                "input": "luffy is still joyboy",
                "output": "6",
                "isHidden": false
            }
        ],
        "starterCode": {
            "javascript": "function lengthOfLastWord(s) {\n    // Your code here\n}",
            "python": "class Solution:\n    def lengthOfLastWord(self, s):\n        # Your code here\n        pass",
            "java": "class Solution {\n    public int lengthOfLastWord(String s) {\n        // Your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int lengthOfLastWord(string s) {\n        // Your code here\n    }\n};",
            "c": "int lengthOfLastWord(char* s) {\n    // Your code here\n}"
        }
    },
    {
        "title": "Power of Two",
        "slug": "power-of-two",
        "description": "Given an integer `n`, return `true` if it is a power of two. Otherwise, return `false`.",
        "difficulty": "Easy",
        "topic": "Math",
        "constraints": [
            "-2^31 <= n <= 2^31 - 1"
        ],
        "examples": [
            {
                "input": "n = 1",
                "output": "true",
                "explanation": "2^0 = 1"
            },
            {
                "input": "n = 16",
                "output": "true",
                "explanation": "2^4 = 16"
            },
            {
                "input": "n = 3",
                "output": "false",
                "explanation": ""
            }
        ],
        "testCases": [
            {
                "input": "1",
                "output": "true",
                "isHidden": false
            },
            {
                "input": "16",
                "output": "true",
                "isHidden": false
            },
            {
                "input": "3",
                "output": "false",
                "isHidden": false
            },
            {
                "input": "1024",
                "output": "true",
                "isHidden": true
            },
            {
                "input": "0",
                "output": "false",
                "isHidden": true
            }
        ],
        "starterCode": {
            "javascript": "function isPowerOfTwo(n) {\n    // Your code here\n}",
            "python": "class Solution:\n    def isPowerOfTwo(self, n):\n        # Your code here\n        pass",
            "java": "class Solution {\n    public boolean isPowerOfTwo(int n) {\n        // Your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    bool isPowerOfTwo(int n) {\n        // Your code here\n    }\n};",
            "c": "bool isPowerOfTwo(int n) {\n    // Your code here\n}"
        }
    },
    {
        "title": "Single Number",
        "slug": "single-number",
        "description": "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space.",
        "difficulty": "Easy",
        "topic": "Bit Manipulation",
        "constraints": [
            "1 <= nums.length <= 3 * 10^4"
        ],
        "examples": [
            {
                "input": "nums = [2,2,1]",
                "output": "1",
                "explanation": ""
            },
            {
                "input": "nums = [4,1,2,1,2]",
                "output": "4",
                "explanation": ""
            }
        ],
        "testCases": [
            {
                "input": "2 2 1",
                "output": "1",
                "isHidden": false
            },
            {
                "input": "4 1 2 1 2",
                "output": "4",
                "isHidden": false
            },
            {
                "input": "1",
                "output": "1",
                "isHidden": true
            }
        ],
        "starterCode": {
            "javascript": "function singleNumber(nums) {\n    // Your code here\n}",
            "python": "class Solution:\n    def singleNumber(self, nums):\n        # Your code here\n        pass",
            "java": "class Solution {\n    public int singleNumber(int[] nums) {\n        // Your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        // Your code here\n    }\n};",
            "c": "int singleNumber(int* nums, int numsSize) {\n    // Your code here\n}"
        }
    },
    {
        "title": "Same Tree",
        "slug": "same-tree",
        "description": "Given the roots of two binary trees `p` and `q`, write a function to check if they are the same or not. Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.",
        "difficulty": "Easy",
        "topic": "Trees",
        "constraints": [
            "Number of nodes in both trees is in the range [0, 100]."
        ],
        "examples": [
            {
                "input": "p = [1,2,3], q = [1,2,3]",
                "output": "true",
                "explanation": ""
            },
            {
                "input": "p = [1,2], q = [1,null,2]",
                "output": "false",
                "explanation": ""
            }
        ],
        "testCases": [
            {
                "input": "1 2 3 - 1 2 3",
                "output": "true",
                "isHidden": false
            },
            {
                "input": "1 2 - 1 null 2",
                "output": "false",
                "isHidden": false
            },
            {
                "input": "1 2 1 - 1 1 2",
                "output": "false",
                "isHidden": false
            }
        ],
        "starterCode": {
            "javascript": "function isSameTree(p, q) {\n    // Your code here\n}",
            "python": "class Solution:\n    def isSameTree(self, p, q):\n        # Your code here\n        pass",
            "java": "class Solution {\n    public boolean isSameTree(TreeNode p, TreeNode q) {\n        // Your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    bool isSameTree(TreeNode* p, TreeNode* q) {\n        // Your code here\n    }\n};",
            "c": "bool isSameTree(struct TreeNode* p, struct TreeNode* q) {\n    // Your code here\n}"
        }
    },
    {
        "title": "Invert Binary Tree",
        "slug": "invert-binary-tree",
        "description": "Given the root of a binary tree, invert the tree, and return its root.",
        "difficulty": "Easy",
        "topic": "Trees",
        "constraints": [
            "The number of nodes in the tree is in the range [0, 100]."
        ],
        "examples": [
            {
                "input": "root = [4,2,7,1,3,6,9]",
                "output": "4 7 2 9 6 3 1",
                "explanation": "Level Order of Inverted"
            },
            {
                "input": "root = [2,1,3]",
                "output": "2 3 1",
                "explanation": ""
            }
        ],
        "testCases": [
            {
                "input": "4 2 7 1 3 6 9",
                "output": "4 7 2 9 6 3 1",
                "isHidden": false
            },
            {
                "input": "2 1 3",
                "output": "2 3 1",
                "isHidden": false
            },
            {
                "input": "",
                "output": "",
                "isHidden": true
            }
        ],
        "starterCode": {
            "javascript": "function invertTree(root) {\n    // Your code here\n}",
            "python": "class Solution:\n    def invertTree(self, root):\n        # Your code here\n        pass",
            "java": "class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        // Your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        // Your code here\n    }\n};",
            "c": "struct TreeNode* invertTree(struct TreeNode* root) {\n    // Your code here\n}"
        }
    },
    {
        "title": "Maximum Depth of Binary Tree",
        "slug": "maximum-depth-of-binary-tree",
        "description": "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
        "difficulty": "Easy",
        "topic": "Trees",
        "constraints": [
            "The number of nodes in the tree is in the range [0, 10^4]."
        ],
        "examples": [
            {
                "input": "root = [3,9,20,null,null,15,7]",
                "output": "3",
                "explanation": ""
            },
            {
                "input": "root = [1,null,2]",
                "output": "2",
                "explanation": ""
            }
        ],
        "testCases": [
            {
                "input": "3 9 20 null null 15 7",
                "output": "3",
                "isHidden": false
            },
            {
                "input": "1 null 2",
                "output": "2",
                "isHidden": false
            }
        ],
        "starterCode": {
            "javascript": "function maxDepth(root) {\n    // Your code here\n}",
            "python": "class Solution:\n    def maxDepth(self, root):\n        # Your code here\n        pass",
            "java": "class Solution {\n    public int maxDepth(TreeNode root) {\n        // Your code here\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        // Your code here\n    }\n};",
            "c": "int maxDepth(struct TreeNode* root) {\n    // Your code here\n}"
        }
    },
    {
        "title": "Fibonacci Number",
        "slug": "fibonacci-number",
        "description": "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. Given `n`, calculate `F(n)`.",
        "difficulty": "Easy",
        "topic": "Dynamic Programming",
        "constraints": [
            "0 <= n <= 30"
        ],
        "examples": [
            {
                "input": "n = 2",
                "output": "1",
                "explanation": "1+0 = 1"
            }
        ],
        "testCases": [
            {
                "input": "2",
                "output": "1",
                "isHidden": false
            },
            {
                "input": "3",
                "output": "2",
                "isHidden": false
            },
            {
                "input": "4",
                "output": "3",
                "isHidden": false
            }
        ],
        "starterCode": {
            "javascript": "function fib(n) { // code }",
            "python": "class Solution:\n    def fib(self, n):\n        # Your code here\n        pass",
            "java": "class Solution { public int fib(int n) { } }",
            "cpp": "class Solution { public: int fib(int n) { } };",
            "c": "int fib(int n) { }"
        }
    },
    {
        "title": "Reverse String",
        "slug": "reverse-string",
        "description": "Write a function that reverses a string. The input string is given as an array of characters `s`. You must do this by modifying the input array in-place with O(1) extra memory.",
        "difficulty": "Easy",
        "topic": "Strings",
        "constraints": [
            "1 <= s.length <= 10^5"
        ],
        "examples": [
            {
                "input": "s = [\"h\",\"e\",\"l\",\"l\",\"o\"]",
                "output": "[\"o\",\"l\",\"l\",\"e\",\"h\"]",
                "explanation": ""
            }
        ],
        "testCases": [
            {
                "input": "h e l l o",
                "output": "o l l e h",
                "isHidden": false
            }
        ],
        "starterCode": {
            "javascript": "function reverseString(s) { // s is array of chars }",
            "python": "class Solution:\n    def reverseString(self, s):\n        # Your code here\n        pass",
            "java": "class Solution { public void reverseString(char[] s) { } }",
            "cpp": "class Solution { public: void reverseString(vector<char>& s) { } };",
            "c": "void reverseString(char* s, int sSize) { }"
        }
    },
    {
        "title": "Majority Element",
        "slug": "majority-element",
        "description": "Given an array `nums` of size `n`, return the majority element. The majority element is the element that appears more than `⌊n / 2⌋` times.",
        "difficulty": "Easy",
        "topic": "Arrays",
        "constraints": [
            "n == nums.length"
        ],
        "examples": [
            {
                "input": "nums = [3,2,3]",
                "output": "3",
                "explanation": ""
            }
        ],
        "testCases": [
            {
                "input": "3 2 3",
                "output": "3",
                "isHidden": false
            },
            {
                "input": "2 2 1 1 1 2 2",
                "output": "2",
                "isHidden": false
            }
        ],
        "starterCode": {
            "javascript": "function majorityElement(nums) { }",
            "python": "class Solution:\n    def majorityElement(self, nums):\n        # Your code here\n        pass",
            "java": "class Solution { public int majorityElement(int[] nums) { } }",
            "cpp": "class Solution { public: int majorityElement(vector<int>& nums) { } };",
            "c": "int majorityElement(int* nums, int numsSize) { }"
        }
    },
    {
        "title": "Convert Sorted Array to Binary Search Tree",
        "slug": "convert-sorted-array-to-binary-search-tree",
        "description": "Given an integer array `nums` where the elements are sorted in ascending order, convert it to a height-balanced binary search tree.",
        "difficulty": "Easy",
        "topic": "Trees",
        "constraints": [
            "1 <= nums.length <= 10^4"
        ],
        "examples": [
            {
                "input": "nums = [-10,-3,0,5,9]",
                "output": "0 -3 9 -10 null 5",
                "explanation": "One valid answer."
            }
        ],
        "testCases": [
            {
                "input": "-10 -3 0 5 9",
                "output": "0 -3 9 -10 null 5",
                "isHidden": false
            }
        ],
        "starterCode": {
            "javascript": "function sortedArrayToBST(nums) { }",
            "python": "class Solution:\n    def sortedArrayToBST(self, nums):\n        # Your code here\n        pass",
            "java": "class Solution { public TreeNode sortedArrayToBST(int[] nums) { } }",
            "cpp": "class Solution { public: TreeNode* sortedArrayToBST(vector<int>& nums) { } };",
            "c": "struct TreeNode* sortedArrayToBST(int* nums, int numsSize) { }"
        }
    },
    {
        "title": "Intersection of Two Arrays II",
        "slug": "intersection-of-two-arrays-ii",
        "description": "Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must appear as many times as it shows in both arrays and you may return the result in any order.",
        "difficulty": "Easy",
        "topic": "Arrays",
        "constraints": [
            "1 <= nums1.length, nums2.length <= 1000"
        ],
        "examples": [
            {
                "input": "nums1 = [1,2,2,1], nums2 = [2,2]",
                "output": "[2,2]",
                "explanation": ""
            }
        ],
        "testCases": [
            {
                "input": "1 2 2 1\\n2 2",
                "output": "2 2",
                "isHidden": false
            }
        ],
        "starterCode": {
            "javascript": "function intersect(nums1, nums2) { }",
            "python": "class Solution:\n    def intersect(self, nums1, nums2):\n        # Your code here\n        pass",
            "java": "class Solution { public int[] intersect(int[] nums1, int[] nums2) { } }",
            "cpp": "class Solution { public: vector<int> intersect(vector<int>& nums1, vector<int>& nums2) { } };",
            "c": "int* intersect(int* nums1, int nums1Size, int* nums2, int nums2Size, int* returnSize) { }"
        }
    },
    {
        "title": "Power of Three",
        "slug": "power-of-three",
        "description": "Given an integer n, return true if it is a power of three. Otherwise, return false.",
        "difficulty": "Easy",
        "topic": "Math",
        "constraints": [
            "-2^31 <= n <= 2^31 - 1"
        ],
        "examples": [
            {
                "input": "n = 27",
                "output": "true",
                "explanation": ""
            }
        ],
        "testCases": [
            {
                "input": "27",
                "output": "true",
                "isHidden": false
            },
            {
                "input": "0",
                "output": "false",
                "isHidden": false
            }
        ],
        "starterCode": {
            "javascript": "function isPowerOfThree(n) { }",
            "python": "class Solution:\n    def isPowerOfThree(self, n):\n        # Your code here\n        pass",
            "java": "class Solution { public boolean isPowerOfThree(int n) { } }",
            "cpp": "class Solution { public: bool isPowerOfThree(int n) { } };",
            "c": "bool isPowerOfThree(int n) { }"
        }
    },
    {
        "title": "Remove Duplicates from Sorted List",
        "slug": "remove-duplicates-from-sorted-list",
        "description": "Given the head of a sorted linked list, delete all duplicates such that each element appears only once. Return the linked list sorted as well.",
        "difficulty": "Easy",
        "topic": "Linked List",
        "constraints": [
            "The number of nodes is in the range [0, 300]."
        ],
        "examples": [
            {
                "input": "head = [1,1,2]",
                "output": "[1,2]",
                "explanation": ""
            }
        ],
        "testCases": [
            {
                "input": "1 1 2",
                "output": "1 2",
                "isHidden": false
            }
        ],
        "starterCode": {
            "javascript": "function deleteDuplicates(head) { }",
            "python": "class Solution:\n    def deleteDuplicates(self, head):\n        # Your code here\n        pass",
            "java": "class Solution { public ListNode deleteDuplicates(ListNode head) { } }",
            "cpp": "class Solution { public: ListNode* deleteDuplicates(ListNode* head) { } };",
            "c": "struct ListNode* deleteDuplicates(struct ListNode* head) { }"
        }
    },
    {
        "title": "Merge Two Sorted Lists",
        "slug": "merge-two-sorted-lists",
        "description": "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list.",
        "difficulty": "Easy",
        "topic": "Linked List",
        "constraints": [
            "Nodes between 0 and 50"
        ],
        "examples": [
            {
                "input": "list1 = [1,2,4], list2 = [1,3,4]",
                "output": "[1,1,2,3,4,4]",
                "explanation": ""
            }
        ],
        "testCases": [
            {
                "input": "1 2 4\\n1 3 4",
                "output": "1 1 2 3 4 4",
                "isHidden": false
            }
        ],
        "starterCode": {
            "javascript": "function mergeTwoLists(list1, list2) { }",
            "python": "class Solution:\n    def mergeTwoLists(self, list1, list2):\n        # Your code here\n        pass",
            "java": "class Solution { public ListNode mergeTwoLists(ListNode list1, ListNode list2) { } }",
            "cpp": "class Solution { public: ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) { } };",
            "c": "struct ListNode* mergeTwoLists(struct ListNode* list1, struct ListNode* list2) { }"
        }
    },
    {
        "title": "Symmetric Tree",
        "slug": "symmetric-tree",
        "description": "Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).",
        "difficulty": "Easy",
        "topic": "Trees",
        "constraints": [
            "Nodes between 1 and 1000"
        ],
        "examples": [
            {
                "input": "root = [1,2,2,3,4,4,3]",
                "output": "true",
                "explanation": ""
            }
        ],
        "testCases": [
            {
                "input": "1 2 2 3 4 4 3",
                "output": "true",
                "isHidden": false
            },
            {
                "input": "1 2 2 null 3 null 3",
                "output": "false",
                "isHidden": false
            }
        ],
        "starterCode": {
            "javascript": "function isSymmetric(root) { }",
            "python": "class Solution:\n    def isSymmetric(self, root):\n        # Your code here\n        pass",
            "java": "class Solution { public boolean isSymmetric(TreeNode root) { } }",
            "cpp": "class Solution { public: bool isSymmetric(TreeNode* root) { } };",
            "c": "bool isSymmetric(struct TreeNode* root) { }"
        }
    },
    {
        "title": "First Unique Character in a String",
        "slug": "first-unique-character-in-a-string",
        "description": "Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.",
        "difficulty": "Easy",
        "topic": "Strings",
        "constraints": [
            "1 <= s.length <= 10^5"
        ],
        "examples": [
            {
                "input": "s = \"leetcode\"",
                "output": "0",
                "explanation": ""
            }
        ],
        "testCases": [
            {
                "input": "leetcode",
                "output": "0",
                "isHidden": false
            },
            {
                "input": "loveleetcode",
                "output": "2",
                "isHidden": false
            },
            {
                "input": "aabb",
                "output": "-1",
                "isHidden": false
            }
        ],
        "starterCode": {
            "javascript": "function firstUniqChar(s) { }",
            "python": "class Solution:\n    def firstUniqChar(self, s):\n        # Your code here\n        pass",
            "java": "class Solution { public int firstUniqChar(String s) { } }",
            "cpp": "class Solution { public: int firstUniqChar(string s) { } };",
            "c": "int firstUniqChar(char* s) { }"
        }
    }
];

module.exports = questions;
