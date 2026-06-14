const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { generateStudyPlan } = require('../services/studyPlanService');

const router = express.Router();

// GET study plan for the logged-in student
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log(`[API] Fetching study plan for user: ${req.userId}`);
        const plan = await generateStudyPlan(req.userId);
        res.json(plan);
    } catch (error) {
        console.error('Study plan generation error:', error);
        res.status(500).json({ message: 'Server error generating study plan' });
    }
});

module.exports = router;
