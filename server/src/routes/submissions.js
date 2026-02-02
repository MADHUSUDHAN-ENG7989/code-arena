const express = require('express');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { runTestCases } = require('../services/codeExecutor');
const { analyzeCode } = require('../services/aiAnalysis');

const router = express.Router();

// Run code (without submission)
router.post('/run', authMiddleware, async (req, res) => {
    try {
        console.log('[API] Run request received');
        const { code, language, questionId } = req.body;
        console.log('[API] Payload:', { language, questionId, codeLength: code?.length });

        if (!code || !language || !questionId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Run only visible test cases
        console.log(`[RUN] Question ${questionId}, Language: ${language}`);
        const visibleTestCases = question.testCases.filter((tc) => !tc.isHidden);
        console.log(`[RUN] Visible Test Cases: ${visibleTestCases.length}`);

        const testCases = visibleTestCases.map((tc) => ({
            input: tc.input,
            output: tc.output,
        }));

        const result = await runTestCases(code, language, testCases, question.slug, req.userId);

        res.json(result);
    } catch (error) {
        console.error('Run code error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Submit code
router.post('/submit', authMiddleware, async (req, res) => {
    try {
        const { code, language, questionId } = req.body;

        if (!code || !language || !questionId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Run all test cases (including hidden ones)
        console.log(`[SUBMIT] Question ${questionId}, Language: ${language}`);
        console.log(`[SUBMIT] Total Test Cases in DB: ${question.testCases ? question.testCases.length : 'undefined'}`);

        const testCases = question.testCases.map((tc) => ({
            input: tc.input,
            output: tc.output,
        }));
        console.log(`[SUBMIT] Mapped Test Cases: ${testCases.length}`);

        const result = await runTestCases(code, language, testCases, question.slug, req.userId);

        // Determine verdict
        let verdict = 'Wrong Answer';

        if (result.passed === result.total) {
            verdict = 'Accepted';
        } else {
            // Check for other errors
            const hasError = result.results.some(r => r.error || r.status !== 'Accepted');
            if (hasError) {
                const firstError = result.results.find(r => r.status !== 'Accepted');
                if (firstError?.status === 'Compilation Error') {
                    verdict = 'Compilation Error';
                } else if (firstError?.status === 'Time Limit Exceeded') {
                    verdict = 'Time Limit Exceeded';
                } else if (firstError?.status && firstError.status.includes('Runtime Error')) {
                    verdict = 'Runtime Error';
                }
            }
        }

        // Calculate average runtime and memory
        const validResults = result.results.filter(r => r.time && r.memory);
        const avgRuntime = validResults.length > 0
            ? validResults.reduce((sum, r) => sum + parseFloat(r.time || '0'), 0) / validResults.length
            : undefined;
        const avgMemory = validResults.length > 0
            ? validResults.reduce((sum, r) => sum + (r.memory || 0), 0) / validResults.length
            : undefined;

        // Create or Update submission (Upsert) - User requested to replace old code

        // Create or Update submission (Upsert) - User requested to replace old code
        // IF MODE IS 'ARENA', SKIP DB SAVE
        if (req.body.mode === 'arena') {
            return res.json({
                submission: {
                    verdict,
                    passedTestCases: result.passed,
                    totalTestCases: result.total,
                    runtime: avgRuntime,
                    memory: avgMemory,
                    language,
                    code, // Return code so frontend has reference if needed
                },
                result,
            });
        }

        const submission = await Submission.findOneAndUpdate(
            { userId: req.userId, questionId },
            {
                code,
                language,
                verdict,
                runtime: avgRuntime,
                memory: avgMemory,
                passedTestCases: result.passed,
                totalTestCases: result.total,
                submittedAt: Date.now()
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Update question stats
        question.submissions += 1;
        if (verdict === 'Accepted') {
            question.solvedBy += 1;
        }
        question.acceptanceRate = (question.solvedBy / question.submissions) * 100;
        await question.save();

        // Update user if accepted
        const user = await User.findById(req.userId);
        if (user && verdict === 'Accepted') {
            if (!user.solvedQuestions.includes(question._id)) {
                user.solvedQuestions.push(question._id);

                // Award points based on difficulty
                const points = {
                    'Easy': 10,
                    'Medium': 20,
                    'Hard': 30,
                };
                user.score += points[question.difficulty] || 10;

                await user.save();
            }
        }

        res.json({
            submission,
            result,
        });
    } catch (error) {
        console.error('Submit code error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Analyze code complexity using AI
router.post('/analyze', authMiddleware, async (req, res) => {
    try {
        const { code, language, questionId } = req.body;

        if (!code || !language || !questionId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Use title and description for context
        const problemContext = `${question.title}: ${question.description}`;

        const analysis = await analyzeCode(code, language, problemContext);

        res.json(analysis);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ message: 'Server error during analysis' });
    }
});

// Get user's submissions for a question
router.get('/history/:questionId', authMiddleware, async (req, res) => {
    try {
        const submissions = await Submission.find({
            userId: req.userId,
            questionId: req.params.questionId,
        }).sort({ submittedAt: -1 });

        res.json(submissions);
    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all user submissions
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const submissions = await Submission.find({ userId: req.userId })
            .populate('questionId', 'title difficulty topic')
            .sort({ submittedAt: -1 })
            .limit(50);

        res.json(submissions);
    } catch (error) {
        console.error('Get all submissions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
