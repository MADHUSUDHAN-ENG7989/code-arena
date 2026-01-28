const https = require('https');

// Test Uday Login
const loginDataCorrect = JSON.stringify({
    rollNumber: 'uday',
    password: 'uday'
});

const options = {
    hostname: 'code-arena-api-5am7.onrender.com',
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginDataCorrect.length
    }
};

console.log('Attempting login with uday / uday ...');

const req = https.request(options, (res) => {
    console.log('Login Status Code:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Login Response:', data);
    });
});

req.on('error', (e) => {
    console.error('Login Error:', e);
});

req.write(loginDataCorrect);
req.end();
