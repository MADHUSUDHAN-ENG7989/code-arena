require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./src/config/database');
const { generateStudyPlan } = require('./src/services/studyPlanService');
const User = require('./src/models/User');

async function testAgent() {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        
        console.log('Fetching a user to test...');
        let user = await User.findOne({ rollNumber: 'uday' });
        if (!user) {
            user = await User.findOne({});
        }
        
        if (!user) {
            console.log('No user found in database. Creating a temporary test user...');
            user = await User.create({
                rollNumber: 'test_user_agent',
                password: 'password123',
                name: 'Test Agent Student',
                email: 'test_agent@college.edu',
                isAdmin: false,
                isFirstLogin: false
            });
        }
        
        console.log(`Testing Study Plan Agent with User ID: ${user._id} (${user.name})...`);
        const studyPlan = await generateStudyPlan(user._id);
        
        console.log('\n--- AGENT RESULT ---');
        console.log('Status:', studyPlan.status);
        console.log('Weak Topics:', studyPlan.weakTopics);
        console.log('Motivation narrative:\n', studyPlan.motivation);
        console.log('\nYouTube Resources (take U forward only):');
        studyPlan.resources.forEach((res, i) => {
            console.log(` ${i + 1}. Title: ${res.title}`);
            console.log(`    URL: ${res.url}`);
            console.log(`    Thumbnail: ${res.thumbnail}`);
            console.log(`    Description: ${res.description.substring(0, 100)}...`);
        });
        
        console.log('\nRecommended Practice Questions:');
        studyPlan.recommendedQuestions.forEach((q, i) => {
            console.log(` ${i + 1}. [${q.difficulty}] ${q.title} (${q.topic}) - ${q.points} pts`);
        });
        console.log('--------------------\n');
        
    } catch (err) {
        console.error('Test failed with error:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
}

testAgent();
