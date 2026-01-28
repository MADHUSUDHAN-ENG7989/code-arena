require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./src/models/Question');

const questionsToCheck = [
    { title: "Subarray with Given Sum", slug: "subarray-with-given-sum" },
    { title: "Maximum Product Subarray", slug: "maximum-product-subarray" },
    { title: "Rotate Array", slug: "rotate-array" }, // Checking variations
    { title: "Rotate Array by K Positions", slug: "rotate-array-by-k-positions" },
    { title: "Find All Leaders in an Array", slug: "find-all-leaders-in-an-array" },
    { title: "Longest Consecutive Subsequence", slug: "longest-consecutive-subsequence" },
    { title: "Rearrange Array Alternately", slug: "rearrange-array-alternately" },
    { title: "Find Missing and Repeating Number", slug: "find-missing-and-repeating-number" },
    { title: "Count Subarrays with Equal 0s and 1s", slug: "count-subarrays-with-equal-0s-and-1s" },
    { title: "Merge Intervals", slug: "merge-intervals" },
    { title: "Find Peak Element", slug: "find-peak-element" },
    { title: "Smallest Subarray with Sum Greater Than X", slug: "smallest-subarray-with-sum-greater-than-x" },
    { title: "Maximum Sum Circular Subarray", slug: "maximum-sum-circular-subarray" }
];

async function checkQuestions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const existing = await Question.find({
            slug: { $in: questionsToCheck.map(q => q.slug) }
        });

        const existingSlugs = new Set(existing.map(q => q.slug));

        console.log('\n--- check Results ---');
        questionsToCheck.forEach(q => {
            if (existingSlugs.has(q.slug)) {
                console.log(`[EXISTING] ${q.title} (${q.slug})`);
            } else {
                console.log(`[MISSING]  ${q.title} (${q.slug})`);
            }
        });
        console.log('---------------------\n');

        process.exit(0);
    } catch (error) {
        console.error('Error checking questions:', error);
        process.exit(1);
    }
}

checkQuestions();
