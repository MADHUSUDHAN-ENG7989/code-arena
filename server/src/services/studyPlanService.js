const axios = require('axios');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const User = require('../models/User');
const OpenAI = require('openai');

// Initialize Groq helper (if API key is present)
const getGroq = () => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;
    return new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.groq.com/openai/v1'
    });
};

/**
 * Perform a web search for tutorials using Tavily Search API.
 * Falls back gracefully to structured queries if the API key is not configured or fails.
 */
async function searchResources(query, questionTitle) {
    const apiKey = process.env.TAVILY_API_KEY;
    
    // Fallback search results if key is missing or is placeholder
    const getFallback = () => [
        {
            title: `YouTube Walkthrough: How to solve "${questionTitle}"`,
            url: `https://www.youtube.com/results?search_query=solve+${encodeURIComponent(questionTitle)}+dsa+tutorial`,
            content: `Watch visual video lectures showing optimal visual code walkthroughs and complexity analysis for ${questionTitle}.`
        },
        {
            title: `GeeksForGeeks: "${questionTitle}" Problem Discussion`,
            url: `https://www.google.com/search?q=site:geeksforgeeks.org+${encodeURIComponent(questionTitle)}`,
            content: `Read standard editorial explanations, optimal pseudocode, and dry-runs on GeeksforGeeks for "${questionTitle}".`
        },
        {
            title: `LeetCode Discuss: Optimal solutions for "${questionTitle}"`,
            url: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(questionTitle)}`,
            content: `Browse community-vetted solutions, optimizations, and common patterns shared by developers.`
        }
    ];

    if (!apiKey || apiKey === 'tvly-placeholder-key' || apiKey.startsWith('tvly-placeholder')) {
        console.log(`[STUDY-PLAN] Using mock Tavily resources for: ${questionTitle}`);
        return getFallback();
    }

    try {
        console.log(`[STUDY-PLAN] Querying Tavily API for: "${query}"`);
        const response = await axios.post('https://api.tavily.com/search', {
            api_key: apiKey,
            query: query,
            search_depth: 'basic',
            max_results: 3
        }, { timeout: 8000 });

        if (response.data && response.data.results && response.data.results.length > 0) {
            return response.data.results.map(r => ({
                title: r.title || 'Educational Resource',
                url: r.url || '#',
                content: r.content || 'Video lecture or step-by-step DSA guide.'
            }));
        }
        return getFallback();
    } catch (e) {
        console.warn(`[STUDY-PLAN] Tavily query failed (${e.message}), falling back...`);
        return getFallback();
    }
}

/**
 * Generates a personalized study plan for a student.
 */
async function generateStudyPlan(userId) {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // 1. Fetch all submissions by user
    const submissions = await Submission.find({ userId }).populate('questionId');
    
    // Get all questions to find unsolved ones
    const allQuestions = await Question.find({});
    
    // Map to find solved questions
    const solvedQuestionIds = new Set(
        submissions.filter(s => s.verdict === 'Accepted').map(s => s.questionId?._id?.toString())
    );

    // Edge Case A: No submissions at all
    if (submissions.length === 0) {
        const starterSlugs = ['two-sum', 'plus-one', 'climbing-stairs', 'reverse-linked-list'];
        const recommendedStarter = allQuestions.filter(q => starterSlugs.includes(q.slug));
        
        // Fetch resources for general coding starter topics
        const resources = await searchResources(
            "learn arrays and strings and linked lists coding classes video tutorials", 
            "Data Structures & Algorithms Basics"
        );

        const motivation = "Welcome to Code Arena! It looks like you haven't attempted any challenges yet. Let's start with basic Data Structures and Algorithms. Below are starter video classes and a custom practice sequence to build your confidence.";

        return {
            status: 'new_user',
            motivation,
            weakTopics: ['Arrays', 'Basic Math', 'Linked Lists'],
            resources,
            recommendedQuestions: recommendedStarter.map(q => ({
                _id: q._id,
                title: q.title,
                slug: q.slug,
                difficulty: q.difficulty,
                topic: q.topic,
                points: q.points
            }))
        };
    }

    // Edge Case B: 100% solved (Master User)
    if (solvedQuestionIds.size === allQuestions.length) {
        const resources = await searchResources(
            "advanced competitive programming dynamic programming tree algorithms lectures", 
            "Advanced Algorithms"
        );

        return {
            status: 'master_user',
            motivation: "Incredible! You have solved every single challenge in Code Arena! You have mastered the platform. To keep learning, explore advanced topics like dynamic programming optimizations, segment trees, and hard competitive programming lectures below.",
            weakTopics: [],
            resources,
            recommendedQuestions: []
        };
    }

    // 2. Identify errors and weak areas
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

    // Find if they have no failed submissions, but have attempted and solved everything they tried
    if (failedSubmissions.length === 0) {
        // Advanced user: has solved everything they tried, but hasn't solved everything yet
        const unsolved = allQuestions.filter(q => !solvedQuestionIds.has(q._id.toString()));
        // Recommend unsolved sorted by points (easier first)
        unsolved.sort((a, b) => (a.points || 10) - (b.points || 10));
        const nextQuestions = unsolved.slice(0, 4);

        const nextTopic = nextQuestions[0]?.topic || 'Advanced Topics';
        const resources = await searchResources(
            `best tutorial lectures for ${nextTopic} dsa coding`, 
            nextTopic
        );

        return {
            status: 'advanced_user',
            motivation: "Great job! You have accepted solutions for all questions you attempted so far. Let's keep the momentum going by exploring new topics and challenges you haven't solved yet.",
            weakTopics: [],
            resources,
            recommendedQuestions: nextQuestions.map(q => ({
                _id: q._id,
                title: q.title,
                slug: q.slug,
                difficulty: q.difficulty,
                topic: q.topic,
                points: q.points
            }))
        };
    }

    // 3. Identify weakest topics & failed questions
    const weakestTopics = Object.entries(topicFailures)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

    const mostFailedQuestions = Object.values(questionFailures)
        .sort((a, b) => b.count - a.count);

    // Pick top failed question for resource scraping
    const topFailedQ = mostFailedQuestions[0];
    const topTopic = weakestTopics[0];

    // Scrape resources using Tavily with the question title and topic
    const searchTopicQuery = `best coding video lectures tutorials for topic ${topTopic} dsa ${topFailedQ.title}`;
    const resources = await searchResources(searchTopicQuery, topFailedQ.title);

    // 4. Determine DSA questions to practice next (Weak topics, unsolved, sorted by difficulty)
    const recommendedQuestions = [];
    
    // Sort all questions: Easy first, then Medium, then Hard
    const difficultyWeight = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
    const candidates = allQuestions.filter(q => !solvedQuestionIds.has(q._id.toString()));
    
    candidates.sort((a, b) => {
        const diffA = difficultyWeight[a.difficulty] || 1;
        const diffB = difficultyWeight[b.difficulty] || 1;
        if (diffA !== diffB) return diffA - diffB;
        return (a.points || 10) - (b.points || 10);
    });

    // First, push unsolved questions belonging to the user's weakest topics
    candidates.forEach(q => {
        if (weakestTopics.includes(q.topic) && recommendedQuestions.length < 5) {
            recommendedQuestions.push(q);
        }
    });

    // If still have space, add general easiest unsolved questions
    candidates.forEach(q => {
        if (!recommendedQuestions.includes(q) && recommendedQuestions.length < 5) {
            recommendedQuestions.push(q);
        }
    });

    // 5. Generate LLM Narrative summary
    let motivation = `Based on your analysis, you have encountered difficulties with **${topTopic}** algorithms (specifically on "${topFailedQ.title}", where you made ${topFailedQ.count} failed attempts). We highly recommend you review the classes below, then return to practice the suggested list in sequence.`;

    const groq = getGroq();
    if (groq) {
        try {
            const systemPrompt = `You are an encouraging AI Coach on a competitive coding platform. Your goal is to review a student's weak topic and failed question count, and write a motivational, personalized, 3-4 sentence study advice narrative. Suggest they review the courses and then come back to solve their practice sequence.`;
            
            const prompt = `Student has failed ${topFailedQ.count} times on "${topFailedQ.title}" under topic "${topTopic}". Their weakest topics overall are: ${weakestTopics.slice(0, 3).join(', ')}. Keep it encouraging, short, and to the point. Do not list recommended questions or links; just provide the text advice.`;

            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
                max_tokens: 200
            });

            if (completion.choices[0].message.content) {
                motivation = completion.choices[0].message.content.trim();
            }
        } catch (llmErr) {
            console.warn('[STUDY-PLAN] Groq summary generation failed:', llmErr.message);
        }
    }

    return {
        status: 'needs_practice',
        motivation,
        weakTopics: weakestTopics.slice(0, 3),
        resources,
        recommendedQuestions: recommendedQuestions.map(q => ({
            _id: q._id,
            title: q.title,
            slug: q.slug,
            difficulty: q.difficulty,
            topic: q.topic,
            points: q.points
        }))
    };
}

module.exports = { generateStudyPlan };
