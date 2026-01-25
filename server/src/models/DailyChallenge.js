const mongoose = require('mongoose');

const dailyChallengeSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true,
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
    },
    participants: {
        type: Number,
        default: 0,
    },
    solvedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
});

const DailyChallenge = mongoose.model('DailyChallenge', dailyChallengeSchema);

module.exports = DailyChallenge;
