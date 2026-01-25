require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const verifyMadhu = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ rollNumber: 'madhu' });
        if (user) {
            console.log('User found:', user.rollNumber);
            console.log('Stored Password Hash:', user.password);

            // Test comparison
            const isMatch = await bcrypt.compare('madhu', user.password);
            console.log('Password match check ("madhu"):', isMatch);
        } else {
            console.log('User "madhu" not found.');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyMadhu();
