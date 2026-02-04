// Script to generate all 54 properly formatted LeetCode-style questions
// This script generates question objects based on the user's requirements

const questionTemplates = [
    // Questions 1-10: Already created above
    // Questions 11-25: Easy continuation
    {
        id: 11,
        title: 'Plus One',
        slug: 'plus-one',
        difficulty: 'Easy',
        topic: 'Array',
        fn: 'plusOne',
        args: [{ type: 'int[]', name: 'digits' }],
        returnType: 'int[]',
        description: `You are given a **large integer** represented as an integer array \`digits\`, where each \`digits[i]\` is the \`i\`th digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading \`0\`'s.

Increment the large integer by one and return the resulting array of digits.`,
        constraints: [
            '1 <= digits.length <= 100',
            '0 <= digits[i] <= 9',
            'digits does not contain any leading 0\\'s.'
        ],
        examples: [
            { input: '[1,2,3]', output: '[1,2,4]', explanation: 'The array represents the integer 123. Incrementing by one gives 123 + 1 = 124.' },
            { input: '[4,3,2,1]', output: '[4,3,2,2]', explanation: 'The array represents the integer 4321.' },
            { input: '[9]', output: '[1,0]', explanation: 'The array represents the integer 9. Incrementing by one gives 9 + 1 = 10.' }
        ],
        testCases: [
            '1 2 3|1 2 4',
            '4 3 2 1|4 3 2 2',
            '9|1 0',
            '9 9|1 0 0:hidden',
            '0|1:hidden',
            '1 9 9|2 0 0:hidden',
            '9 9 9 9|1 0 0 0 0:hidden'
        ],
        hints: [
            'Start from the rightmost digit.',
            'Keep track of the carry.',
            'If there\'s a carry at the end, you need to add a new digit at the front.'
        ]
    },
    {
        id: 12,
        title: 'Valid Parentheses',
        slug: 'valid-parentheses',
        difficulty: 'Easy',
        topic: 'String',
        fn: 'isValid',
        args: [{ type: 'string', name: 's' }],
        returnType: 'boolean',
        description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
        constraints: [
            '1 <= s.length <= 10^4',
            's consists of parentheses only \'()[]{}\'.'
        ],
        examples: [
            { input: '()', output: 'true', explanation: 'Valid parentheses.' },
            { input: '()[]{}', output: 'true', explanation: 'All brackets are properly closed.' },
            { input: '(]', output: 'false', explanation: 'Wrong closing bracket.' }
        ],
        testCases: [
            '()|true',
            '()[]{}|true',
            '(]|false',
            '([)]|false:hidden',
            '{[]}|true:hidden',
            '(((|false:hidden',
            ')))|false:hidden',
            '((()))|true:hidden'
        ],
        hints: [
            'Use a stack data structure.',
            'Push opening brackets, pop when encountering closing brackets.',
            'Check if the popped bracket matches the closing bracket.'
        ]
    },
    {
        id: 13,
        title: 'Longest Common Prefix',
        slug: 'longest-common-prefix',
        difficulty: 'Easy',
        topic: 'String',
        fn: 'longestCommonPrefix',
        args: [{ type: 'string[]', name: 'strs' }],
        returnType: 'string',
        description: `Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string \`""\`.`,
        constraints: [
            '1 <= strs.length <= 200',
            '0 <= strs[i].length <= 200',
            'strs[i] consists of only lowercase English letters.'
        ],
        examples: [
            { input: '["flower","flow","flight"]', output: '"fl"', explanation: 'The longest common prefix is "fl".' },
            { input: '["dog","racecar","car"]', output: '""', explanation: 'There is no common prefix.' }
        ],
        testCases: [
            'flower flow flight|fl',
            'dog racecar car|',
            'a|a:hidden',
            'ab ab ab|ab:hidden',
            'abc abcd abe|ab:hidden',
            'test testing tester|test:hidden'
        ],
        hints: [
            'Compare characters of all strings at each position.',
            'Stop when you find a mismatch or reach the end of any string.',
            'You can also sort the array and compare first and last strings.'
        ]
    }
    // Add more questions...
];

// Function to generate full question object from template
function generateQuestion(template) {
    const { id, title, slug, difficulty, topic, fn, args, returnType, description, constraints, examples, testCases, hints } = template;

    // Generate test cases
    const formattedTestCases = testCases.map((tc, idx) => {
        const [input, output, hidden] = tc.split('|');
        const isHidden = hidden === 'hidden' || tc.includes(':hidden') || idx >= 3;
        return {
            input: input.replace(/\\n/g, '\\\\n'),
            output: output.replace(':hidden', ''),
            isHidden
        };
    });

    // Generate starter code for all languages
    const starterCode = generateStarterCode(fn, args, returnType);

    return {
        title,
        slug,
        description,
        difficulty,
        topic,
        constraints,
        examples,
        testCases: formattedTestCases,
        starterCode,
        hints
    };
}

function generateStarterCode(fn, args, returnType) {
    // JavaScript
    const jsArgs = args.map(a => a.name).join(', ');
    const javascript = `function ${fn}(${jsArgs}) {
    // Your code here
}`;

    // Python - convert camelCase to snake_case
    const pyFn = fn.replace(/([A-Z])/g, '_$1').toLowerCase();
    const pyArgs = args.map(a => a.name).join(', ');
    const python = `class Solution:
def ${pyFn}(self, ${pyArgs}):
        # Your code here
        pass`;

    // Java
    const javaReturnType = returnType === 'int[]' ? 'int[]' : returnType === 'boolean' ? 'boolean' : returnType === 'string' ? 'String' : 'int';
    const javaArgs = args.map(a => {
        let type = a.type === 'int[]' ? 'int[]' : a.type === 'string' ? 'String' : 'int';
        return `${type} ${a.name}`;
    }).join(', ');
    const java = `class Solution {
    public ${javaReturnType} ${fn}(${javaArgs}) {
        // Your code here
    }
}`;

    // C++
    const cppReturnType = returnType === 'int[]' ? 'vector<int>' : returnType === 'boolean' ? 'bool' : returnType === 'string' ? 'string' : 'int';
    const cppArgs = args.map(a => {
        let type = a.type === 'int[]' ? 'vector<int>&' : a.type === 'string' ? 'string' : 'int';
        return `${type} ${a.name}`;
    }).join(', ');
    const cpp = `class Solution {
public:
    ${cppReturnType} ${fn}(${cppArgs}) {
        // Your code here
    }
};`;

    // C
    let cArgs = args.map((a, i) => {
        if (a.type === 'int[]') return `int* ${a.name}, int ${a.name}Size`;
        if (a.type === 'string') return `char* ${a.name}`;
        return `int ${a.name}`;
    }).join(', ');

    let cReturnType = returnType === 'int[]' ? 'int*' : returnType === 'boolean' ? 'bool' : returnType === 'string' ? 'char*' : 'int';
    if (returnType === 'int[]') cArgs += ', int* returnSize';

    const c = `${cReturnType} ${fn}(${cArgs}) {
    // Your code here
}`;

    return { javascript, python, java, cpp, c };
}

console.log('Generator loaded. Use generateQuestion(template) to create questions.');
module.exports = { generateQuestion, questionTemplates };
