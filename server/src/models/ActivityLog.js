const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    userName: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true,
        index: true
    },
    activityType: {
        type: String,
        enum: ['LOGIN', 'CODE_RUN', 'CODE_SUBMIT'],
        required: true,
        index: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        required: true
        // For LOGIN: { success: boolean, userAgent: string }
        // For CODE_RUN: { questionId, questionTitle, language, passed, total }
        // For CODE_SUBMIT: { questionId, questionTitle, language, verdict, passed, total }
    },
    ipAddress: {
        type: String,
        default: 'unknown'
    },
    userAgent: {
        type: String,
        default: 'unknown'
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
        // TTL index: automatically delete documents after 6 days (518400 seconds)
        expires: 518400
    }
});

// Index for efficient querying by date range
activityLogSchema.index({ timestamp: -1 });

// Compound index for filtering by type and date
activityLogSchema.index({ activityType: 1, timestamp: -1 });

// Compound index for user-specific queries
activityLogSchema.index({ userId: 1, timestamp: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
