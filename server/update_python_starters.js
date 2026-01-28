require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./src/models/Question');
const PROBLEM_CONFIG = require('./src/configs/problemConfig');

async function updateAllPythonStarters() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform');
        console.log('Connected to MongoDB\n');

        const questions = await Question.find({});
        console.log(`Found ${questions.length} questions\n`);

        let updated = 0;
        let skipped = 0;
        let noConfig = 0;

        for (const question of questions) {
            console.log(`Processing: ${question.title} (${question.slug})`);

            const config = PROBLEM_CONFIG[question.slug];
            if (!config) {
                console.log('  No config found, skipping...');
                noConfig++;
                continue;
            }

            const currentPython = question.starterCode?.python;
            if (!currentPython) {
                console.log('  No Python starter code, skipping...');
                skipped++;
                continue;
            }

            // Check if already using Solution class with correct method name
            if (currentPython.includes('class Solution:') && currentPython.includes(`def ${config.fn}(`)) {
                console.log('  Already correct format');
                skipped++;
                continue;
            }

            // Extract parameters from current function (handle both snake_case and old Solution class)
            let params = '';

            // Try to match existing def pattern
            const funcMatch = currentPython.match(/def\s+\w+\s*\((?:self,?\s*)?([^)]*)\):/);
            if (funcMatch) {
                params = funcMatch[1].trim();
            } else {
                // Fallback to config args
                params = config.args.map(a => a.name).join(', ');
            }

            // Create new Solution class format with camelCase method name
            const newPython = `class Solution:
    def ${config.fn}(self, ${params}):
        # Your code here
        pass`;

            // Update in database
            await Question.updateOne(
                { _id: question._id },
                { $set: { 'starterCode.python': newPython } }
            );

            console.log(`  ✓ Updated to: def ${config.fn}(self, ${params})`);
            updated++;
        }

        console.log(`\n${'='.repeat(50)}`);
        console.log(`SUMMARY:`);
        console.log(`  Updated: ${updated} questions`);
        console.log(`  Already correct: ${skipped} questions`);
        console.log(`  No config: ${noConfig} questions`);
        console.log(`${'='.repeat(50)}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateAllPythonStarters();
