const path = require('path');
const fs = require('fs');
require('../server/node_modules/dotenv').config({ path: path.resolve(__dirname, '../server/.env') });

// Enable local mock execution in codeExecutor
process.env.LOCAL_EXECUTION = 'true';

const { executeCode } = require('../server/src/services/codeExecutor');
const { allQuestions } = require('../server/add_all_54_final');

// Local validation will test Javascript, Python, and C++ (since g++ is installed locally)
// Java is skipped locally because JDK is not installed.
const LANGUAGES = ['javascript', 'python', 'cpp'];

// Map return types to dummy values for each language
const DUMMY_VALUES = {
    int: { javascript: '0', python: '0', java: '0', cpp: '0' },
    string: { javascript: '""', python: '""', java: '""', cpp: '""' },
    boolean: { javascript: 'false', python: 'False', java: 'false', cpp: 'false' },
    'int[]': { javascript: '[]', python: '[]', java: 'new int[0]', cpp: 'vector<int>()' },
    'string[]': { javascript: '[]', python: '[]', java: 'new String[0]', cpp: 'vector<string>()' },
    'int[][]': { javascript: '[]', python: '[]', java: 'new int[0][0]', cpp: 'vector<vector<int>>()' },
    'char[][]': { javascript: '[]', python: '[]', java: 'new char[0][0]', cpp: 'vector<vector<char>>()' },
    'void': { javascript: '', python: '', java: '', cpp: '' },
    'ListNode': { javascript: 'null', python: 'None', java: 'null', cpp: 'nullptr' },
    'TreeNode': { javascript: 'null', python: 'None', java: 'null', cpp: 'nullptr' }
};

const EXISTING_10_META = {
    'two-sum': { returnType: 'int[]' },
    'reverse-string': { returnType: 'void' },
    'valid-palindrome': { returnType: 'boolean' },
    'remove-duplicates-from-sorted-array': { returnType: 'int' },
    'valid-anagram': { returnType: 'boolean' },
    'maximum-subarray': { returnType: 'int' },
    'merge-sorted-arrays': { returnType: 'int[]' },
    'move-zeroes': { returnType: 'void' },
    'best-time-to-buy-and-sell-stock': { returnType: 'int' },
    'length-of-last-word': { returnType: 'int' }
};

const getDummyReturn = (lang, retType) => {
    if (!DUMMY_VALUES[retType]) return '0'; // Fallback
    return DUMMY_VALUES[retType][lang] || '0';
};

const generateMockCode = (lang, q) => {
    const meta = q.meta || EXISTING_10_META[q.slug];
    if (!meta) {
        throw new Error(`Metadata not found for question ${q.slug}`);
    }

    let code = q.starterCode[lang];
    if (!code) {
        throw new Error(`Starter code for language ${lang} not found`);
    }
    const retVal = getDummyReturn(lang, meta.returnType);

    if (lang === 'javascript') {
        if (meta.returnType === 'void') return code;
        if (code.includes('// Your code here')) {
            return code.replace('// Your code here', `return ${retVal};`);
        }
        if (code.includes('// your code here')) {
            return code.replace('// your code here', `return ${retVal};`);
        }
        return code.replace(/\}\s*$/, `    return ${retVal};\n}`);
    } else if (lang === 'python') {
        if (code.includes('pass')) {
            return code.replace('pass', `return ${retVal}`);
        }
        return code + `\n        return ${retVal}`;
    } else if (lang === 'java') {
        if (meta.returnType === 'void') return code;
        if (code.includes('// Your code here')) {
            return code.replace('// Your code here', `return ${retVal};`);
        }
        if (code.includes('// your code here')) {
            return code.replace('// your code here', `return ${retVal};`);
        }
        const lastBraceIdx = code.lastIndexOf('}');
        if (lastBraceIdx !== -1) {
            const secondLastBraceIdx = code.lastIndexOf('}', lastBraceIdx - 1);
            if (secondLastBraceIdx !== -1) {
                return code.substring(0, secondLastBraceIdx) + `    return ${retVal};\n    ` + code.substring(secondLastBraceIdx);
            }
        }
        return code.replace(/\}\s*$/, `    return ${retVal};\n}`);
    } else if (lang === 'cpp') {
        if (meta.returnType === 'void') return code;
        if (code.includes('// Your code here')) {
            return code.replace('// Your code here', `return ${retVal};`);
        }
        if (code.includes('// your code here')) {
            return code.replace('// your code here', `return ${retVal};`);
        }
        const lastBraceIdx = code.lastIndexOf('}');
        if (lastBraceIdx !== -1) {
            const secondLastBraceIdx = code.lastIndexOf('}', lastBraceIdx - 1);
            if (secondLastBraceIdx !== -1) {
                return code.substring(0, secondLastBraceIdx) + `    return ${retVal};\n    ` + code.substring(secondLastBraceIdx);
            }
        }
        return code.replace(/\}\s*;\s*$/, `    return ${retVal};\n};`).replace(/\}\s*$/, `    return ${retVal};\n}`);
    }
    return code;
};

async function runMassVerify() {
    console.log(`Starting Local Mass Verification for ${allQuestions.length} questions...`);
    let totalTests = 0;
    let failedTests = 0;
    let crashLog = [];

    for (const q of allQuestions) {
        console.log(`\nVerifying Q${q.slug} [${q.title}]...`);

        for (const lang of LANGUAGES) {
            let mockCode;
            try {
                mockCode = generateMockCode(lang, q);
            } catch (e) {
                console.log(`❌ MOCK GEN FAIL for ${lang}: ${e.message}`);
                failedTests++;
                continue;
            }

            for (let i = 0; i < q.testCases.length; i++) {
                const tc = q.testCases[i];
                process.stdout.write(`  - [${lang}] TC#${i + 1}... `);

                try {
                    const res = await executeCode(mockCode, lang, tc.input, q.slug);
                    totalTests++;

                    if (res.status === 'Compilation Error') {
                        console.log(`❌ COMPILE ERROR`);
                        console.log(res.error || res.output);
                        failedTests++;
                        crashLog.push({ q: q.slug, lang, tc: i, err: 'Compile Error', out: res.error || res.output });
                    } else if (res.status?.includes('Runtime Error')) {
                        console.log(`❌ RUNTIME ERROR (${res.status})`);
                        console.log(res.error || res.output);
                        failedTests++;
                        crashLog.push({ q: q.slug, lang, tc: i, err: res.status, out: res.error || res.output });
                    } else if (res.status === 'error') {
                        console.log(`❌ INFRA ERROR`);
                        console.log(res.error);
                        failedTests++;
                        crashLog.push({ q: q.slug, lang, tc: i, err: 'Infra Error', out: res.error });
                    } else {
                        console.log(`✅ OK (Status: ${res.status})`);
                    }

                } catch (e) {
                    console.log(`❌ INFRA CRASH`);
                    console.log(e.message);
                    failedTests++;
                    crashLog.push({ q: q.slug, lang, tc: i, err: 'Infra Crash', out: e.message });
                }
            }
        }
    }

    console.log(`\n\n=== VERIFICATION SUMMARY ===`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Failed (Crashes/Compile Errors): ${failedTests}`);

    if (failedTests > 0) {
        console.log("\nFAILURES:");
        crashLog.forEach(f => console.log(`- ${f.q} [${f.lang}] TC#${f.tc}: ${f.err}`));
        process.exit(1);
    } else {
        console.log("ALL CLEARED.");
        process.exit(0);
    }
}

runMassVerify();
