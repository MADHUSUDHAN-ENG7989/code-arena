import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { studyPlanAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { FaRobot, FaTimes, FaExternalLinkAlt, FaPlay, FaGraduationCap } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const AICoachChatbot = () => {
    const { isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState(null);
    const [error, setError] = useState(null);
    const [loadingStage, setLoadingStage] = useState('');
    const contentRef = useRef(null);

    // Only load the plan if authenticated and requested
    const fetchStudyPlan = async (isRefresh = false) => {
        if (!isAuthenticated) return;
        
        setLoading(true);
        setError(null);
        
        // Progress stages for loading effect
        const stages = [
            'Analyzing submission records...',
            'Detecting weakest DSA concepts...',
            'Retrieving recommendations from Pinecone DB...',
            'Scraping YouTube lectures (take U forward)...',
            'Synthesizing personalized motivation...'
        ];
        
        let stageIdx = 0;
        setLoadingStage(stages[0]);
        const interval = setInterval(() => {
            if (stageIdx < stages.length - 1) {
                stageIdx++;
                setLoadingStage(stages[stageIdx]);
            }
        }, 1200);

        try {
            const res = await studyPlanAPI.get();
            setPlan(res.data);
        } catch (err) {
            console.error('Error fetching AI study plan:', err);
            setError('Could not retrieve your customized study plan. Please try again.');
        } finally {
            clearInterval(interval);
            setLoading(false);
        }
    };

    // Auto load on open if not already loaded
    useEffect(() => {
        if (isOpen && !plan && !loading && !error) {
            fetchStudyPlan();
        }
    }, [isOpen]);

    // Auto scroll to bottom when plan loads
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [plan, loading]);

    if (!isAuthenticated) return null;

    const getDifficultyClass = (diff) => {
        switch (diff) {
            case 'Easy':
                return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20';
            case 'Medium':
                return 'text-amber-400 bg-amber-400/10 border-amber-500/20';
            case 'Hard':
                return 'text-rose-400 bg-rose-400/10 border-rose-500/20';
            default:
                return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    return (
        <>
            {/* FLOATING ACTION BUTTON */}
            <div className="fixed bottom-6 right-6 z-50 font-sans">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 border border-white/10 hover:scale-105 active:scale-95 transition-all duration-300 ${
                        isOpen ? 'rotate-90' : ''
                    }`}
                    title="AI Study Coach"
                >
                    {/* Pulsing ring around button */}
                    <span className="absolute -inset-1 rounded-full bg-indigo-500/20 animate-ping opacity-75"></span>
                    
                    {isOpen ? (
                        <FaTimes className="text-xl" />
                    ) : (
                        <div className="relative">
                            <FaRobot className="text-2xl" />
                            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500 border border-slate-950 items-center justify-center text-[7px] font-bold text-white">
                                    SP
                                </span>
                            </span>
                        </div>
                    )}
                </button>
            </div>

            {/* FLOATING WINDOW */}
            <div
                className={`absolute top-0 right-0 w-full h-[580px] bg-[#0F172A]/98 backdrop-blur-xl rounded-3xl border border-indigo-500/35 flex flex-col shadow-[0_0_35px_rgba(99,102,241,0.45)] transition-all duration-300 transform origin-top-right z-40 ${
                    isOpen
                        ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                        : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-indigo-950/60 to-slate-900/80 rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                            <FaGraduationCap className="text-xl" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                AI Coach Planner <HiSparkles className="text-indigo-400 animate-pulse" />
                            </h3>
                            <span className="text-[10px] text-indigo-300 font-medium tracking-wide uppercase">
                                Striver / take U forward resources
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <FaTimes className="text-sm" />
                    </button>
                </div>

                {/* Content Container */}
                <div
                    ref={contentRef}
                    className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar text-sm"
                >
                    {/* Welcome/Static State */}
                    {!plan && !loading && !error && (
                        <div className="flex flex-col items-center justify-center text-center h-full space-y-4 py-8">
                            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-bounce">
                                <FaRobot className="text-3xl" />
                            </div>
                            <h4 className="text-base font-bold text-white">Need a dynamic DSA study plan?</h4>
                            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                                Our AI Agent scans your Code Arena submissions, identifies error patterns, queries the vector database, and gathers YouTube lessons from <b>take U forward</b>!
                            </p>
                            <button
                                onClick={() => fetchStudyPlan(false)}
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
                            >
                                Generate Study Plan ⚡
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <span className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></span>
                                <FaRobot className="text-indigo-400 text-lg" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-xs font-semibold text-gray-200">Constructing AI Agent Graph...</p>
                                <p className="text-[11px] text-indigo-400 animate-pulse">{loadingStage}</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="flex flex-col items-center justify-center text-center h-full space-y-4 py-8">
                            <div className="text-rose-500 text-3xl">⚠️</div>
                            <p className="text-xs text-gray-300 max-w-xs">{error}</p>
                            <button
                                onClick={() => fetchStudyPlan(true)}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Loaded Plan State */}
                    {plan && !loading && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            {/* Left Side: Coach Advice & Practice List (7 cols) */}
                            <div className="md:col-span-7 space-y-5">
                                {/* Motivational Text Block */}
                                <div className="relative bg-[#1E293B]/60 border border-slate-800 rounded-2xl p-4 shadow-inner">
                                    <div className="absolute top-3 left-4 flex items-center space-x-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Coach Narrative</span>
                                    </div>
                                    <div className="mt-5 text-gray-300 leading-relaxed text-xs space-y-2">
                                        {plan.motivation.split('\n\n').map((para, i) => (
                                            <p key={i} className="text-slate-300">
                                                {para.split('**').map((chunk, index) => 
                                                    index % 2 === 1 ? <strong key={index} className="text-indigo-300 font-bold">{chunk}</strong> : chunk
                                                )}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* Weak Topics Badges */}
                                {plan.weakTopics && plan.weakTopics.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Targeted Weak Areas</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {plan.weakTopics.map((topic, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-300">
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Practice Sequence */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <span>🎯</span> Next Practice Sequence
                                    </h4>
                                    <div className="space-y-2">
                                        {plan.recommendedQuestions && plan.recommendedQuestions.length > 0 ? (
                                            plan.recommendedQuestions.map((q, i) => (
                                                <Link
                                                    key={q._id}
                                                    to={`/problems/${q._id}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center justify-between p-3 bg-slate-900/60 hover:bg-[#1E293B]/70 border border-slate-800 hover:border-violet-500/20 rounded-xl transition-all duration-200 group"
                                                >
                                                    <div className="flex items-center space-x-3 min-w-0">
                                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 group-hover:text-indigo-400 transition-colors">
                                                            {i + 1}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h5 className="text-xs font-bold text-gray-200 truncate group-hover:text-white transition-colors">
                                                                {q.title}
                                                            </h5>
                                                            <span className="text-[10px] text-gray-400 font-medium">
                                                                {q.topic}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2.5 flex-shrink-0">
                                                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${getDifficultyClass(q.difficulty)}`}>
                                                            {q.difficulty}
                                                        </span>
                                                        <span className="text-[10px] text-indigo-300 font-bold group-hover:scale-105 transition-transform">
                                                            +{q.points || 10} pts
                                                        </span>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-gray-500 text-xs">
                                                No additional questions recommended right now.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: take U forward Lectures (5 cols) */}
                            <div className="md:col-span-5 space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <span>🎥</span> Recommended take U forward Lectures
                                </h4>
                                <div className="space-y-4">
                                    {plan.resources && plan.resources.map((res, i) => (
                                        <div
                                            key={i}
                                            className="group flex flex-col bg-[#1E293B]/40 hover:bg-[#1E293B]/90 border border-slate-800 hover:border-indigo-500/30 rounded-xl overflow-hidden transition-all duration-200"
                                        >
                                            {/* Large Video Thumbnail */}
                                            <a
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="relative block w-full h-36 overflow-hidden bg-slate-900 border-b border-slate-800"
                                            >
                                                {res.thumbnail ? (
                                                    <img
                                                        src={res.thumbnail}
                                                        alt={res.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">No Image</div>
                                                )}
                                                {/* Play Button Overlay */}
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-85 group-hover:bg-indigo-600/20 transition-all">
                                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg text-indigo-900 transform group-hover:scale-110 transition-transform">
                                                        <FaPlay className="text-[11px] translate-x-[2px]" />
                                                    </div>
                                                </div>
                                            </a>

                                            {/* Details */}
                                            <div className="p-3 space-y-1">
                                                <a
                                                    href={res.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block"
                                                >
                                                    <h5 className="text-xs font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                                                        {res.title} <FaExternalLinkAlt className="text-[8px] text-indigo-300" />
                                                    </h5>
                                                </a>
                                                <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                                                    {res.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {plan && !loading && (
                    <div className="p-3 border-t border-gray-800 bg-[#0A0F1D]/80 flex justify-between items-center rounded-b-2xl">
                        <span className="text-[10px] text-gray-500">
                            Updates live as you submit code.
                        </span>
                        <button
                            onClick={() => fetchStudyPlan(true)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-[10px] transition-colors"
                        >
                            Refresh Plan ⚡
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default AICoachChatbot;
