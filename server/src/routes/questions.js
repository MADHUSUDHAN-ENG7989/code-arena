const express = require('express');
const Question = require('../models/Question');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all questions
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { topic, difficulty } = req.query;
        const filter = {};

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

        // Calculate friends who solved this
        const solvedFriends = user.friends.filter(friend =>
            friend.solvedQuestions.includes(question._id)
        );

        const friendsSolved = {
            count: solvedFriends.length,
            names: solvedFriends.slice(0, 3).map(f => f.name) // Return top 3 names
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
