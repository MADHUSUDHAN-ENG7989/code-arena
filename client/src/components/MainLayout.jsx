import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { challengesAPI } from '../lib/api';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import FirstLoginModal from './FirstLoginModal';
import FullScreenPrompt from './FullScreenPrompt';

const MainLayout = ({ children, minimal = false }) => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!minimal) {
            fetchData();
        }
    }, [minimal]);

    const fetchData = async () => {
        try {
            const leaderboardRes = await challengesAPI.getLeaderboard();
            setLeaderboard(leaderboardRes.data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mocking more leaderboard users for visual demo if list is short
    const displayLeaderboard = leaderboard.length < 5
        ? [...leaderboard, ...Array(10).fill(null).map((_, i) => ({
            rollNumber: `MOCK${i}`,
            name: `Student ${i + 1}`,
            rank: leaderboard.length + i + 1,
            weeklySolved: Math.floor(Math.random() * 10),
            totalScore: Math.floor(Math.random() * 100)
        }))]
        : leaderboard;

    return (
        <div className="min-h-screen bg-[#0B1120] text-gray-100 font-sans selection:bg-indigo-500/30">
            <Navbar minimal={minimal} />
            <FirstLoginModal />
            <FullScreenPrompt />


            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className={`grid grid-cols-1 ${minimal ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-8`}>

                    {/* LEFT COLUMN: Leaderboard (4 cols) - Sticky/Fixed */}
                    {!minimal && (
                        <div className="hidden lg:block lg:col-span-4 lg:h-[calc(100vh-100px)] lg:sticky lg:top-24">
                            <div className="bg-[#151E2E] rounded-2xl border border-gray-800 shadow-xl overflow-hidden h-full flex flex-col">
                                <div className="p-5 border-b border-gray-800 bg-gradient-to-r from-indigo-900/50 to-[#151E2E]">
                                    <h2 className="text-xl font-bold flex items-center text-white">
                                        <span className="text-2xl mr-2">🏆</span> Leaderboard
                                    </h2>
                                    <p className="text-xs text-indigo-300 mt-1 font-medium tracking-wide uppercase">Weekly Top Performers</p>
                                </div>

                                <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                                    {loading ? (
                                        <div className="p-4 text-center text-gray-500">Loading...</div>
                                    ) : (
                                        displayLeaderboard.map((entry, index) => (
                                            <div
                                                key={entry.rollNumber}
                                                className={`flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5 group ${entry.rollNumber === user?.rollNumber ? 'bg-indigo-600/20 border border-indigo-500/30' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className={`
                            w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm
                            ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50' :
                                                            entry.rank === 2 ? 'bg-gray-400/20 text-gray-300 ring-1 ring-gray-400/50' :
                                                                entry.rank === 3 ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50' :
                                                                    'bg-gray-800 text-gray-500'}
                          `}>
                                                        {entry.rank}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`text-sm font-medium truncate ${entry.rollNumber === user?.rollNumber ? 'text-indigo-300' : 'text-gray-200'}`}>
                                                            {entry.name}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500">
                                                            {entry.rollNumber}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right pl-2">
                                                    <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                                                        {entry.totalScore}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500">
                                                        pts
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="p-3 border-t border-gray-800 bg-[#151E2E]">
                                    <Link
                                        to="/leaderboard"
                                        className="block w-full py-2 text-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20 rounded-lg transition-all"
                                    >
                                        View Full Rankings
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RIGHT COLUMN: Content (8 cols) */}
                    <div className={`${minimal ? 'lg:col-span-1 md:mx-auto md:max-w-4xl' : 'lg:col-span-8'} w-full`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
