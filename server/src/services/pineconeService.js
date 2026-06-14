const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const Question = require('../models/Question');

let pineconeClient = null;
let pineconeIndex = null;
let openaiClient = null;

// Initialize OpenAI client for embeddings if key is present
function getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        // Fallback: If we have GROQ_API_KEY and it supports some embedding/we can't generate embedding,
        // we'll just log it. Some users reuse OpenAI API keys or GROQ keys.
        return null;
    }
    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey });
    }
    return openaiClient;
}

// Initialize Pinecone
function getPineconeIndex() {
    const host = process.env.PINECONE_HOST;
    const apiKey = process.env.PINECONE_API_KEY;
    
    if (!apiKey || apiKey.startsWith('pcsk_')) {
        console.warn('[PINECONE] PINECONE_API_KEY is not configured or is a placeholder. Skipping Pinecone client init.');
        return null;
    }
    if (!host) {
        console.warn('[PINECONE] PINECONE_HOST is not configured. Skipping Pinecone client init.');
        return null;
    }

    if (!pineconeIndex) {
        try {
            console.log('[PINECONE] Initializing Pinecone Client...');
            pineconeClient = new Pinecone({ apiKey });
            // Connect directly to the provided host URL
            pineconeIndex = pineconeClient.index('', host);
            console.log('[PINECONE] Targeted index host:', host);
        } catch (err) {
            console.error('[PINECONE] Initialization failed:', err.message);
            pineconeIndex = null;
        }
    }
    return pineconeIndex;
}

// Helper to generate embedding vector using OpenAI
async function getEmbedding(text) {
    const oa = getOpenAIClient();
    if (!oa) {
        throw new Error('OpenAI client not configured for embeddings');
    }
    const response = await oa.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding;
}

/**
 * Upserts all MongoDB questions into the Pinecone database.
 * Useful for seeding or keeping the vector index in sync.
 */
async function syncQuestionsToPinecone() {
    const index = getPineconeIndex();
    if (!index) {
        console.log('[PINECONE] Vector DB not configured. Skipping question synchronization.');
        return false;
    }

    try {
        console.log('[PINECONE] Fetching questions from MongoDB to index...');
        const questions = await Question.find({});
        console.log(`[PINECONE] Found ${questions.length} questions to sync.`);

        const upsertBatch = [];
        for (const q of questions) {
            try {
                const textToEmbed = `Title: ${q.title}\nTopic: ${q.topic}\nDifficulty: ${q.difficulty}\nDescription: ${q.description}`;
                const vector = await getEmbedding(textToEmbed);
                
                upsertBatch.push({
                    id: q._id.toString(),
                    values: vector,
                    metadata: {
                        title: q.title,
                        topic: q.topic,
                        difficulty: q.difficulty,
                        slug: q.slug,
                        points: q.points || 10
                    }
                });
            } catch (embedErr) {
                console.warn(`[PINECONE] Could not embed question "${q.title}":`, embedErr.message);
            }
        }

        if (upsertBatch.length > 0) {
            console.log(`[PINECONE] Upserting ${upsertBatch.length} vectors to Pinecone...`);
            // Batch upsert (Pinecone limit is typically 100 per call for safe payload size)
            const chunkSize = 50;
            for (let i = 0; i < upsertBatch.length; i += chunkSize) {
                const chunk = upsertBatch.slice(i, i + chunkSize);
                await index.upsert(chunk);
            }
            console.log('[PINECONE] Synchronization complete.');
            return true;
        }
        return false;
    } catch (error) {
        console.error('[PINECONE] Error syncing questions:', error.message);
        return false;
    }
}

/**
 * Query Pinecone for similar questions given a natural language query/concept.
 * Falls back to MongoDB regex search if Pinecone is not configured.
 */
async function searchSimilarQuestions(queryText, limit = 5) {
    const index = getPineconeIndex();
    const hasOpenAI = !!getOpenAIClient();

    if (!index || !hasOpenAI) {
        console.log('[PINECONE] Vector search unavailable (missing keys). Performing local database regex search instead.');
        // Fallback: search questions in MongoDB by title, topic, or description matching query keywords
        const keywords = queryText.split(/\s+/).filter(k => k.length > 2);
        const orConditions = keywords.map(kw => ({
            $or: [
                { title: { $regex: kw, $options: 'i' } },
                { topic: { $regex: kw, $options: 'i' } },
                { description: { $regex: kw, $options: 'i' } }
            ]
        }));

        const query = orConditions.length > 0 ? { $or: orConditions } : {};
        const dbMatches = await Question.find(query).limit(limit);
        return dbMatches.map(q => ({
            id: q._id.toString(),
            score: 1.0,
            metadata: {
                title: q.title,
                topic: q.topic,
                difficulty: q.difficulty,
                slug: q.slug,
                points: q.points || 10
            }
        }));
    }

    try {
        console.log(`[PINECONE] Generating query embedding for: "${queryText}"`);
        const queryVector = await getEmbedding(queryText);
        
        console.log('[PINECONE] Querying vectors...');
        const queryResponse = await index.query({
            vector: queryVector,
            topK: limit,
            includeMetadata: true
        });

        if (queryResponse.matches && queryResponse.matches.length > 0) {
            return queryResponse.matches;
        }
        return [];
    } catch (error) {
        console.error('[PINECONE] Search failed:', error.message);
        // Fallback to basic DB lookup on failure
        const dbFallback = await Question.find({}).limit(limit);
        return dbFallback.map(q => ({
            id: q._id.toString(),
            score: 0.5,
            metadata: {
                title: q.title,
                topic: q.topic,
                difficulty: q.difficulty,
                slug: q.slug,
                points: q.points || 10
            }
        }));
    }
}

module.exports = {
    getPineconeIndex,
    syncQuestionsToPinecone,
    searchSimilarQuestions
};
