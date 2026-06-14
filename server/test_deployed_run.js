const axios = require('axios');

async function main() {
    try {
        const baseUrl = 'https://code-arena-api-5am7.onrender.com';
        
        console.log('Logging in as demo_student...');
        const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
            rollNumber: 'demo_student',
            password: 'student123'
        });
        
        const token = loginResponse.data.token;
        console.log('Login successful. Token:', token.substring(0, 15) + '...');

        // Get the questions list to find Two Sum's ID
        console.log('Fetching questions from deployed API...');
        const questionsResponse = await axios.get(`${baseUrl}/api/questions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const twoSum = questionsResponse.data.find(q => q.slug === 'two-sum');
        if (!twoSum) {
            console.log('Two Sum question not found in deployed API. Questions:', questionsResponse.data.map(q => q.title));
            process.exit(0);
        }
        console.log('Found Two Sum. ID:', twoSum._id);

        // Correct Two Sum Python solution
        const code = `
class Solution:
    def two_sum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []
`;

        console.log('Triggering code execution on deployed backend...');
        const runResponse = await axios.post(`${baseUrl}/api/submissions/run`, {
            code,
            language: 'python',
            questionId: twoSum._id
        }, {
            headers: {
                'Cookie': `token=${token}`,
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('\n--- Execution Response ---');
        console.log(JSON.stringify(runResponse.data, null, 2));
        
        process.exit(0);
    } catch (e) {
        console.error('Error testing deployed API:', e.message);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', JSON.stringify(e.response.data));
        }
        process.exit(1);
    }
}
main();
