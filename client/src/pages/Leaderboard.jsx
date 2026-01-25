import React, { useState, useEffect } from 'react';
import { challengesAPI } from '../lib/api';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../contexts/AuthContext';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const [timeframe, setTimeframe] = useState('weekly');

    useEffect(() => {
        fetchLeaderboard();
    }, [timeframe]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const response = await challengesAPI.getLeaderboard(timeframe);
            setLeaderboard(response.data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankStyle = (rank) => {
        if (rank === 1) return 'from-yellow-500/20 to-yellow-600/5 text-yellow-400 border-yellow-500/30';
        if (rank === 2) return 'from-gray-300/20 to-gray-400/5 text-gray-300 border-gray-400/30';
        if (rank === 3) return 'from-orange-500/20 to-orange-600/5 text-orange-400 border-orange-500/30';
        return 'from-gray-700/20 to-gray-700/5 text-gray-400 border-gray-700/30';
    };

    const getTrophyIcon = (rank) => {
        if (rank === 1) return '👑';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-[#2A2A2A] border-t-emerald-500 rounded-full animate-spin"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                            Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Leaderboard</span>
                        </h1>
                        <p className="text-gray-400 flex items-center gap-2">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Updates live based on score & efficiency
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-[#2A2A2A] p-1 rounded-lg">
                        <button
                            onClick={() => setTimeframe('weekly')}
                            className={`px-4 py-1.5 text-xs font-medium rounded shadow-sm transition-colors ${timeframe === 'weekly' ? 'bg-[#3C3C3C] text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setTimeframe('all_time')}
                            className={`px-4 py-1.5 text-xs font-medium rounded shadow-sm transition-colors ${timeframe === 'all_time' ? 'bg-[#3C3C3C] text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            All Time
                        </button>
                    </div>
                </div >

                {/* Top 3 Cards (Hidden on mobile for list view preference, or stack them) */}
                < div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" >
                    {/* Rank 2 */}
                    {
                        leaderboard[1] && (
                            <div className="hidden md:flex flex-col items-center justify-end">
                                <div className="relative w-full bg-[#1E1E1E] rounded-2xl p-6 border border-[#2A2A2A] flex flex-col items-center transform translate-y-4">
                                    <div className="absolute -top-6 w-12 h-12 rounded-full border-4 border-[#1E1E1E] bg-gray-300 flex items-center justify-center text-xl shadow-lg z-10">
                                        🥈
                                    </div>
                                    <div className="mt-8 text-center">
                                        <div className="font-bold text-white text-lg">{leaderboard[1].name}</div>
                                        <div className="text-sm text-gray-500 mb-4">{leaderboard[1].rollNumber}</div>
                                        <div className="text-2xl font-bold text-emerald-400">{leaderboard[1].totalScore} <span className="text-xs text-gray-500 font-normal">pts</span></div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {/* Rank 1 */}
                    {
                        leaderboard[0] && (
                            <div className="hidden md:flex flex-col items-center">
                                <div className="relative w-full bg-gradient-to-b from-[#2A2A2A] to-[#1E1E1E] rounded-2xl p-6 border border-yellow-500/20 flex flex-col items-center shadow-2xl shadow-yellow-500/5 z-10">
                                    <div className="absolute -top-8 w-16 h-16 rounded-full border-4 border-[#1E1E1E] bg-yellow-400 flex items-center justify-center text-3xl shadow-lg z-10">
                                        👑
                                    </div>
                                    <div className="mt-8 text-center">
                                        <div className="font-bold text-white text-xl">{leaderboard[0].name}</div>
                                        <div className="text-sm text-yellow-500/70 mb-4">{leaderboard[0].rollNumber}</div>
                                        <div className="text-3xl font-bold text-yellow-400">{leaderboard[0].totalScore} <span className="text-xs text-gray-400 font-normal">pts</span></div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {/* Rank 3 */}
                    {
                        leaderboard[2] && (
                            <div className="hidden md:flex flex-col items-center justify-end">
                                <div className="relative w-full bg-[#1E1E1E] rounded-2xl p-6 border border-[#2A2A2A] flex flex-col items-center transform translate-y-8">
                                    <div className="absolute -top-6 w-12 h-12 rounded-full border-4 border-[#1E1E1E] bg-orange-400 flex items-center justify-center text-xl shadow-lg z-10">
                                        🥉
                                    </div>
                                    <div className="mt-8 text-center">
                                        <div className="font-bold text-white text-lg">{leaderboard[2].name}</div>
                                        <div className="text-sm text-gray-500 mb-4">{leaderboard[2].rollNumber}</div>
                                        <div className="text-2xl font-bold text-emerald-400">{leaderboard[2].totalScore} <span className="text-xs text-gray-500 font-normal">pts</span></div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div >

                {/* Main Table */}
                < div className="bg-[#1E1E1E] rounded-xl border border-[#2A2A2A] overflow-hidden" >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#252525] border-b border-[#2A2A2A]">
                                    <th className="text-left py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Rank</th>
                                    <th className="text-left py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Student</th>
                                    <th className="text-center py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Solved</th>
                                    <th className="text-right py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2A2A2A]">
                                {leaderboard.map((entry) => (
                                    <tr
                                        key={entry.rollNumber}
                                        className={`group transition-all hover:bg-[#2A2A2A] ${entry.rollNumber === user?.rollNumber ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : ''}`}
                                    >
                                        <td className="py-4 px-6">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-md border bg-gradient-to-br ${getRankStyle(entry.rank)}`}>
                                                {getTrophyIcon(entry.rank)}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-[#3C3C3C] flex items-center justify-center text-sm font-bold text-gray-300 border border-[#4C4C4C]">
                                                    {entry.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-200 group-hover:text-white transition-colors flex items-center gap-2">
                                                        {entry.name}
                                                        {entry.rollNumber === user?.rollNumber && (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">YOU</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono mt-0.5">{entry.rollNumber}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2A2A2A] border border-[#3C3C3C]">
                                                <span className="text-emerald-400 font-bold">{entry.totalSolved}</span>
                                                <span className="text-xs text-gray-500">problems</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-white text-lg tracking-tight">
                                                    {entry.totalScore.toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div >
            </div >
        </MainLayout >
    );
};

export default Leaderboard;
