const OpenAI = require('openai');

// Initialize OpenAI (configured for Groq)
const getGroq = () => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.warn('GROQ_API_KEY is missing');
        return null;
    }
    return new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.groq.com/openai/v1'
    });
};

const analyzeCode = async (code, language, problemDescription) => {
    try {
        const groq = getGroq();
        if (!groq) {
            return {
                error: 'AI service not configured',
                fallback: true
            };
        }

        const prompt = `
        You are a Senior Principal Software Engineer and Algorithm Expert. Your task is to perform a rigorous, "Platform-Grade" analysis of the user's code for the problem: "${problemDescription}".
        
        Analyze the following ${language} code:
        ${code}

        Return a STRICT JSON object (no markdown) with this exact schema:
        {
            "timeComplexity": {
                "best": "Big-O (e.g., O(1))",
                "average": "Big-O (e.g., O(n))",
                "worst": "Big-O (e.g., O(n^2))",
                "explanation": "Brief reasoning."
            },
            "spaceComplexity": {
                "auxiliary": "Big-O (e.g., O(n))",
                "total": "Big-O (e.g., O(n))",
                "explanation": "Brief reasoning."
            },
            "algorithm": {
                "type": "Specific Name (e.g., Hash Map, Two Pointers, DFS)",
                "category": "Broad Category (e.g., Dynamic Programming, Greedy)"
            },
            "optimality": {
                "status": "Optimal" | "Suboptimal",
                "expectedTime": "Big-O",
                "explanation": "Why it is/isn't optimal."
            },
            "codeQuality": {
                "cyclomaticComplexity": "Integer (1-20)",
                "maintainability": "Integer (0-100)",
                "readability": "Integer (0-100)",
                "codeSmells": ["List of critical issues or 'None'"]
            },
            "edgeCases": {
                "covered": ["List 2-3 covered cases"],
                "missing": ["List 1-2 potentially missing cases"]
            },
            "suggestions": [
                { "title": "Performance/Safety/Style", "advice": "Specific actionable advice" }
            ]
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);

    } catch (error) {
        console.error('AI Analysis Error:', error);

        let friendlyMessage = error.message;
        if (error.message.includes('429')) {
            friendlyMessage = "Usage limit exceeded. Please try again in a minute.";
        }

        return {
            error: 'Failed to analyze code',
            details: friendlyMessage,
            rawError: JSON.stringify(error, Object.getOwnPropertyNames(error))
        };
    }
};

module.exports = { analyzeCode };
