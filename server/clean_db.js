require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./src/models/Question');
const { allQuestions } = require('./add_all_54_final');

async function clean() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform');
        console.log('Connected to DB');

        const countBefore = await Question.countDocuments();
        console.log(`Total questions before cleanup: ${countBefore}`);

        const validSlugs = allQuestions.map(q => q.slug);
        console.log(`Valid slugs count: ${validSlugs.length}`);

        // Delete questions not in the validSlugs array
        const result = await Question.deleteMany({ slug: { $nin: validSlugs } });
        console.log(`Deleted ${result.deletedCount} extra questions`);

        const countAfter = await Question.countDocuments();
        console.log(`Total questions after cleanup: ${countAfter}`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

clean();
