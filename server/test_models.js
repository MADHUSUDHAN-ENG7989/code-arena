require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const listModels = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('API key not found in .env');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // There isn't a direct "listModels" on the instance in some SDK versions, but it might be on the main export or we can try a simple generation with a fallback.
    // Actually, usually it's not directly exposed in the high-level helper for all versions.
    // However, the error message said: "Call ListModels to see the list..."
    // Let's try to just hit the REST API directly to be sure, or check if the SDK supports it.

    // Trying SDK method if available, otherwise fetch
    try {
        // Since node-fetch might not be available, we'll try to guess/test standard ones.
        // But let's try to just run a simple test with 'gemini-1.5-flash-latest' or 'gemini-1.0-pro'
        console.log("Testing common model names...");

        const modelsToTest = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];

        for (const modelName of modelsToTest) {
            console.log(`Testing ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Hello');
                const response = await result.response;
                console.log(`SUCCESS: ${modelName} works! Response: ${response.text()}`);
                return; // Found one!
            } catch (e) {
                console.log(`FAILED: ${modelName} - ${e.message.split(':')[0]}`);
            }
        }

        console.log("All common/tested models failed.");

    } catch (error) {
        console.error('Error:', error);
    }
};

listModels();
