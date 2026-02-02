const express = require('express');
const Question = require('../models/Question');
const User = require('../models/User');
const Submission = require('../models/Submission');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all questions
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { topic, difficulty, search } = req.query;
        const filter = {};

        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }

        if (topic) {
            filter.topic = topic;
        }

        if (difficulty) {
            filter.difficulty = difficulty;
        }

        const questions = await Question.find(filter).select('-testCases');
        const user = await User.findById(req.userId).populate({
            path: 'friends',
            select: 'name solvedQuestions'
        });

        const questionsWithStatus = questions.map((q) => {
            const solvedFriends = user.friends.filter(friend =>
                friend.solvedQuestions.includes(q._id)
            );

            return {
                ...q.toObject(),
                isSolved: user?.solvedQuestions.includes(q._id) || false,
                friendsSolved: {
                    count: solvedFriends.length,
                    names: solvedFriends.slice(0, 3).map(f => f.name)
                }
            };
        });

        res.json(questionsWithStatus);
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single question
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Fetch user and populate friends (only necessary fields)
        const user = await User.findById(req.userId).populate({
            path: 'friends',
            select: 'name solvedQuestions'
        });

        // Return question with only visible test cases
        const visibleTestCases = question.testCases.filter((tc) => !tc.isHidden);

        // 1. Find ALL users who have solved this question
        // We only need a few fields: _id, name. And we limit to e.g., 20 just to be safe, 
        // though for "Total Count" we need the full count.
        const totalSolversCount = await User.countDocuments({
            solvedQuestions: question._id
        });

        // 2. Fetch a small batch of solvers to populate avatars (Friends first, then others)
        // We can do this efficiently by fetching friends from the already populated list,
        // and then fetching a few 'others' if needed.

        const friendIds = user.friends.map(f => f._id.toString());

        // Identify friends who solved it
        const solvedFriends = user.friends.filter(friend =>
            friend.solvedQuestions.includes(question._id)
        );

        // Identify others who solved it (exclude current user and friends)
        // We only need enough to fill the 3 slots, but let's fetch a few more to be safe.
        // optimization: if solvedFriends.length >= 3, we don't strictly *need* others for avatars, 
        // but we might want them for the "and X others" text if we want to list non-friends? 
        // Actually the prompt says "show friends and then ... rest users ... at most 3 avatars".

        let solvedOthers = [];
        if (solvedFriends.length < 3) {
            const needed = 3 - solvedFriends.length;
            solvedOthers = await User.find({
                solvedQuestions: question._id,
                _id: { $nin: [...friendIds, user._id] } // Exclude friends and self
            }).select('name').limit(needed);
        }

        // Fetch recent solvers for the ticker
        // "Live" comments dissolve effect needs a list of people and when they solved it.
        const recentSubmissions = await Submission.find({
            questionId: question._id,
            verdict: 'Accepted'
        })
            .sort({ submittedAt: -1 })
            .limit(30)
            .populate('userId', 'name');

        const recentSolvers = recentSubmissions.map(sub => ({
            name: sub.userId ? sub.userId.name : 'Unknown User',
            time: sub.submittedAt
        }));

        const friendsSolved = {
            count: totalSolversCount, // Total users solved (including self? maybe exclude self for "others" text context)
            friendsCount: solvedFriends.length,
            // Combine for avatars: friends first, then others
            names: [...solvedFriends.map(f => f.name), ...solvedOthers.map(u => u.name)].slice(0, 3),
            firstFriendName: solvedFriends.length > 0 ? solvedFriends[0].name : null,
            recentSolvers // Pass the list for the ticker
        };

        res.json({
            ...question.toObject(),
            testCases: visibleTestCases,
            isSolved: user?.solvedQuestions.includes(question._id) || false,
            friendsSolved
        });
    } catch (error) {
        console.error('Get question error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all topics with progress
router.get('/meta/topics', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const topics = await Question.distinct('topic');

        const topicsWithProgress = await Promise.all(
            topics.map(async (topic) => {
                const totalQuestions = await Question.countDocuments({ topic });
                const solvedCount = await Question.countDocuments({
                    topic,
                    _id: { $in: user?.solvedQuestions || [] },
                });

                return {
                    name: topic,
                    totalQuestions,
                    solvedQuestions: solvedCount,
                    progress: totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0,
                };
            })
        );

        res.json(topicsWithProgress);
    } catch (error) {
        console.error('Get topics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
