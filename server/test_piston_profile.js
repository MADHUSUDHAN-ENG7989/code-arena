const axios = require('axios');

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

const pythonCode = `
import time
import sys
import os

start_time = time.time() * 1000

# Simulate work
x = [i for i in range(100000)]
sum(x)

end_time = time.time() * 1000
runtime = end_time - start_time

print(f"METRICS_Runtime: {runtime:.2f} ms")
print(f"METRICS_Memory: {sys.getsizeof(x) / 1024 / 1024:.2f} MB")
`;

const testPistonProfile = async () => {
    try {
        console.log('Sending profiling request to Piston...');
        const response = await axios.post(PISTON_API_URL, {
            language: 'python',
            version: '3.10.0',
            files: [
                {
                    content: pythonCode
                }
            ]
        });

        console.log('Response Output:');
        console.log(response.data.run.stdout);
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testPistonProfile();
