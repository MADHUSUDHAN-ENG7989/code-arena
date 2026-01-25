require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./src/models/Question');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const q = await Question.findOne({ title: 'Two Sum' });
        console.log('Question Found:', q ? q.title : 'None');
        console.log('Slug:', q ? `"${q.slug}"` : 'N/A');

        if (q) {
            // Test driver generation logic locally
            const { LANGUAGE_IDS } = require('./src/services/codeExecutor');
            console.log('Language ID for java:', LANGUAGE_IDS.java);
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
};
check();
