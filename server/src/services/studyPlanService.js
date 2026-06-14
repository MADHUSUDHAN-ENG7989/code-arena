const { StateGraph, START, END } = require('@langchain/langgraph');
const axios = require('axios');
const OpenAI = require('openai');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const User = require('../models/User');
const { searchSimilarQuestions } = require('./pineconeService');

// Initialize Groq / OpenAI helper for narrative generation
const getGroq = () => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;
    return new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.groq.com/openai/v1'
    });
};

/**
 * Extracts the 11-character YouTube video ID from a URL.
 */
function getYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Fallback high-quality Striver (take U forward) videos for standard topics
const STRIVER_FALLBACK_VIDEOS = {
    'Arrays': {
        title: 'Striver\'s Arrays playlist - DSA Course',
        url: 'https://www.youtube.com/watch?v=37E9ckMDdTk',
        videoId: '37E9ckMDdTk'
    },
    'Basic Math': {
        title: 'Striver\'s Basic Math for Coding',
        url: 'https://www.youtube.com/watch?v=1XtVaoODky4',
        videoId: '1XtVaoODky4'
    },
    'Recursion': {
        title: 'Striver\'s Recursion Playlist - Lecture 1',
        url: 'https://www.youtube.com/watch?v=yVdKa8dnKiE',
        videoId: 'yVdKa8dnKiE'
    },
    'Binary Search': {
        title: 'Striver\'s Binary Search Playlist',
        url: 'https://www.youtube.com/watch?v=COKCOaF8Rco',
        videoId: 'COKCOaF8Rco'
    },
    'Strings': {
        title: 'Striver\'s Strings Series playlist',
        url: 'https://www.youtube.com/watch?v=gM89Z5T9a4Y',
        videoId: 'gM89Z5T9a4Y'
    },
    'Linked Lists': {
        title: 'Striver\'s Linked List Series',
        url: 'https://www.youtube.com/watch?v=q5a5sOcO3Fc',
        videoId: 'q5a5sOcO3Fc'
    },
    'Stacks & Queues': {
        title: 'Striver\'s Stack & Queue playlist',
        url: 'https://www.youtube.com/watch?v=mJW5YKjK2u0',
        videoId: 'mJW5YKjK2u0'
    },
    'Trees': {
        title: 'Striver\'s Binary Tree playlist',
        url: 'https://www.youtube.com/watch?v=StQc0T3xV1U',
        videoId: 'StQc0T3xV1U'
    },
    'Graphs': {
        title: 'Striver\'s Graph Series playlist',
        url: 'https://www.youtube.com/watch?v=ia1tUrDFuOR',
        videoId: 'ia1tUrDFuOR'
    },
    'Dynamic Programming': {
        title: 'Striver\'s DP Course playlist',
        url: 'https://www.youtube.com/watch?v=FfGPlyHFsIz',
        videoId: 'FfGPlyHFsIz'
    },
    'Greedy': {
        title: 'Striver\'s Greedy Algorithms playlist',
        url: 'https://www.youtube.com/watch?v=DIX2p7gT6w0',
        videoId: 'DIX2p7gT6w0'
    }
};

/**
 * Node 1: Analyzer
 * Analyzes the student's submission history and identifies weak topics and failed questions.
 */
async function analyzerNode(state) {
    const { userId } = state;
    console.log(`[LANGGRAPH-AGENT] [Analyzer] Reviewing performance for user: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
        throw new Error(`User not found: ${userId}`);
    }

    const submissions = await Submission.find({ userId }).populate('questionId');
    const allQuestions = await Question.find({});
    
    const solvedQuestionIds = new Set(
        submissions.filter(s => s.verdict === 'Accepted' && s.questionId).map(s => s.questionId._id.toString())
    );

    // Identify failures/weak topics
    const failedSubmissions = submissions.filter(s => s.verdict !== 'Accepted' && s.questionId);
    
    const topicFailures = {};
    const questionFailures = {};

    failedSubmissions.forEach(sub => {
        const q = sub.questionId;
        if (!q) return;
        
        topicFailures[q.topic] = (topicFailures[q.topic] || 0) + 1;
        questionFailures[q.slug] = {
            title: q.title,
            topic: q.topic,
            slug: q.slug,
            count: (questionFailures[q.slug]?.count || 0) + 1
        };
    });

    const weakestTopics = Object.entries(topicFailures)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

    const mostFailedQuestions = Object.values(questionFailures)
        .sort((a, b) => b.count - a.count);

    // Determine status
    let status = 'needs_practice';
    if (submissions.length === 0) {
        status = 'new_user';
    } else if (solvedQuestionIds.size === allQuestions.length) {
        status = 'master_user';
    } else if (failedSubmissions.length === 0) {
        status = 'advanced_user';
    }

    return {
        submissions,
        allQuestions,
        solvedQuestionIds,
        weakTopics: weakestTopics.slice(0, 3),
        status,
        meta: {
            topFailedQ: mostFailedQuestions[0] || null,
            topTopic: weakestTopics[0] || null
        }
    };
}

/**
 * Node 2: Retriever (Semantic search with Pinecone)
 * Fetches recommended questions that target the student's weakest topics.
 */
async function retrieverNode(state) {
    const { status, weakTopics, solvedQuestionIds, allQuestions, meta } = state;
    console.log(`[LANGGRAPH-AGENT] [Retriever] Fetching practice questions. Status: ${status}`);

    if (status === 'master_user') {
        return { recommendedQuestions: [] };
    }

    if (status === 'new_user') {
        const starterSlugs = ['two-sum', 'plus-one', 'climbing-stairs', 'reverse-linked-list'];
        const starterQuestions = allQuestions.filter(q => starterSlugs.includes(q.slug));
        return {
            recommendedQuestions: starterQuestions.map(q => ({
                _id: q._id,
                title: q.title,
                slug: q.slug,
                difficulty: q.difficulty,
                topic: q.topic,
                points: q.points
            }))
        };
    }

    // Standard or Advanced User recommendation logic
    let targetConcept = 'easiest unsolved standard programming data structures challenges';
    if (meta && meta.topFailedQ) {
        targetConcept = `optimal solution and problems similar to ${meta.topFailedQ.title} in topic ${meta.topTopic}`;
    } else if (weakTopics && weakTopics.length > 0) {
        targetConcept = `fundamental DSA challenges on ${weakTopics.join(', ')}`;
    }

    // Retrieve similar questions using Pinecone (falls back to local text query)
    const pineconeMatches = await searchSimilarQuestions(targetConcept, 10);
    const recommendedQuestions = [];

    // Filter out already solved questions
    for (const match of pineconeMatches) {
        if (!solvedQuestionIds.has(match.id)) {
            // Find full details from the allQuestions list
            const fullQ = allQuestions.find(q => q._id.toString() === match.id);
            if (fullQ && recommendedQuestions.length < 5) {
                recommendedQuestions.push({
                    _id: fullQ._id,
                    title: fullQ.title,
                    slug: fullQ.slug,
                    difficulty: fullQ.difficulty,
                    topic: fullQ.topic,
                    points: fullQ.points
                });
            }
        }
    }

    // Fallback: If still have space, add general easiest unsolved questions
    const difficultyWeight = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
    const candidates = allQuestions.filter(q => !solvedQuestionIds.has(q._id.toString()));
    candidates.sort((a, b) => {
        const diffA = difficultyWeight[a.difficulty] || 1;
        const diffB = difficultyWeight[b.difficulty] || 1;
        if (diffA !== diffB) return diffA - diffB;
        return (a.points || 10) - (b.points || 10);
    });

    candidates.forEach(q => {
        if (recommendedQuestions.length < 5 && !recommendedQuestions.some(rq => rq.slug === q.slug)) {
            recommendedQuestions.push({
                _id: q._id,
                title: q.title,
                slug: q.slug,
                difficulty: q.difficulty,
                topic: q.topic,
                points: q.points
            });
        }
    });

    return { recommendedQuestions };
}

/**
 * Node 3: Scraper (Tavily YouTube scraper for take U forward)
 * Searches Tavily for YouTube lectures, filters them, and extracts thumbnails.
 */
async function scraperNode(state) {
    const { status, weakTopics, meta } = state;
    const apiKey = process.env.TAVILY_API_KEY;

    console.log('[LANGGRAPH-AGENT] [Scraper] Scraping YouTube videos from take U forward...');

    // Identify topic or question to query
    let queryTopic = 'Arrays';
    let queryTitle = 'Coding Interview Prep';
    if (meta && meta.topFailedQ) {
        queryTopic = meta.topTopic || 'DSA';
        queryTitle = meta.topFailedQ.title;
    } else if (weakTopics && weakTopics.length > 0) {
        queryTopic = weakTopics[0];
    }

    // General Tavily search targeting YouTube for the topic and problem
    const searchQuery = `site:youtube.com ${queryTopic} ${queryTitle} DSA coding tutorial`;
    const resources = [];

    // Helper to get fallback matching the topic
    const getFallbackVideo = (topic) => {
        // Find closest fallback topic key
        const key = Object.keys(STRIVER_FALLBACK_VIDEOS).find(
            t => topic.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(topic.toLowerCase())
        );
        return STRIVER_FALLBACK_VIDEOS[key] || STRIVER_FALLBACK_VIDEOS['Arrays'];
    };

    if (!apiKey || apiKey.includes('placeholder')) {
        console.log('[LANGGRAPH-AGENT] [Scraper] Missing Tavily API Key. Using fallback Striver resource.');
        const fallback = getFallbackVideo(queryTopic);
        resources.push({
            title: fallback.title,
            url: fallback.url,
            thumbnail: `https://img.youtube.com/vi/${fallback.videoId}/mqdefault.jpg`,
            description: `Official comprehensive video tutorial from take U forward channel to master ${queryTopic} algorithms.`
        });
        return { resources };
    }

    try {
        console.log(`[LANGGRAPH-AGENT] [Scraper] Fetching Tavily search: "${searchQuery}"`);
        const response = await axios.post('https://api.tavily.com/search', {
            api_key: apiKey,
            query: searchQuery,
            search_depth: 'basic',
            max_results: 8
        }, { timeout: 7000 });

        if (response.data && response.data.results && response.data.results.length > 0) {
            const results = response.data.results;
            
            // Filter all YouTube URLs
            const youtubeResults = results.filter(r => {
                const url = r.url || '';
                return url.includes('youtube.com') || url.includes('youtu.be');
            });

            // Prioritize/sort Striver (take U forward) videos at the top
            youtubeResults.sort((a, b) => {
                const textA = ((a.title || '') + ' ' + (a.content || '')).toLowerCase();
                const textB = ((b.title || '') + ' ' + (b.content || '')).toLowerCase();
                
                const isStriverA = textA.includes('take u forward') || textA.includes('takeuforward') || textA.includes('striver');
                const isStriverB = textB.includes('take u forward') || textB.includes('takeuforward') || textB.includes('striver');
                
                if (isStriverA && !isStriverB) return -1;
                if (!isStriverA && isStriverB) return 1;
                return 0;
            });

            for (const r of youtubeResults) {
                const videoId = getYouTubeId(r.url);
                if (videoId && resources.length < 3) {
                    resources.push({
                        title: r.title || 'Coding Lecture',
                        url: r.url,
                        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                        description: r.content || 'Step-by-step programming solution tutorial.'
                    });
                }
            }
        }
    } catch (e) {
        console.warn('[LANGGRAPH-AGENT] [Scraper] Tavily search error:', e.message);
    }

    // Ensure we have at least one valid Striver resource by pushing the fallback if empty
    if (resources.length === 0) {
        const fallback = getFallbackVideo(queryTopic);
        resources.push({
            title: fallback.title,
            url: fallback.url,
            thumbnail: `https://img.youtube.com/vi/${fallback.videoId}/mqdefault.jpg`,
            description: `Official comprehensive video tutorial from take U forward channel to master ${queryTopic} algorithms.`
        });
    }

    return { resources };
}

/**
 * Node 4: Synthesizer
 * Uses Groq LLM or custom fallback to draft the final narrative advice text.
 */
async function synthesizerNode(state) {
    const { status, weakTopics, meta, recommendedQuestions } = state;
    console.log('[LANGGRAPH-AGENT] [Synthesizer] Drafting coaching narrative...');

    let topFailedQTitle = meta && meta.topFailedQ ? meta.topFailedQ.title : '';
    let topFailedQCount = meta && meta.topFailedQ ? meta.topFailedQ.count : 0;
    let topTopicName = meta && meta.topTopic ? meta.topTopic : '';

    // Default narrative text (if LLM fails)
    let motivation = '';
    if (status === 'new_user') {
        motivation = "Welcome to Code Arena! It looks like you haven't attempted any challenges yet. Let's start with basic Data Structures and Algorithms. Below are starter video classes and a custom practice sequence to build your confidence.";
    } else if (status === 'master_user') {
        motivation = "Incredible! You have solved every single challenge in Code Arena! You have mastered the platform. To keep learning, explore advanced topics like dynamic programming optimizations, segment trees, and hard competitive programming lectures below.";
    } else if (status === 'advanced_user') {
        motivation = "Great job! You have accepted solutions for all questions you attempted so far. Let's keep the momentum going by exploring new topics and challenges you haven't solved yet. Keep up the high standard!";
    } else {
        motivation = `Based on your analysis, you have encountered difficulties with **${topTopicName}** algorithms (specifically on "${topFailedQTitle}", where you made ${topFailedQCount} failed attempts). We highly recommend you review the classes below, then return to practice the suggested list in sequence.`;
    }

    const groq = getGroq();
    if (groq) {
        try {
            const systemPrompt = `You are a professional, encouraging AI Coach on a competitive coding platform called Code Arena. Your goal is to review a student's weak topic and failed question count, and write a motivational, personalized 3-4 sentence study advice narrative. Suggest they review the take U forward courses listed and then attempt the practice list in sequence. Use bold markdown for key terms.`;
            
            let userPrompt = '';
            if (status === 'new_user') {
                userPrompt = `The student is brand new and has not solved any questions yet. Encourage them to begin practicing easy questions like Two Sum or Plus One and view introductory lectures.`;
            } else if (status === 'master_user') {
                userPrompt = `The student has solved all questions on the platform! Congratulate them on this major milestone, suggest they try competitive programming, and give them a master's level pep talk.`;
            } else if (status === 'advanced_user') {
                userPrompt = `The student has solved all questions they attempted with 100% success, but has not finished all platform questions. Encourage them to push out of their comfort zone.`;
            } else {
                userPrompt = `The student has failed ${topFailedQCount} times on the question "${topFailedQTitle}" under topic "${topTopicName}". Their weakest topics overall are: ${weakTopics.join(', ')}. Provide supportive, specific, actionable coaching.`;
            }

            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                model: "llama-3.3-70b-versatile",
                max_tokens: 250
            });

            if (completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content) {
                motivation = completion.choices[0].message.content.trim();
            }
        } catch (llmErr) {
            console.warn('[LANGGRAPH-AGENT] [Synthesizer] Groq narrative synthesis failed, using template fallback:', llmErr.message);
        }
    }

    return { motivation };
}

// Build and compile the LangGraph StateGraph
const graph = new StateGraph({
    channels: {
        userId: null,
        submissions: null,
        allQuestions: null,
        solvedQuestionIds: null,
        status: null,
        motivation: null,
        weakTopics: null,
        resources: null,
        recommendedQuestions: null,
        meta: null
    }
})
    .addNode('analyzer', analyzerNode)
    .addNode('retriever', retrieverNode)
    .addNode('scraper', scraperNode)
    .addNode('synthesizer', synthesizerNode)
    .addEdge(START, 'analyzer')
    .addEdge('analyzer', 'retriever')
    .addEdge('retriever', 'scraper')
    .addEdge('scraper', 'synthesizer')
    .addEdge('synthesizer', END);

const agentExecutor = graph.compile();

/**
 * Primary endpoint service handler. Executes the LangGraph agent state machine.
 */
async function generateStudyPlan(userId) {
    try {
        console.log(`[STUDY-PLAN-SERVICE] Running LangGraph agent for user: ${userId}`);
        const result = await agentExecutor.invoke({ userId });
        
        return {
            status: result.status,
            motivation: result.motivation,
            weakTopics: result.weakTopics || [],
            resources: result.resources || [],
            recommendedQuestions: result.recommendedQuestions || []
        };
    } catch (err) {
        console.error('[STUDY-PLAN-SERVICE] Execution failed:', err);
        throw err;
    }
}

module.exports = { generateStudyPlan };
