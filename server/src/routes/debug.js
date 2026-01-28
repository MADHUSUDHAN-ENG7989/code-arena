const express = require('express');
const User = require('../models/User');
const router = express.Router();
const questionsData = require('../../new_questions');
const questions20 = require('../../questions_20');
const questions12 = require('../../questions_12');
const Question = require('../models/Question');
const mongoose = require('mongoose');

// PUBLIC DEBUG ROUTE - Check User Count
router.get('/db-status', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const questionCount = await Question.countDocuments();
        const users = await User.find({}, 'rollNumber name isAdmin isFirstLogin'); // List users (publicly visible for debug only)

        res.json({
            status: 'ok',
            database: mongoose.connection.name,
            host: mongoose.connection.host,
            counts: {
                users: userCount,
                questions: questionCount
            },
            users: users,
            message: userCount === 0 ? 'NO USERS FOUND. DB NEEDS SEEDING.' : 'Users exist.'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUBLIC SEED TRIGGER (Protected by secret query param)
router.post('/seed-force', async (req, res) => {
    const secret = req.query.secret;
    if (secret !== 'force-seed-prod-123') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        // Run Seed Logic
        // We replicate critical seed logic here or require the seed function if refactored.
        // For safety, let's just create the admin user if missing.

        const existingAdmin = await User.findOne({ rollNumber: 'ADMIN001' });
        let msg = '';

        if (!existingAdmin) {
            await User.create({
                rollNumber: 'ADMIN001',
                password: 'admin123',
                name: 'Admin User',
                email: 'admin@college.edu',
                isAdmin: true,
                isFirstLogin: false,
            });
            msg += 'Created Admin. ';
        } else {
            msg += 'Admin already exists. ';
        }

        // Also create sample student 'uday' if missing
        const uday = await User.findOne({ rollNumber: 'uday' });
        if (!uday) {
            await User.create({
                rollNumber: 'uday',
                password: 'uday',
                name: 'Uday',
                email: 'uday@college.edu',
                isAdmin: false,
                isFirstLogin: true,
            });
            msg += 'Created Uday. ';
        }

        res.json({ message: 'Seed run attempt completed.', details: msg });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
