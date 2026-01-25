const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./src/models/User'); // We need to mock a user or log in to get a token if required, but let's try hitting it directly or checking if we can get a token.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function testQuestionsExpoint() {
    try {
        // Authenticate first (simulate login or create token)
        // Since we can't easily generate a signed token without the secret and hashing logic matching exactly, 
        // we might need to rely on an existing user in DB and the login route.
        // Assuming 'uday' user exists from seed.

        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            rollNumber: 'uday',
            password: 'uday'
        });

        const token = loginRes.data.token;
        console.log('Got token:', token ? 'Yes' : 'No');

        const questionsRes = await axios.get('http://localhost:5000/api/questions', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Questions Status:', questionsRes.status);
        console.log('Questions Count:', questionsRes.data.length);
        if (questionsRes.data.length > 0) {
            console.log('First Question Title:', questionsRes.data[0].title);
        }

    } catch (error) {
        console.error('API Test Error:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testQuestionsExpoint();
