require('dotenv').config();
const OpenAI = require('openai');

const listGroqModels = async () => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error('GROQ_API_KEY is missing');
        return;
    }

    const groq = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.groq.com/openai/v1'
    });

    try {
        const models = await groq.models.list();
        console.log("Available Groq Models:");
        models.data.forEach(m => console.log(`- ${m.id}`));
    } catch (error) {
        console.error('Error fetching models:', error.message);
    }
};

listGroqModels();
