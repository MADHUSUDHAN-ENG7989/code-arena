const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const DailyChallenge = require('./src/models/DailyChallenge');
const Question = require('./src/models/Question');

async function fixDailyChallenge() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform';
        console.log('Connecting to:', uri.replace(/:([^:@]+)@/, ':****@'));
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find a valid question
        const question = await Question.findOne();
        if (!question) {
            console.error('No questions found in database! Please seed questions first.');
            process.exit(1);
        }
        console.log(`Selected question for daily challenge: ${question.title} (${question._id})`);

        // Update or create daily challenge
        const challenge = await DailyChallenge.findOneAndUpdate(
            { date: today },
            {
                date: today,
                questionId: question._id,
                // Reset participants/solved if the question changed, essentially invalidating potentially old data for a ghost question
            },
            { upsert: true, new: true }
        );

        console.log('Daily challenge updated:', challenge);

        process.exit(0);
    } catch (error) {
        console.error('Error fixing daily challenge:', error);
        process.exit(1);
    }
}

fixDailyChallenge();
