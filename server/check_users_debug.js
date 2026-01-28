const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform');
        const users = await User.find({}, 'rollNumber name isAdmin isFirstLogin');
        console.log('--- USERS IN DB ---');
        console.table(users.map(u => ({
            rollNumber: u.rollNumber,
            name: u.name,
            isAdmin: u.isAdmin,
            isFirstLogic: u.isFirstLogin
        })));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkUsers();
