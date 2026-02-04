
const mongoose = require('mongoose');
const Question = require('./src/models/Question');
require('dotenv').config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform');
        const count = await Question.countDocuments();
        console.log(`Total Questions: ${count}`);

        const lastQ = await Question.findOne().sort({ _id: -1 }); // or just find one
        console.log('Sample Question:', lastQ.title);

        if (count === 54) {
            console.log('VERIFICATION PASSED');
        } else {
            console.log('VERIFICATION FAILED: Count mismatch');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
