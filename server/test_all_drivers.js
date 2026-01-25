const mongoose = require('mongoose');
const { executeCode } = require('./src/services/codeExecutor');
const Question = require('./src/models/Question');
require('dotenv').config();

// Dummy solutions that are syntactically valid but incorrect logic.
// The goal is to verify the Driver Code and Input Parsing don't crash.
const DUMMY_SOLUTIONS = {
    javascript: {
        'int': 'return 0;',
        'boolean': 'return false;',
        'string': 'return "";',
        'int[]': 'return [];',
        'ListNode': 'return null;',
        'TreeNode': 'return null;',
        'void': 'return;'
    },
    python: {
        'int': 'return 0',
        'boolean': 'return False',
        'string': 'return ""',
        'int[]': 'return []',
        'ListNode': 'return None',
        'TreeNode': 'return None',
        'void': 'return'
    },
    java: {
        'int': 'return 0;',
        'boolean': 'return false;',
        'string': 'return "";',
        'int[]': 'return new int[]{};',
        'ListNode': 'return null;',
        'TreeNode': 'return null;',
        'List<Integer>': 'return new ArrayList<>();',
        'void': 'return;'
    },
    cpp: {
        'int': 'return 0;',
        'boolean': 'return false;',
        'string': 'return "";',
        'int[]': 'return {};',
        'ListNode': 'return nullptr;',
        'TreeNode': 'return nullptr;',
        'void': 'return;'
    },
    c: {
        'int': 'return 0;',
        'boolean': 'return false;',
        'string': 'return "";',
        'int[]': 'result[0]=0; return result;', // simplified, might fail strict C check but we want to see if driver crashes on input
        'ListNode': 'return NULL;',
        'TreeNode': 'return NULL;',
        'void': 'return;'
    }
};

const WRAPPERS = {
    javascript: (fn, args, body) => `function ${fn}(${args}) { ${body} }`,
    python: (fn, args, body) => `def ${fn}(${args}):\n    ${body}`,
    java: (fn, args, body, ret) => `class Solution { public ${ret} ${fn}(${args}) { ${body} } }`,
    cpp: (fn, args, body, ret) => `class Solution { public: ${ret} ${fn}(${args}) { ${body} } };`,
    c: (fn, args, body, ret) => `${ret} ${fn}(${args}) { ${body} }`
};

const TYPE_MAP = {
    // Standardize return types for Java/C++ signatures
    java: { 'int': 'int', 'boolean': 'boolean', 'string': 'String', 'int[]': 'int[]', 'ListNode': 'ListNode', 'TreeNode': 'TreeNode' },
    cpp: { 'int': 'int', 'boolean': 'bool', 'string': 'string', 'int[]': 'vector<int>', 'ListNode': 'ListNode*', 'TreeNode': 'TreeNode*' },
    c: { 'int': 'int', 'boolean': 'bool', 'string': 'char*', 'int[]': 'int*', 'ListNode': 'struct ListNode*', 'TreeNode': 'struct TreeNode*' }
};

async function generateDummyCode(q, lang) {
    const config = require('./src/configs/problemConfig')[q.slug];
    if (!config) return null;

    let body = DUMMY_SOLUTIONS[lang][config.returnType] || DUMMY_SOLUTIONS[lang]['int']; // fallback

    // Construct args string
    let args = '';
    if (lang === 'javascript') {
        args = config.args.map(a => a.name).join(', ');
    } else if (lang === 'python') {
        args = config.args.map(a => a.name).join(', ');
    } else if (lang === 'java') {
        args = config.args.map(a => `${TYPE_MAP.java[a.type] || a.type} ${a.name}`).join(', ');
    } else if (lang === 'cpp') {
        args = config.args.map(a => `${TYPE_MAP.cpp[a.type] || a.type} ${a.name}`).join(', ');
    } else if (lang === 'c') {
        // C is tricky with arrays
        args = config.args.map(a => {
            let t = TYPE_MAP.c[a.type] || a.type;
            if (a.type === 'int[]') return `int* ${a.name}, int ${a.name}Size`;
            return `${t} ${a.name}`;
        }).join(', ');
        // Fix for return type int[] in C
        if (config.returnType === 'int[]') {
            args += ', int* returnSize';
            body = '*returnSize = 0; return NULL;'; // safe dummy
        }
    }

    let retType = config.returnType;
    if (lang === 'java' || lang === 'cpp' || lang === 'c') {
        retType = TYPE_MAP[lang][config.returnType] || config.returnType;
        if (lang === 'java' && q.slug === 'binary-tree-inorder-traversal') retType = 'List<Integer>';
    }

    return WRAPPERS[lang](config.fn, args, body, retType);
}

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const questions = await Question.find({});
        console.log(`Found ${questions.length} questions.`);

        const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'c']; // Add more if needed

        let failures = [];

        for (const q of questions) {
            console.log(`\n--- Testing ${q.slug} ---`);
            // Use first test case
            const input = q.testCases[0]?.input;
            if (!input) {
                console.log("No test cases found, skipping.");
                continue;
            }

            for (const lang of LANGUAGES) {
                const code = await generateDummyCode(q, lang);
                if (!code) {
                    console.log(`[${lang}] No config found`);
                    continue;
                }

                try {
                    const result = await executeCode(code, lang, input, q.slug);
                    if (result.status === 'error' || (result.error && result.error.includes('Runtime Error')) || result.error) {
                        // We check result.error mostly. Note: logic errors are expected.
                        // We care about "Runtime Error" that looks like "IndexError" or syntax error in driver.
                        // Logic error (Wrong Answer) is fine.

                        // Filter "acceptable" errors? No, any stderr usually implies crash in driver parsing or compilation.
                        // Except maybe Java picking up junk? 
                        if (result.error && !result.error.trim()) {
                            // clean
                        } else {
                            console.log(`[${lang}] ❌ FAIL`);
                            // console.log("Code:", code);
                            // console.log("Input:", JSON.stringify(input));
                            console.log("Error:", result.error?.substring(0, 200)); // Limit log
                            failures.push({ slug: q.slug, lang, error: result.error, input });
                        }
                    } else {
                        process.stdout.write(`[${lang}] ✅  `);
                    }
                } catch (e) {
                    console.log(`[${lang}] ❌ EXCEPTION: ${e.message}`);
                    failures.push({ slug: q.slug, lang, error: e.message });
                }
            }
        }

        console.log("\n\n=== SUMMARY ===");
        if (failures.length === 0) {
            console.log("All drivers passed verification!");
        } else {
            console.log(`${failures.length} failures found.`);
            console.log(JSON.stringify(failures, null, 2));
        }

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

run();
