const express = require('express');
const User = require('../models/User');
const Question = require('../models/Question');
const DailyChallenge = require('../models/DailyChallenge');
const ActivityLog = require('../models/ActivityLog');
const Submission = require('../models/Submission');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require admin access
router.use(authMiddleware);
router.use(adminMiddleware);

// Add new student
router.post('/students', async (req, res) => {
    try {
        const { rollNumber, name, email, password } = req.body;

        if (!rollNumber || !name || !password) {
            return res.status(400).json({ message: 'Roll number, name, and password are required' });
        }

        const existingUser = await User.findOne({ rollNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'Student with this roll number already exists' });
        }

        const user = await User.create({
            rollNumber,
            name,
            email,
            password,
            isAdmin: false,
            isFirstLogin: true,
        });

        res.status(201).json({
            message: 'Student added successfully',
            user: {
                id: user._id,
                rollNumber: user.rollNumber,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all students
router.get('/students', async (req, res) => {
    try {
        const students = await User.find({ isAdmin: false })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(students);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update student
router.put('/students/:id', async (req, res) => {
    try {
        const { name, email } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (name) user.name = name;
        if (email !== undefined) user.email = email;

        await user.save();

        res.json({
            message: 'Student updated successfully',
            user: {
                id: user._id,
                rollNumber: user.rollNumber,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete student
router.delete('/students/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new question
router.post('/questions', async (req, res) => {
    try {
        const {
            title,
            slug,
            description,
            difficulty,
            topic,
            constraints,
            examples,
            testCases,
            starterCode,
            hints,
        } = req.body;

        if (!title || !slug || !description || !difficulty || !topic) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingQuestion = await Question.findOne({ slug });
        if (existingQuestion) {
            return res.status(400).json({ message: 'Question with this slug already exists' });
        }

        const question = await Question.create({
            title,
            slug,
            description,
            difficulty,
            topic,
            constraints: constraints || [],
            examples: examples || [],
            testCases: testCases || [],
            starterCode: starterCode || new Map(),
            hints: hints || [],
        });

        res.status(201).json({
            message: 'Question added successfully',
            question,
        });
    } catch (error) {
        console.error('Add question error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update question
router.put('/questions/:id', async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({
            message: 'Question updated successfully',
            question,
        });
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete question
router.delete('/questions/:id', async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Set daily challenge
router.post('/daily-challenge', async (req, res) => {
    try {
        const { questionId, date } = req.body;

        if (!questionId) {
            return res.status(400).json({ message: 'Question ID is required' });
        }

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const challengeDate = date ? new Date(date) : new Date();
        challengeDate.setHours(0, 0, 0, 0);

        // Check if challenge already exists for this date
        const existingChallenge = await DailyChallenge.findOne({ date: challengeDate });
        if (existingChallenge) {
            // Update existing challenge
            existingChallenge.questionId = questionId;
            await existingChallenge.save();
            return res.json({
                message: 'Daily challenge updated successfully',
                challenge: existingChallenge,
            });
        }

        // Create new challenge
        const challenge = await DailyChallenge.create({
            date: challengeDate,
            questionId,
        });

        res.status(201).json({
            message: 'Daily challenge set successfully',
            challenge,
        });
    } catch (error) {
        console.error('Set daily challenge error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get activity logs with filtering and pagination
router.get('/logs', async (req, res) => {
    try {
        const {
            activityType,
            userId,
            startDate,
            endDate,
            page = 1,
            limit = 50,
            search
        } = req.query;

        const filter = {};

        // Filter by activity type
        if (activityType) {
            filter.activityType = activityType;
        }

        // Filter by user ID
        if (userId) {
            filter.userId = userId;
        }

        // Search by user name or roll number
        if (search) {
            filter.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { rollNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by date range
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) {
                filter.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.timestamp.$lte = new Date(endDate);
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            ActivityLog.find(filter)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            ActivityLog.countDocuments(filter)
        ]);

        res.json({
            logs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get website statistics for admin dashboard
router.get('/stats', async (req, res) => {
    try {
        // Basic counts
        const [
            totalUsers,
            totalQuestions,
            totalSubmissions,
            activeUsers24h,
            todayLogins,
            todayCodeRuns,
            todaySubmissions
        ] = await Promise.all([
            User.countDocuments({ isAdmin: false }),
            Question.countDocuments(),
            Submission.countDocuments(),
            // Active users in last 24 hours (based on login activity)
            ActivityLog.distinct('userId', {
                activityType: 'LOGIN',
                'details.success': true,
                timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }).then(users => users.length),
            // Today's login count
            ActivityLog.countDocuments({
                activityType: 'LOGIN',
                'details.success': true,
                timestamp: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            // Today's code run count
            ActivityLog.countDocuments({
                activityType: 'CODE_RUN',
                timestamp: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            // Today's submission count
            ActivityLog.countDocuments({
                activityType: 'CODE_SUBMIT',
                timestamp: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            })
        ]);

        // Top 5 most active users (based on activity logs in last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const topActiveUsers = await ActivityLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    userName: { $first: '$userName' },
                    rollNumber: { $first: '$rollNumber' },
                    activityCount: { $sum: 1 }
                }
            },
            { $sort: { activityCount: -1 } },
            { $limit: 5 }
        ]);

        // Activity trend for last 7 days
        const activityTrend = await ActivityLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                        type: '$activityType'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);

        // Most attempted questions (last 7 days)
        const topQuestions = await ActivityLog.aggregate([
            {
                $match: {
                    activityType: { $in: ['CODE_RUN', 'CODE_SUBMIT'] },
                    timestamp: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$details.questionId',
                    questionTitle: { $first: '$details.questionTitle' },
                    attempts: { $sum: 1 }
                }
            },
            { $sort: { attempts: -1 } },
            { $limit: 5 }
        ]);

        // Language usage statistics
        const languageStats = await ActivityLog.aggregate([
            {
                $match: {
                    activityType: { $in: ['CODE_RUN', 'CODE_SUBMIT'] },
                    timestamp: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$details.language',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Success rate (accepted submissions vs total submissions in last 7 days)
        const submissionStats = await ActivityLog.aggregate([
            {
                $match: {
                    activityType: 'CODE_SUBMIT',
                    timestamp: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    accepted: {
                        $sum: { $cond: ['$details.accepted', 1, 0] }
                    }
                }
            }
        ]);

        const successRate = submissionStats.length > 0
            ? (submissionStats[0].accepted / submissionStats[0].total * 100).toFixed(2)
            : 0;

        res.json({
            overview: {
                totalUsers,
                totalQuestions,
                totalSubmissions,
                activeUsers24h,
                todayLogins,
                todayCodeRuns,
                todaySubmissions,
                successRate: parseFloat(successRate)
            },
            topActiveUsers,
            activityTrend,
            topQuestions,
            languageStats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
