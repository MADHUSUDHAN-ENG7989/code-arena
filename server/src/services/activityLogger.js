const ActivityLog = require('../models/ActivityLog');

// Helper function to extract IP address from request
const getIpAddress = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        'unknown';
};

// Helper function to extract user agent
const getUserAgent = (req) => {
    return req.headers['user-agent'] || 'unknown';
};

// Log user login attempts
const logLogin = async (userId, userName, rollNumber, success, req) => {
    try {
        await ActivityLog.create({
            userId,
            userName,
            rollNumber,
            activityType: 'LOGIN',
            details: {
                success,
                userAgent: getUserAgent(req)
            },
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req)
        });
    } catch (error) {
        console.error('Error logging login activity:', error);
        // Don't throw - logging failures shouldn't break the main flow
    }
};

// Log code run events
const logCodeRun = async (userId, userName, rollNumber, questionId, questionTitle, language, result, req) => {
    try {
        await ActivityLog.create({
            userId,
            userName,
            rollNumber,
            activityType: 'CODE_RUN',
            details: {
                questionId: questionId.toString(),
                questionTitle,
                language,
                passed: result.passed,
                total: result.total,
                success: result.passed === result.total
            },
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req)
        });
    } catch (error) {
        console.error('Error logging code run activity:', error);
    }
};

// Log code submission events
const logCodeSubmit = async (userId, userName, rollNumber, questionId, questionTitle, language, verdict, result, req) => {
    try {
        await ActivityLog.create({
            userId,
            userName,
            rollNumber,
            activityType: 'CODE_SUBMIT',
            details: {
                questionId: questionId.toString(),
                questionTitle,
                language,
                verdict,
                passed: result.passed,
                total: result.total,
                accepted: verdict === 'Accepted'
            },
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req)
        });
    } catch (error) {
        console.error('Error logging code submit activity:', error);
    }
};

module.exports = {
    logLogin,
    logCodeRun,
    logCodeSubmit,
    getIpAddress,
    getUserAgent
};
