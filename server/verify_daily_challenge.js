const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function verifyDailyChallenge() {
    try {
        // Authenticate (using uday/uday as in previous tests)
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            rollNumber: 'uday',
            password: 'uday'
        });
        const token = loginRes.data.token;

        const res = await axios.get('http://localhost:5000/api/challenges/daily', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Daily Challenge Status:', res.status);
        console.log('Challenge Title:', res.data.challenge?.questionId?.title || 'No Title');

        if (res.status === 200 && res.data.challenge?.questionId) {
            console.log('✅ Daily Challenge Endpoint Verified');
        } else {
            console.error('❌ Daily Challenge Endpoint Failed');
        }

    } catch (error) {
        console.error('API Error:', error.response?.status, error.response?.data || error.message);
    }
}

verifyDailyChallenge();
