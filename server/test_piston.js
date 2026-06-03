const axios = require('axios');

async function testPiston() {
    const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';
    
    // Test with Python
    const payload = {
        language: 'python',
        version: '3.10.0',
        files: [
            {
                name: 'test.py', // Try with a name
                content: 'print("Hello from Piston")'
            }
        ],
        stdin: ''
    };

    try {
        console.log('Testing Piston API for Python...');
        const response = await axios.post(PISTON_API_URL, payload);
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
        
        if (response.data.run && response.data.run.code === 0) {
            console.log('✓ Python Test Passed');
        } else {
            console.log('✗ Python Test Failed');
        }
    } catch (error) {
        console.error('✗ Python Test Error:', error.message);
        if (error.response) {
            console.error('Error Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }

    // Test with Javascript
    const payloadJS = {
        language: 'javascript',
        version: '18.15.0',
        files: [
            {
                content: 'console.log("Hello from JS")'
            }
        ],
        stdin: ''
    };

    try {
        console.log('\nTesting Piston API for JavaScript...');
        const response = await axios.post(PISTON_API_URL, payloadJS);
        console.log('Response Status:', response.status);
        
        if (response.data.run && response.data.run.code === 0) {
            console.log('✓ JS Test Passed');
        } else {
            console.log('✗ JS Test Failed');
        }
    } catch (error) {
        console.error('✗ JS Test Error:', error.message);
    }
}

testPiston();
