require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./src/models/Question');

async function hotfixPythonImports() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const slugsToFix = [
            'remove-duplicates-from-sorted-array',
            'maximum-subarray',
            'best-time-to-buy-and-sell-stock'
        ];

        for (const slug of slugsToFix) {
            console.log(`Checking ${slug}...`);
            const question = await Question.findOne({ slug });
            if (!question) {
                console.log('  Question not found.');
                continue;
            }

            let pythonCode = question.starterCode['python'];
            if (pythonCode && !pythonCode.includes('from typing import')) {
                console.log('  Updating Python code...');
                const newCode = `from typing import List\n\n${pythonCode}`;

                // Mongoose Mixed/Object type needs explicit markModified for nested updates if reassigning
                // But replacing the whole object/property might work. 
                // Safest to reassign the whole starterCode object or use markModified
                const updatedStarterCode = { ...question.starterCode };
                updatedStarterCode['python'] = newCode;
                question.starterCode = updatedStarterCode;
                question.markModified('starterCode');

                await question.save();
                console.log('  Saved updated code.');
            } else {
                console.log('  Python code already has imports or is missing.');
            }
        }

        console.log('Hotfix complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error applying hotfix:', error);
        process.exit(1);
    }
}

hotfixPythonImports();
