require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function restoreMadhu() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform');

        const existing = await User.findOne({ rollNumber: 'madhu' });
        if (existing) {
            console.log('User madhu already exists.');
            process.exit(0);
        }

        await User.create({
            rollNumber: 'madhu',
            password: 'madhu',
            name: 'Madhu',
            email: 'madhu@college.edu',
            isAdmin: false,
            isFirstLogin: true,
        });

        console.log('User madhu restored successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error restoring user:', error);
        process.exit(1);
    }
}

restoreMadhu();
