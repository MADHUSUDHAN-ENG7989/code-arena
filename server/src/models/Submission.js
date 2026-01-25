const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    verdict: {
        type: String,
        enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Pending'],
        default: 'Pending',
    },
    runtime: {
        type: Number,
    },
    memory: {
        type: Number,
    },
    passedTestCases: {
        type: Number,
        default: 0,
    },
    totalTestCases: {
        type: Number,
        required: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
