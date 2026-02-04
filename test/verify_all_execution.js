const { executeCode } = require('../server/src/services/codeExecutor');
const { allQuestions } = require('../server/add_all_54_final');

const LANGUAGES = ['python', 'java', 'cpp'];

// Map return types to dummy values for each language
const DUMMY_VALUES = {
    int: { python: '0', java: '0', cpp: '0' },
    string: { python: '""', java: '""', cpp: '""' },
    boolean: { python: 'False', java: 'false', cpp: 'false' },
    'int[]': { python: '[]', java: 'new int[0]', cpp: 'vector<int>()' },
    'string[]': { python: '[]', java: 'new String[0]', cpp: 'vector<string>()' },
    'int[][]': { python: '[]', java: 'new int[0][0]', cpp: 'vector<vector<int>>()' },
    'char[][]': { python: '[]', java: 'new char[0][0]', cpp: 'vector<vector<char>>()' },
    'void': { python: '', java: '', cpp: '' },
    'ListNode': { python: 'None', java: 'null', cpp: 'nullptr' },
    'TreeNode': { python: 'None', java: 'null', cpp: 'nullptr' }
};

const getDummyReturn = (lang, retType) => {
    if (!DUMMY_VALUES[retType]) return '0'; // Fallback
    return DUMMY_VALUES[retType][lang] || '0';
};

const generateMockCode = (lang, q) => {
    const fn = (lang === 'python')
        ? q.starterCode.python.match(/def (.*?)\(/)[1]
        : q.meta.args.fn; // Fallback, though we should parse signature

    // Actually, simple regex replacement on starterCode is safer
    let code = q.starterCode[lang];
    const retVal = getDummyReturn(lang, q.meta.returnType);

    if (lang === 'python') {
        code = code.replace(/pass/, `return ${retVal}`);
    } else if (lang === 'java') {
        if (q.meta.returnType === 'void') return code; // No return needed
        // Inject return before closing brace of function
        code = code.replace(/\}\s*$/, `    return ${retVal};\n}`);
    } else if (lang === 'cpp') {
        if (q.meta.returnType === 'void') return code;
        code = code.replace(/\}\s*;\s*$/, `    return ${retVal};\n};`);
        // Also handle C++ starter code which sometimes ends with braces differently
        code = code.replace(/\}\s*$/, `    return ${retVal};\n}`);
    }
    return code;
};

async function runMassVerify() {
    console.log(`Starting Mass Verification for ${allQuestions.length} questions...`);
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
            // console.log(`  [${lang}] Code check: ${mockCode.substring(0, 50)}...`);

            for (let i = 0; i < q.testCases.length; i++) {
                const tc = q.testCases[i];
                process.stdout.write(`  - [${lang}] TC#${i + 1}... `);

                try {
                    const res = await executeCode(mockCode, lang, tc.input, q.slug);
                    totalTests++;

                    if (res.status?.id === 6) { // Compilation Error
                        console.log(`❌ COMPILE ERROR`);
                        console.log(res.output);
                        failedTests++;
                        crashLog.push({ q: q.slug, lang, tc: i, err: 'Compile Error', out: res.output });
                    } else if (res.status?.id >= 7 && res.status?.id <= 12) { // Runtime Error
                        console.log(`❌ RUNTIME ERROR (${res.status.description})`);
                        // console.log(res.output);
                        // Some runtime errors are expected if dummy code doesn't handle input (e.g. arrayOutOfBounds empty return)
                        // But we want to ensure *Driver* didn't crash on input parsing.
                        // Input parsing happens BEFORE user code.
                        // If Input Parsing fails, it usually throws Compilation Error (Java) or Runtime Error (Python).
                        // We should inspect output.
                        failedTests++;
                        crashLog.push({ q: q.slug, lang, tc: i, err: res.status.description, out: res.output });
                    } else {
                        // Accepted (3) or Wrong Answer (4) -> BOTH OK.
                        // We expect Wrong Answer because we return dummy values.
                        console.log(`✅ OK (Status: ${res.status?.description || 'Accepted'})`);
                    }

                } catch (e) {
                    console.log(`❌ INFRA CRASH`);
                    console.log(e.message);
                    failedTests++;
                    crashLog.push({ q: q.slug, lang, tc: i, err: 'Infra Crash', out: e.message });
                }

                // Small delay to avoid rate limits
                await new Promise(r => setTimeout(r, 200));
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
