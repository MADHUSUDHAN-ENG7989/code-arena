require('dotenv').config();
const axios = require('axios');

const JDOODLE_API_URL = 'https://api.jdoodle.com/v1/execute';
const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

if (!JDOODLE_CLIENT_ID || !JDOODLE_CLIENT_SECRET) {
    console.error('❌ JDOODLE_CLIENT_ID or JDOODLE_CLIENT_SECRET is not set in .env file');
    console.log('Get your free credentials at: https://www.jdoodle.com (no credit card needed!)');
    console.log('Sign up → API menu → Subscribe to free plan → Copy Client ID & Secret');
    process.exit(1);
}

const RUNTIMES = {
    'Python 3':    { language: 'python3', versionIndex: '4' },
    'JavaScript':  { language: 'nodejs', versionIndex: '4' },
    'Java':        { language: 'java', versionIndex: '4' },
    'C++':         { language: 'cpp17', versionIndex: '1' },
    'C':           { language: 'c', versionIndex: '5' },
};

const TEST_CODES = {
    'Python 3': 'print("Hello from JDoodle")',
    'JavaScript': 'console.log("Hello from JDoodle")',
    'Java': 'public class Main { public static void main(String[] args) { System.out.println("Hello from JDoodle"); } }',
    'C++': '#include <iostream>\nusing namespace std;\nint main() { cout << "Hello from JDoodle" << endl; return 0; }',
    'C': '#include <stdio.h>\nint main() { printf("Hello from JDoodle\\n"); return 0; }',
};

async function testJDoodle(langName) {
    try {
        const runtime = RUNTIMES[langName];
        const code = TEST_CODES[langName];
        
        console.log(`\nTesting ${langName} (${runtime.language} v${runtime.versionIndex})...`);
        
        const response = await axios.post(JDOODLE_API_URL, {
            clientId: JDOODLE_CLIENT_ID,
            clientSecret: JDOODLE_CLIENT_SECRET,
            script: code,
            language: runtime.language,
            versionIndex: runtime.versionIndex,
            stdin: '',
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000,
        });

        const data = response.data;
        const output = (data.output || '').trim();
        
        if (output === 'Hello from JDoodle') {
            console.log(`✅ ${langName} PASSED — Output: "${output}"`);
            console.log(`   CPU: ${data.cpuTime}s, Memory: ${data.memory}KB`);
        } else {
            console.log(`❌ ${langName} FAILED`);
            console.log(`   Status: ${data.statusCode}`);
            console.log(`   Expected: "Hello from JDoodle"`);
            console.log(`   Got: "${output}"`);
        }
    } catch (error) {
        console.error(`❌ ${langName} ERROR: ${error.message}`);
        if (error.response) {
            console.error(`   Response: ${JSON.stringify(error.response.data)}`);
        }
    }
}

async function checkCredits() {
    try {
        const response = await axios.post('https://api.jdoodle.com/v1/credit-spent', {
            clientId: JDOODLE_CLIENT_ID,
            clientSecret: JDOODLE_CLIENT_SECRET,
        });
        console.log(`\n📊 Credits used today: ${response.data.used}/${response.data.used + 200}`);
    } catch (e) {
        console.log('Could not check credit usage');
    }
}

async function main() {
    console.log('=== JDoodle API Test ===');
    console.log(`Client ID: ${JDOODLE_CLIENT_ID.substring(0, 8)}...`);
    
    for (const lang of Object.keys(RUNTIMES)) {
        await testJDoodle(lang);
        await new Promise(r => setTimeout(r, 500)); // Rate limit
    }
    
    await checkCredits();
    console.log('\n=== Tests Complete ===');
}

main();
