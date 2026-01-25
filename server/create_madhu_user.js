require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const createMadhu = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const existingUser = await User.findOne({ rollNumber: 'madhu' });
        if (existingUser) {
            console.log('User "madhu" already exists.');
        } else {
            const newUser = await User.create({
                rollNumber: 'madhu',
                password: 'madhu',
                name: 'Madhu Student',
                email: 'madhu@example.com',
                isAdmin: false,
                isFirstLogin: true
            });
            console.log('User "madhu" created successfully:', newUser.rollNumber);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error creating user:', error);
        process.exit(1);
    }
};

createMadhu();
