
const mongoose = require('mongoose');
const { runTestCases } = require('./src/services/codeExecutor');
const Question = require('./src/models/Question');
require('dotenv').config();

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'c'];

async function verifyAll() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform');

        console.log('Fetching questions...');
        const questions = await Question.find({}).sort({ id: 1 });
        console.log(`Found ${questions.length} questions.`);

        const stats = {
            total: 0,
            success: 0,
            infra_failed: 0,
            lang_stats: {}
        };

        for (const lang of LANGUAGES) {
            stats.lang_stats[lang] = { tested: 0, infra_passed: 0 };
        }

        // Limit concurrency or run sequentially to avoid overwhelming Piston?
        // Sequential is safer for verification.
        for (const q of questions) {
            console.log(`\n--- Verifying Q${q.id}: ${q.title} ---`);

            for (const lang of LANGUAGES) {
                const starterCode = q.starterCode[lang];
                if (!starterCode) {
                    console.error(`MISSING STARTER CODE for ${lang} in Q${q.id}`);
                    continue;
                }

                process.stdout.write(`Testing ${lang}... `);

                try {
                    // We catch internal errors too
                    // Pass userId=null to skip socket emit
                    const result = await runTestCases(starterCode, lang, q.testCases, q.slug, null);

                    // result has { passed, total, results: [...] }
                    // Check if ANY result indicates infrastructure failure
                    const infrastructureFailure = result.results.some(r => r.originalStatus === 'error');

                    if (infrastructureFailure) {
                        console.log('❌ INFRA FAIL');
                        // console.log(result.results);
                    } else {
                        console.log('✅ Runs (Logic ' + result.passed + '/' + result.total + ')');
                        stats.success++;
                        stats.lang_stats[lang].infra_passed++;
                    }
                    stats.total++;
                    stats.lang_stats[lang].tested++;

                } catch (err) {
                    console.log(`❌ EXCEPTION: ${err.message}`);
                    stats.infra_failed++;
                }
            }
        }

        console.log('\n\n--- SUMMARY ---');
        console.log(`Total Combinations Tested: ${stats.total}`);
        console.log(`Infrastructure Passed: ${stats.success}`);
        console.log(`Infrastructure Failed: ${stats.infra_failed}`);
        console.table(stats.lang_stats);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

verifyAll();
