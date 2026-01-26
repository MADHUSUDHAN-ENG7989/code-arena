const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const Question = require('./src/models/Question');

async function patchTwoSum() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform';
        console.log('Connecting to:', uri.replace(/:([^:@]+)@/, ':****@'));
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const question = await Question.findOne({ slug: 'two-sum' });
        if (!question) {
            console.error('Two Sum question not found!');
            process.exit(1);
        }

        console.log('Found Two Sum question.');

        // Find the specific test case
        const testCaseIndex = question.testCases.findIndex(tc => tc.input === '1 5 9 13 17\n22');

        if (testCaseIndex !== -1) {
            console.log('Found problematic test case at index', testCaseIndex);
            // Modify input: Change 1 5 9 13 17 -> 1 6 9 13 17
            // Target 22. 
            // Old: 5+17=22, 9+13=22.
            // New: 6+17=23, 9+13=22. (Unique solution 9+13 -> indices 2,3)
            question.testCases[testCaseIndex].input = '1 6 9 13 17\n22';

            // Mark modified (Mongoose sometimes needs this for array elements)
            question.markModified('testCases');

            await question.save();
            console.log('Updated test case successfully.');
        } else {
            // Check if already updated
            const alreadyUpdated = question.testCases.findIndex(tc => tc.input === '1 6 9 13 17\n22');
            if (alreadyUpdated !== -1) {
                console.log('Test case appears to be already updated.');
            } else {
                console.warn('Could not find the specific test case to find. It might have been modified or removed.');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error patching Two Sum:', error);
        process.exit(1);
    }
}

patchTwoSum();
