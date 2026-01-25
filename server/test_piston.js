const axios = require('axios');
(async () => {
    try {
        console.log('Testing Piston API...');
        const res = await axios.post('https://emkc.org/api/v2/piston/execute', {
            language: 'python',
            version: '3.10.0',
            files: [{ content: 'print("Piston Working")' }]
        });
        console.log('Response:', JSON.stringify(res.data));
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) console.error('Data:', e.response.data);
    }
})();
