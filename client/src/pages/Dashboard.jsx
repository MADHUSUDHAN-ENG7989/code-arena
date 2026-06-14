import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { challengesAPI, questionsAPI } from '../lib/api';

import MainLayout from '../components/MainLayout';

import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [dailyChallenge, setDailyChallenge] = useState(null);
    const [topics, setTopics] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]); // Needed for rank display
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [challengeRes, leaderboardRes, topicsRes] = await Promise.all([
                challengesAPI.getDaily(),
                challengesAPI.getLeaderboard(),
                questionsAPI.getTopics(),
            ]);

            setDailyChallenge(challengeRes.data.challenge);
            setTopics(topicsRes.data);
            setLeaderboard(leaderboardRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
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
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-8">


                {/* Welcome Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-3xl font-bold text-white mb-2">
                                Welcome back, {user?.name.split(' ')[1] || user?.name.split(' ')[0]}! 👋
                            </h1>
                            <p className="text-indigo-100 max-w-xl text-lg">
                                Ready to crack some code today? You've solved <span className="font-bold text-white">{user?.solvedQuestions?.length || 0}</span> problems so far.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[100px] text-center border border-white/10">
                                <div className="text-xs text-indigo-200 uppercase tracking-widest font-semibold mb-1">Score</div>
                                <div className="text-3xl font-bold text-white">{user?.score || 0}</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[100px] text-center border border-white/10">
                                <div className="text-xs text-indigo-200 uppercase tracking-widest font-semibold mb-1">Rank</div>
                                <div className="text-3xl font-bold text-white">#{leaderboard.find(u => u.rollNumber === user?.rollNumber)?.rank || '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Meet The Developer Link */}
                    <div className="relative z-10 mt-6 text-right">
                        <Link
                            to="/meet-the-developer"
                            className="inline-flex items-center gap-2 text-indigo-200 hover:text-white transition-colors group"
                        >
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                            </span>
                            <span className="text-sm font-medium tracking-wide animate-pulse hover:animate-none shadow-indigo-500/50" style={{ textShadow: '0 0 10px rgba(99, 102, 241, 0.5)' }}>
                                Curious who built this? <span className="underline decoration-indigo-500/50 underline-offset-4 decoration-2 group-hover:decoration-indigo-400">Meet the Developer</span>
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Daily Challenge Section */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                        <h2 className="text-xl font-bold text-white">Today's Challenge</h2>
                    </div>

                    {
                        dailyChallenge ? (
                            <div className="group relative bg-[#151E2E] rounded-2xl p-1 border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-violet-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="relative p-6 flex flex-col md:flex-row items-center gap-8">
                                    {/* Date/Icon */}
                                    <div className="flex-shrink-0 text-center">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex flex-col items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                                                {new Date().toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="text-3xl font-bold">
                                                {new Date().getDate()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(dailyChallenge.questionId.difficulty)}`}>
                                                {dailyChallenge.questionId.difficulty}
                                            </span>
                                            <span className="text-gray-400 text-sm flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                                                {dailyChallenge.questionId.topic}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                                            {dailyChallenge.questionId.title}
                                        </h3>
                                        <p className="text-gray-400 line-clamp-2 mb-4 text-sm">
                                            {dailyChallenge.questionId.description}
                                        </p>
                                    </div>

                                    {/* Action */}
                                    <div className="flex-shrink-0">
                                        <Link
                                            to={`/problems/${dailyChallenge.questionId._id}`}
                                            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-indigo-900 font-bold hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
                                        >
                                            Solve Now ⚡
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-[#151E2E] rounded-2xl border border-dashed border-gray-700 text-gray-500">
                                No challenge active for today
                            </div>
                        )
                    }
                </div >

                {/* Topics Grid */}
                < div >
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
                </div >
            </div >
        </MainLayout >
    );
};

export default Dashboard;
