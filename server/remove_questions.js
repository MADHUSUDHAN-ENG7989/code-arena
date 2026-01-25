const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const Question = require('./src/models/Question');

async function removeQuestions() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform';
        console.log('Attempting to connect to:', uri.replace(/:([^:@]+)@/, ':****@')); // Mask password

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000 // Fail faster if cannot connect
        });
        console.log('Connected to MongoDB');

        const result = await Question.deleteMany({});
        console.log(`Deleted ${result.deletedCount} questions`);

        const count = await Question.countDocuments();
        console.log(`Current question count: ${count}`);

        process.exit(0);
    } catch (error) {
        console.error('Error removing questions:', error.message);
        process.exit(1);
    }
}

removeQuestions();
