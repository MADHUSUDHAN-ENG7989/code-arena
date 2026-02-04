
const { runTestCases } = require('./src/services/codeExecutor');
const Question = require('./src/models/Question');
const mongoose = require('mongoose');
require('dotenv').config();

async function verifyAllPython() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform');
        const questions = await Question.find({}).sort({ id: 1 });

        console.log(`Verifying Python for ${questions.length} questions...`);

        let failures = [];
        let passed = 0;

        for (const q of questions) {
            const starterCode = q.starterCode['python'];
            if (!starterCode) {
                console.log(`Skipping Q${q.id} (No python code)`);
                continue;
            }

            // We only run the first test case to verify infrastructure execution
            // We are looking for Runtime Errors (AttributeError, NameError), not logic correctness of the empty starter code
            // Actually starter code usually returns None or default, so logic might fail, but "status" should be "Accepted" or "Wrong Answer", NOT "Runtime Error"

            // To save time, just run 1 case
            const testCasesSubset = q.testCases.slice(0, 1);

            try {
                const result = await runTestCases(starterCode, 'python', testCasesSubset, q.slug, null);

                // Check if any result has status "Runtime Error" or "Error"
                const hasRuntimeError = result.results.some(r => r.originalStatus && r.originalStatus.description && r.originalStatus.description.toLowerCase().includes('error'));
                const hasPistonError = result.results.some(r => r.error);

                if (hasRuntimeError || hasPistonError) {
                    process.stdout.write('F');
                    failures.push({
                        id: q.id,
                        title: q.title,
                        error: result.results[0]?.error || result.results[0]?.originalStatus?.description || "Unknown Error"
                    });
                } else {
                    process.stdout.write('.');
                    passed++;
                }
            } catch (e) {
                process.stdout.write('E');
                failures.push({ id: q.id, title: q.title, error: e.message });
            }
        }

        console.log(`\n\n--- RESULTS ---`);
        console.log(`Total: ${questions.length}`);
        console.log(`Passed Infrastructure: ${passed}`);
        console.log(`Failed: ${failures.length}`);

        if (failures.length > 0) {
            console.log("\nFailures Details:");
            failures.forEach(f => {
                console.log(`[Q${f.id}] ${f.title}: ${f.error}`);
            });
        } else {
            console.log("\n✅ ALL QUESTIONS PASSED PYTHON INFRASTRUCTURE CHECKS");
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

verifyAllPython();
