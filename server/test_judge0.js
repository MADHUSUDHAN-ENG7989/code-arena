require('dotenv').config();
const axios = require('axios');

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_HOST = 'judge0-ce.p.rapidapi.com';

const isRapidAPI = JUDGE0_API_URL.includes('rapidapi.com');

if (isRapidAPI && !JUDGE0_API_KEY) {
    console.error('❌ JUDGE0_API_KEY is not set in .env file');
    console.log('Get your free key at: https://rapidapi.com/judge0-official/api/judge0-ce');
    process.exit(1);
}

async function testJudge0(langName, langId, code, expectedOutput) {
    try {
        console.log(`\nTesting ${langName} (ID: ${langId})...`);
        
        const source_code = Buffer.from(code).toString('base64');
        
        const headers = {
            'Content-Type': 'application/json',
        };
        if (isRapidAPI) {
            headers['x-rapidapi-key'] = JUDGE0_API_KEY;
            headers['x-rapidapi-host'] = JUDGE0_API_HOST;
        }

        const response = await axios.post(
            `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true&fields=stdout,stderr,status,time,memory,compile_output`,
            {
                language_id: langId,
                source_code,
                stdin: '',
            },
            {
                headers,
                timeout: 30000,
            }
        );

        const data = response.data;
        const stdout = data.stdout ? Buffer.from(data.stdout, 'base64').toString('utf-8').trim() : '';
        const stderr = data.stderr ? Buffer.from(data.stderr, 'base64').toString('utf-8') : '';
        
        if (data.status?.id === 3 && stdout === expectedOutput) {
            console.log(`✅ ${langName} Test PASSED — Output: "${stdout}"`);
        } else {
            console.log(`❌ ${langName} Test FAILED`);
            console.log(`   Status: ${data.status?.id} (${data.status?.description})`);
            console.log(`   Expected: "${expectedOutput}"`);
            console.log(`   Got: "${stdout}"`);
            if (stderr) console.log(`   Stderr: ${stderr}`);
        }
    } catch (error) {
        console.error(`❌ ${langName} Test ERROR: ${error.message}`);
        if (error.response) {
            console.error(`   Response: ${JSON.stringify(error.response.data)}`);
        }
    }
}

async function main() {
    console.log('=== Judge0 CE API Test ===');
    console.log(`API URL: ${JUDGE0_API_URL}`);
    console.log(`API Key: ${JUDGE0_API_KEY ? JUDGE0_API_KEY.substring(0, 8) + '...' : '(Not set/Self-hosted)'}`);
    
    // Python test
    await testJudge0('Python 3', 71, 'print("Hello from Judge0")', 'Hello from Judge0');
    
    await new Promise(r => setTimeout(r, 500)); // Rate limit
    
    // JavaScript test
    await testJudge0('JavaScript', 63, 'console.log("Hello from Judge0")', 'Hello from Judge0');
    
    await new Promise(r => setTimeout(r, 500));
    
    // Java test
    await testJudge0('Java', 62, 
        'public class Main { public static void main(String[] args) { System.out.println("Hello from Judge0"); } }',
        'Hello from Judge0'
    );
    
    await new Promise(r => setTimeout(r, 500));
    
    // C++ test
    await testJudge0('C++', 54, 
        '#include <iostream>\nusing namespace std;\nint main() { cout << "Hello from Judge0" << endl; return 0; }',
        'Hello from Judge0'
    );
    
    await new Promise(r => setTimeout(r, 500));
    
    // C test
    await testJudge0('C', 50,
        '#include <stdio.h>\nint main() { printf("Hello from Judge0\\n"); return 0; }',
        'Hello from Judge0'
    );
    
    console.log('\n=== Tests Complete ===');
}

main();
