const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    rollNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isFirstLogin: {
        type: Boolean,
        default: true,
    },
    solvedQuestions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
    }],
    submissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
    }],
    score: {
        type: Number,
        default: 0,
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    friendRequests: [{
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
        createdAt: {
            type: Date,
            default: Date.now,
        }
    }],
    activeDays: [{
        type: String, // Format: YYYY-MM-DD
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
