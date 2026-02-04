const express = require('express');
const DailyChallenge = require('../models/DailyChallenge');
const User = require('../models/User');
const Submission = require('../models/Submission');
const { authMiddleware } = require('../middleware/auth');
const Question = require('../models/Question');

const router = express.Router();

// Get today's challenge
router.get('/daily', authMiddleware, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let challenge = await DailyChallenge.findOne({ date: today }).populate('questionId');

        if (!challenge) {
            // Find a random question
            const count = await Question.countDocuments();
            if (count > 0) {
                const random = Math.floor(Math.random() * count);
                const randomQuestion = await Question.findOne().skip(random);

                if (randomQuestion) {
                    challenge = new DailyChallenge({
                        questionId: randomQuestion._id,
                        date: today
                    });
                    await challenge.save();
                    challenge = await DailyChallenge.findById(challenge._id).populate('questionId');
                }
            }
        }

        if (!challenge) {
            return res.json({ message: 'No challenge for today' });
        }

        const user = await User.findById(req.userId);

        // Ensure questionId is populated and not null
        if (!challenge.questionId) {
            // If the question was deleted but challenge exists, we should probably delete this invalid challenge
            // await DailyChallenge.findByIdAndDelete(challenge._id); // Optional: Self-healing
            return res.json({ message: 'Challenge question not found' });
        }

        const isSolved = user?.solvedQuestions.includes(challenge.questionId._id) || false;

        res.json({
            challenge,
            isSolved,
        });
    } catch (error) {
        console.error('Get daily challenge error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

const redisClient = require('../config/redisClient');

// Get weekly leaderboard
router.get('/leaderboard', authMiddleware, async (req, res) => {
    try {
        const { timeframe } = req.query; // 'weekly' or 'all_time'
        const cacheKey = `leaderboard:${timeframe || 'weekly'}`;

        // Try to get from Redis cache
        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                return res.json(JSON.parse(cachedData));
            }
        } catch (err) {
            console.error('[REDIS] Cache read error:', err);
        }

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Get all users with their scores
        const users = await User.find({ isAdmin: false })
            .select('rollNumber name score solvedQuestions')
            .sort({ score: -1 })
            .limit(100);

        // Count accepted submissions in the last week
        const leaderboard = await Promise.all(
            users.map(async (user) => {
                const weeklyAccepted = await Submission.countDocuments({
                    userId: user._id,
                    verdict: 'Accepted',
                    submittedAt: { $gte: oneWeekAgo },
                });

                return {
                    rollNumber: user.rollNumber,
                    name: user.name,
                    totalScore: user.score,
                    totalSolved: user.solvedQuestions.length,
                    weeklySolved: weeklyAccepted,
                };
            })
        );

        // Sort by weekly solved, then by total score
        leaderboard.sort((a, b) => {
            if (timeframe === 'all_time') {
                if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
                return b.totalSolved - a.totalSolved;
            } else {
                // Default: Weekly
                if (b.weeklySolved !== a.weeklySolved) {
                    return b.weeklySolved - a.weeklySolved;
                }
                return b.totalScore - a.totalScore;
            }
        });

        // Add rank
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            rank: index + 1,
            ...entry,
        }));

        // Cache the result for 60 seconds
        try {
            await redisClient.setEx(cacheKey, 60, JSON.stringify(rankedLeaderboard));
        } catch (err) {
            console.error('[REDIS] Cache write error:', err);
        }

        res.json(rankedLeaderboard);
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
