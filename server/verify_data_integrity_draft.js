const { allQuestions } = require('./add_all_54_final');

function verifyQuestions() {
    let errorCount = 0;
    let warningCount = 0;

    console.log(`Scanning ${allQuestions.length} questions for data integrity...\n`);

    allQuestions.forEach((q, index) => {
        const qNum = index + 1;
        // console.log(`[${qNum}] Checking ${q.title}...`);

        if (!q.testCases || q.testCases.length === 0) {
            console.error(`[ERROR] Question "${q.title}" has NO test cases.`);
            errorCount++;
            return;
        }

        const args = q.starterCode.javascript.match(/function \w+\(([^)]*)\)/)[1].split(',').map(a => a.trim()).filter(a => a);
        // Note: q.starterCode generation in add_all_54_final might differ slightly from static analysis but we have 'input' format to check against 'args' config.
        // Actually, we should check against the 'args' definition in the object if available, but 'allQuestions' from the export only has the final object.
        // Wait, 'add_all_54_final.js' exports 'allQuestions' which contains the objects created by 'createQuestion'.
        // 'createQuestion' puts 'args' into the object? No, it DOES NOT.
        // 'createQuestion' returns { title, slug, ..., testCases, starterCode, hints }. It DOES NOT return 'private' args metadata.
        // This is a problem for verification. I cannot easily verify inputs without knowing the expected types.

        // HOWEVER, I can infer expected types from the 'starterCode' signatures or I can rely on the fact that I have the source code.
        // Better yet, I can modify 'add_all_54_final.js' to export the raw data or 'newQuestions' before processing?
        // OR, I can just parse the 'starterCode.java' or 'starterCode.cpp' to guess types.

        // Let's try to infer from the text in 'add_all_54_final.js' itself? No, that's parsing code.

        // Alternative: The `createQuestion` function uses `args` to generate starter code. 
        // If I modify `createQuestion` in `add_all_54_final.js` to include `meta: { args, returnType }`, I can verify it easily.
        // This is a safe modification.
    });
}
