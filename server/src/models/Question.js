const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    constraints: [{
        type: String,
    }],
    examples: [{
        input: String,
        output: String,
        explanation: String,
    }],
    testCases: [{
        input: String,
        output: String,
        isHidden: Boolean,
    }],
    starterCode: {
        type: Object,
        default: {},
    },
    hints: [{
        type: String,
    }],
    acceptanceRate: {
        type: Number,
        default: 0,
    },
    submissions: {
        type: Number,
        default: 0,
    },
    solvedBy: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
