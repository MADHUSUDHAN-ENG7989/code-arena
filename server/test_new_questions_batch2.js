const questions12 = require('./questions_12');
const { runTestCases } = require('./src/services/codeExecutor');
const mongoose = require('mongoose');

// Mock socket service globally as it is used in codeExecutor
jest = { mock: () => { } }; // Fake jest mock
require.cache[require.resolve('./src/services/socketService')] = {
    exports: {
        getIO: () => ({ to: () => ({ emit: () => { } }) })
    }
};

async function verify() {
    console.log(`Starting verification for ${questions12.length} new questions...`);
    const languages = ['javascript', 'python', 'java', 'cpp', 'c'];

    // We don't need DB connection for executeCode/runTestCases in isolation usually, 
    // unless it fetches config from DB. 
    // codeExecutor reads from problemConfig.js (static file) and slug.

    for (const q of questions12) {
        console.log(`\n=== Verifying: ${q.title} (${q.slug}) ===`);
        for (const lang of languages) {
            const starterCode = q.starterCode[lang];
            const testCases = q.testCases; // Run ALL test cases as requested

            try {
                console.log(`   [${lang}] Sending code...`);
                // We expect it to run. It might fail the test (Wrong Answer), but it should NOT be "Runtime Error (Other)" 
                // which usually indicates driver/compile failure.
                // Exception: Runtime Logic Error in provided starter code (unlikely for empty code).
                // "Accepted" or "Wrong Answer" = Driver Good.
                // "Runtime Error (Other)" = Driver Bad (usually).

                const result = await runTestCases(starterCode, lang, testCases, q.slug, 'test-user');

                // result is { passed, total, results: [...] }
                const res0 = result.results[0];
                const status = res0.originalStatus || res0.status; // Use piston status if available

                if (status === 'Accepted' || status === 'Wrong Answer') {
                    // Pass
                    // console.log(`   [${lang}] OK (${status})`);
                } else {
                    console.error(`   [${lang}] FAIL: ${status}`);
                    if (res0.error) console.error(`      Error: ${res0.error.substring(0, 200)}...`);
                }

            } catch (e) {
                console.error(`   [${lang}] CRITICAL ERROR:`, e.message);
            }
        }
    }
}

verify().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
