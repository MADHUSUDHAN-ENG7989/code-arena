require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const createUday = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const existingUser = await User.findOne({ rollNumber: 'uday' });
        if (existingUser) {
            console.log('User "uday" already exists.');
        } else {
            const newUser = await User.create({
                rollNumber: 'uday',
                password: 'uday',
                name: 'Uday Student',
                email: 'uday@example.com',
                isAdmin: false,
                isFirstLogin: true
            });
            console.log('User "uday" created successfully:', newUser.rollNumber);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error creating user:', error);
        process.exit(1);
    }
};

createUday();
