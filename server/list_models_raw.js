require('dotenv').config();
const axios = require('axios');

const listModelsRaw = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('API key not found');
        return;
    }

    try {
        console.log("Fetching models from Google AI API...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await axios.get(url);

        const models = response.data.models;
        console.log("Available Models:");
        models.forEach(m => {
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                console.log(`- ${m.name}`); // e.g. "models/gemini-pro"
            }
        });
    } catch (error) {
        console.error('Error fetching models:', error.response ? error.response.data : error.message);
    }
};

listModelsRaw();
