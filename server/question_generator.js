// Generator script to create all 54 questions programmatically
const fs = require('fs');
const path = require('path');

// Question data templates - concise format
const questionData = require('./questions_data_54.json');

// Helper function to generate starter code
function generateStarterCode(fn, args, returnType, slug) {
    const jsArgs = args.map(a => a.name).join(', ');
    const pyFn = fn.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');

    // Map types
    const typeMap = {
        'int': { js: 'number', py: 'int', java: 'int', cpp: 'int', c: 'int' },
        'int[]': { js: 'number[]', py: 'List[int]', java: 'int[]', cpp: 'vector<int>&', c: 'int*' },
        'string': { js: 'string', py: 'str', java: 'String', cpp: 'string', c: 'char*' },
        'string[]': { js: 'string[]', py: 'List[str]', java: 'String[]', cpp: 'vector<string>&', c: 'char**' },
        'char[]': { js: 'char[]', py: 'List[str]', java: 'char[]', cpp: 'vector<char>&', c: 'char*' },
        'boolean': { js: 'boolean', py: 'bool', java: 'boolean', cpp: 'bool', c: 'bool' },
        'void': { js: 'void', py: 'None', java: 'void', cpp: 'void', c: 'void' }
    };

    const retType = typeMap[returnType] || typeMap['int'];

    // JavaScript
    const javascript = `function ${fn}(${jsArgs}) {
    // Your code here
}`;

    // Python
    const pyArgs = args.map(a => a.name).join(', ');
    const python = `class Solution:
    def ${pyFn}(self, ${pyArgs}):
        # Your code here
        pass`;

    // Java
    const javaArgs = args.map(a => `${typeMap[a.type]?.java || 'int'} ${a.name}`).join(', ');
    const java = `class Solution {
    public ${retType.java} ${fn}(${javaArgs}) {
        // Your code here
    }
}`;

    // C++
    const cppArgs = args.map(a => `${typeMap[a.type]?.cpp || 'int'} ${a.name}`).join(', ');
    const cpp = `class Solution {
public:
    ${retType.cpp} ${fn}(${cppArgs}) {
        // Your code here
    }
};`;

    // C
    let cArgs = args.map((a, i) => {
        if (a.type === 'int[]') return `int* ${a.name}, int ${a.name}Size`;
        return `${typeMap[a.type]?.c || 'int'} ${a.name}`;
    }).join(', ');

    if (returnType === 'int[]' || returnType === 'string[]') cArgs += ', int* returnSize';

    const c = `${retType.c}${returnType.includes('[]') ? '*' : ''} ${fn}(${cArgs}) {
    // Your code here
}`;

    return { javascript, python, java, cpp, c };
}

// Generate complete question object
function generateCompleteQuestion(q) {
    return {
        title: q.title,
        slug: q.slug,
        description: q.description,
        difficulty: q.difficulty,
        topic: q.topic,
        constraints: q.constraints,
        examples: q.examples,
        testCases: q.testCases.map((tc, idx) => ({
            input: tc.input,
            output: tc.output,
            isHidden: tc.isHidden !== undefined ? tc.isHidden : idx >= 3
        })),
        starterCode: generateStarterCode(q.fn, q.args, q.returnType, q.slug),
        hints: q.hints
    };
}

// Main execution
console.log('Question generator loaded successfully!');
console.log('Use generateCompleteQuestion(questionData) to create full question objects');

module.exports = { generateCompleteQuestion, generateStarterCode };
