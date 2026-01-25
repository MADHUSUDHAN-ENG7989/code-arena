const axios = require('axios');

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

const testPiston = async () => {
    try {
        console.log('Sending request to Piston...');
        const response = await axios.post(PISTON_API_URL, {
            language: 'javascript',
            version: '18.15.0',
            files: [
                {
                    content: 'console.log("Hello Piston");'
                }
            ]
        });

        console.log('Response received:');
        console.dir(response.data, { depth: null });
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
};

testPiston();
