import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studyPlanAPI } from '../lib/api';
import MainLayout from '../components/MainLayout';

const StudyPlan = () => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStudyPlan();
    }, []);

    const fetchStudyPlan = async () => {
        try {
            setLoading(true);
            const response = await studyPlanAPI.get();
            setPlan(response.data);
        } catch (err) {
            console.error('Error fetching study plan:', err);
            setError('Failed to load study plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy':
                return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Medium':
                return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Hard':
                return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default:
                return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    <p className="text-gray-400 text-sm animate-pulse">Analyzing your coding history & scraping courses...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="p-8 text-center bg-[#151E2E] rounded-2xl border border-rose-500/20 text-rose-400">
                    <p className="font-semibold mb-2">{error}</p>
                    <button 
                        onClick={fetchStudyPlan} 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Personalized Study Agent 🧠</h1>
                        <p className="text-gray-400 mt-1">AI-driven learning paths based on your compiler runs and code errors.</p>
                    </div>
                    <button 
                        onClick={fetchStudyPlan}
                        className="p-2.5 rounded-xl bg-[#151E2E] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all text-sm font-semibold"
                    >
                        Refresh Plan 🔄
                    </button>
                </div>

                {/* AI Motivation & Analysis Summary Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white tracking-wide uppercase">
                            ✨ AI Coach Analysis
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                            {plan?.motivation}
                        </h2>
                        
                        {plan?.weakTopics && plan.weakTopics.length > 0 && (
                            <div className="pt-2">
                                <span className="text-xs text-indigo-200 uppercase font-bold tracking-widest block mb-2">Focus Areas identified:</span>
                                <div className="flex flex-wrap gap-2">
                                    {plan.weakTopics.map(topic => (
                                        <span key={topic} className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/10 text-white">
                                            ⚠️ {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* RECOMMENDED LECTURES / CLASSES (Scraped via Tavily) */}
                    <div className="md:col-span-7 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
                            <h2 className="text-2xl font-bold text-white">Recommended Classes & Tutorials</h2>
                        </div>
                        <p className="text-sm text-gray-400 -mt-3">
                            💡 **Important**: Watch or read these class materials to understand the concepts, then come back to attempt the practice challenges.
                        </p>

                        <div className="space-y-4">
                            {plan?.resources && plan.resources.length > 0 ? (
                                plan.resources.map((res, i) => (
                                    <a
                                        key={i}
                                        href={res.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-5 rounded-2xl bg-[#151E2E] border border-gray-800 hover:border-indigo-500/50 hover:bg-[#1A2538] transition-all duration-300 group"
                                    >
                                        <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                                            📖 {res.title}
                                            <span className="text-xs text-indigo-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                                (Open Link ↗)
                                            </span>
                                        </h3>
                                        <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                                            {res.content}
                                        </p>
                                        <div className="text-xs text-indigo-400 font-mono mt-3 truncate opacity-60">
                                            {res.url}
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-[#151E2E] rounded-2xl border border-dashed border-gray-800 text-gray-500">
                                    No custom resources found. Explore our standard tutorials.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DSA RECOMMENDED QUESTIONS ORDER */}
                    <div className="md:col-span-5 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                            <h2 className="text-2xl font-bold text-white">DSA Practice Sequence</h2>
                        </div>
                        <p className="text-sm text-gray-400 -mt-3">
                            🎯 Solve these recommended questions in order to lock in your learnings.
                        </p>

                        <div className="space-y-4">
                            {plan?.recommendedQuestions && plan.recommendedQuestions.length > 0 ? (
                                plan.recommendedQuestions.map((q, idx) => (
                                    <div
                                        key={q._id}
                                        className="p-5 rounded-2xl bg-[#151E2E] border border-gray-800 hover:border-emerald-500/30 transition-all flex items-center justify-between gap-4"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                                                    Step {idx + 1}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getDifficultyColor(q.difficulty)}`}>
                                                    {q.difficulty}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-white truncate text-base">
                                                {q.title}
                                            </h3>
                                            <span className="text-xs text-gray-500">
                                                {q.topic} • {q.points || 10} pts
                                            </span>
                                        </div>
                                        <Link
                                            to={`/problems/${q._id}`}
                                            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#0B1120] font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-colors"
                                        >
                                            Solve ⚡
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-[#151E2E] rounded-2xl border border-dashed border-gray-800 text-gray-500">
                                    No practice questions needed right now! Keep it up.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default StudyPlan;
