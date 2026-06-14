import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { challengesAPI, questionsAPI, studyPlanAPI } from '../lib/api';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { FaRobot, FaExternalLinkAlt, FaPlay, FaGraduationCap } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const Dashboard = () => {
    const { user } = useAuth();
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    // AI Coach Study Plan states
    const [plan, setPlan] = useState(null);
    const [planLoading, setPlanLoading] = useState(true);
    const [planError, setPlanError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch topics
            const topicsRes = await questionsAPI.getTopics();
            setTopics(topicsRes.data);
        } catch (error) {
            console.error('Error fetching dashboard topics:', error);
        }

        // Fetch AI Study Plan
        try {
            const planRes = await studyPlanAPI.get();
            setPlan(planRes.data);
        } catch (err) {
            console.error('Error fetching AI study plan:', err);
            setPlanError('Could not retrieve your customized study plan. Please try again.');
        } finally {
            setPlanLoading(false);
            setLoading(false);
        }
    };

    const handleRefreshPlan = async () => {
        setPlanLoading(true);
        setPlanError(null);
        try {
            const planRes = await studyPlanAPI.get();
            setPlan(planRes.data);
        } catch (err) {
            console.error('Error refreshing study plan:', err);
            setPlanError('Could not refresh study plan. Please try again.');
        } finally {
            setPlanLoading(false);
        }
    };

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

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-8">
                {/* AI Study Planner Component (Replaces Welcome Banner & Today's Challenge) */}
                <div className="relative overflow-hidden bg-[#151E2E] rounded-3xl p-6 border border-indigo-500/20 shadow-[0_0_25px_rgba(99,102,241,0.15)]">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
                    
                    {/* Header */}
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-gray-800 gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 shadow-inner">
                                <FaGraduationCap className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                                    AI Coach Planner <HiSparkles className="text-indigo-400 animate-pulse" />
                                </h3>
                                <span className="text-xs text-indigo-300 font-medium tracking-wide uppercase">
                                    Striver / take U forward resources
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleRefreshPlan}
                            disabled={planLoading}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                        >
                            Refresh Plan ⚡
                        </button>
                    </div>

                    {/* Loader */}
                    {planLoading && (
                        <div className="flex flex-col items-center justify-center py-16 space-y-4">
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <span className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></span>
                                <FaRobot className="text-indigo-400 text-lg" />
                            </div>
                            <p className="text-xs font-semibold text-gray-400">Updating study planner...</p>
                        </div>
                    )}

                    {/* Error */}
                    {planError && !planLoading && (
                        <div className="flex flex-col items-center justify-center text-center py-16 space-y-4">
                            <div className="text-rose-500 text-3xl">⚠️</div>
                            <p className="text-sm text-gray-300">{planError}</p>
                            <button
                                onClick={handleRefreshPlan}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Loaded Plan Contents */}
                    {plan && !planLoading && !planError && (
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Left Side: Coach Advice & Practice List (7 cols) */}
                            <div className="lg:col-span-7 space-y-6">
                                {/* Welcome back text + Motivational Text Block */}
                                <div className="relative bg-[#1E293B]/60 border border-slate-800 rounded-2xl p-5 shadow-inner">
                                    <h4 className="text-base font-bold text-white mb-2">
                                        Welcome back, {user?.name.split(' ')[0]}! 👋
                                    </h4>
                                    <div className="text-gray-300 leading-relaxed text-sm space-y-3">
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
                                                <span key={i} className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-300">
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
                                    <div className="space-y-2.5">
                                        {plan.recommendedQuestions && plan.recommendedQuestions.length > 0 ? (
                                            plan.recommendedQuestions.map((q, i) => (
                                                <Link
                                                    key={q._id}
                                                    to={`/problems/${q._id}`}
                                                    className="flex items-center justify-between p-3.5 bg-slate-900/60 hover:bg-[#1E293B]/70 border border-slate-800 hover:border-violet-500/20 rounded-2xl transition-all duration-200 group"
                                                >
                                                    <div className="flex items-center space-x-3.5 min-w-0">
                                                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 group-hover:text-indigo-400 transition-colors">
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
                                                    <div className="flex items-center space-x-3.5 flex-shrink-0">
                                                        <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${getDifficultyClass(q.difficulty)}`}>
                                                            {q.difficulty}
                                                        </span>
                                                        <span className="text-[11px] text-indigo-300 font-bold group-hover:scale-105 transition-transform">
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
                            <div className="lg:col-span-5 space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <span>🎥</span> Recommended take U forward Lectures
                                </h4>
                                <div className="space-y-4">
                                    {plan.resources && plan.resources.map((res, i) => (
                                        <div
                                            key={i}
                                            className="group flex flex-col bg-[#1E293B]/40 hover:bg-[#1E293B]/90 border border-slate-800 hover:border-indigo-500/30 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm"
                                        >
                                            {/* Large Video Thumbnail */}
                                            <a
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="relative block w-full h-40 overflow-hidden bg-slate-900 border-b border-slate-800"
                                            >
                                                {res.thumbnail ? (
                                                    <img
                                                        src={res.thumbnail}
                                                        alt={res.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 animate-fade-in"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                                                )}
                                                {/* Play Button Overlay */}
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-85 group-hover:bg-indigo-600/20 transition-all">
                                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg text-indigo-900 transform group-hover:scale-110 transition-transform">
                                                        <FaPlay className="text-[11px] translate-x-[2px]" />
                                                    </div>
                                                </div>
                                            </a>

                                            {/* Details */}
                                            <div className="p-4 space-y-1">
                                                <a
                                                    href={res.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block"
                                                >
                                                    <h5 className="text-xs font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                                                        {res.title} <FaExternalLinkAlt className="text-[9px] text-indigo-300" />
                                                    </h5>
                                                </a>
                                                <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
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

                {/* Topics Grid */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-violet-500 rounded-full"></div>
                        <h2 className="text-xl font-bold text-white">Explore Topics</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {topics.map((topic, i) => (
                            <Link
                                key={topic.name}
                                to={`/topics/${topic.name}`}
                                className="group bg-[#151E2E] p-6 rounded-2xl border border-gray-800 hover:border-violet-500/30 hover:bg-[#1A2538] transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <div className="w-16 h-16 rounded-full bg-indigo-400 blur-xl"></div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-100 mb-2 group-hover:text-violet-400 transition-colors">
                                    {topic.name}
                                </h3>

                                <div className="flex justify-between items-end mb-4">
                                    <div className="text-3xl font-bold text-white">
                                        {Math.round(topic.progress)}<span className="text-lg text-gray-500 font-medium">%</span>
                                    </div>
                                    <div className="text-xs text-gray-400 font-medium bg-gray-800 px-2 py-1 rounded-lg">
                                        {topic.solvedQuestions}/{topic.totalQuestions} Solved
                                    </div>
                                </div>

                                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 ease-out group-hover:shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                                        style={{ width: `${topic.progress}%` }}
                                    ></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
