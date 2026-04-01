require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function seedDemoUsers() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-platform';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for demo seeding');

        // Define demo users
        const demoUsers = [
            {
                rollNumber: 'demo_admin',
                password: 'admin123',
                name: 'Demo Admin',
                email: 'admin_demo@college.edu',
                isAdmin: true,
                isFirstLogin: false,
            },
            {
                rollNumber: 'demo_student',
                password: 'student123',
                name: 'Demo Student',
                email: 'student_demo@college.edu',
                isAdmin: false,
                isFirstLogin: false,
            }
        ];

        for (const userData of demoUsers) {
            // Find if user already exists
            const existingUser = await User.findOne({ rollNumber: userData.rollNumber });
            
            if (existingUser) {
                console.log(`User ${userData.rollNumber} already exists. Updating...`);
                // Update existing user (important for password hashing if it changed)
                // Note: user.save() will trigger the pre-save hook for password hashing
                existingUser.password = userData.password;
                existingUser.name = userData.name;
                existingUser.email = userData.email;
                existingUser.isAdmin = userData.isAdmin;
                existingUser.isFirstLogin = userData.isFirstLogin;
                await existingUser.save();
                console.log(`✓ Updated ${userData.rollNumber}`);
            } else {
                console.log(`Creating new user: ${userData.rollNumber}`);
                await User.create(userData);
                console.log(`✓ Created ${userData.rollNumber}`);
            }
        }

        console.log('\n=== Demo Users Seeded Successfully ===');
        console.log('Admin: demo_admin / admin123');
        console.log('Student: demo_student / student123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding demo users:', error);
        process.exit(1);
    }
}

seedDemoUsers();
