
const PROBLEM_CONFIG = require('./src/configs/problemConfig');
const Question = require('./src/models/Question');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform').then(async () => {
    console.log('Verifying Configs...');
    const questions = await Question.find({});
    const missing = [];
    for (const q of questions) {
        if (!PROBLEM_CONFIG[q.slug]) {
            missing.push(q.slug);
        }
    }
    if (missing.length > 0) {
        console.error('❌ Missing configs:', missing);
    } else {
        console.log(`✅ All ${questions.length} questions have valid configurations`);
    }
    process.exit(0);
});
