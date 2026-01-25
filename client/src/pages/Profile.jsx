import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/MainLayout';
import { submissionsAPI, socialAPI } from '../lib/api';

const getVerdictColor = (verdict) => {
    switch (verdict?.toLowerCase()) {
        case 'accepted': return 'text-green-400 border-green-500/30 bg-green-500/10';
        case 'wrong answer': return 'text-red-400 border-red-500/30 bg-red-500/10';
        case 'time limit exceeded': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
        case 'compilation error': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
        default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const Profile = () => {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState([]);
    const [friends, setFriends] = useState([]);
    const [activeDays, setActiveDays] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user?._id) return;
            try {
                const [submissionsRes, friendsRes, profileRes] = await Promise.all([
                    submissionsAPI.getAllHistory(),
                    socialAPI.getFriends(),
                    socialAPI.getPublicProfile(user._id)
                ]);
                setSubmissions(submissionsRes.data || []);
                setFriends(friendsRes.data?.friends || []);
                setActiveDays(profileRes.data?.stats?.activeDays || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user?._id]);



    // Calculate heatmap values based on submissions
    const heatmapValues = useMemo(() => {
        const counts = {};
        submissions.forEach(sub => {
            if (sub.submittedAt) {
                const date = new Date(sub.submittedAt).toISOString().split('T')[0];
                counts[date] = (counts[date] || 0) + 1;
            }
        });

        return Object.entries(counts).map(([date, count]) => ({ date, count }));
    }, [submissions]);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="relative bg-[#151E2E] rounded-2xl border border-gray-800 p-8 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-indigo-500/20">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white mb-2">{user?.name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                                <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700 font-mono">
                                    {user?.rollNumber}
                                </span>
                                {user?.email && (
                                    <span className="text-gray-400 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        {user.email}
                                    </span>
                                )}
                            </div>
                            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                                <Link
                                    to="/change-password"
                                    className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm font-medium border border-gray-700"
                                >
                                    Change Password
                                </Link>
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#0B1120] p-4 rounded-xl border border-gray-800 text-center min-w-[100px]">
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Score</div>
                                <div className="text-2xl font-bold text-white">{user?.score || 0}</div>
                            </div>
                            <div className="bg-[#0B1120] p-4 rounded-xl border border-gray-800 text-center min-w-[100px]">
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Solved</div>
                                <div className="text-2xl font-bold text-white">{user?.solvedQuestions?.length || 0}</div>
                            </div>
                            <div className="bg-[#0B1120] p-4 rounded-xl border border-gray-800 text-center min-w-[100px]">
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Friends</div>
                                <div className="text-2xl font-bold text-white">{friends.length}</div>
                            </div>
                            <div className="bg-[#0B1120] p-4 rounded-xl border border-gray-800 text-center min-w-[100px]">
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Active</div>
                                <div className="text-2xl font-bold text-white">{activeDays.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Heatmap Wrapper */}
                    <div className="mt-8 pt-8 border-t border-gray-800">
                        <h3 className="text-lg font-bold text-white mb-4">Activity Log</h3>
                        <div className="h-32">
                            <CalendarHeatmap
                                startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                                endDate={new Date()}
                                values={heatmapValues}
                                classForValue={(value) => {
                                    if (!value) {
                                        return 'color-empty';
                                    }
                                    return `color-scale-${Math.min(value.count, 4)}`;
                                }}
                                tooltipDataAttrs={value => {
                                    return {
                                        'data-tip': `${value.date} has count: ${value.count}`,
                                    };
                                }}
                                showWeekdayLabels={true}
                            />
                            <style>{`
                                .react-calendar-heatmap text { font-size: 10px; fill: #9ca3af; }
                                .react-calendar-heatmap .color-empty { fill: #1f2937; rx: 2px; ry: 2px; }
                                .react-calendar-heatmap .color-scale-1 { fill: #0e4429; }
                                .react-calendar-heatmap .color-scale-2 { fill: #006d32; }
                                .react-calendar-heatmap .color-scale-3 { fill: #26a641; }
                                .react-calendar-heatmap .color-scale-4 { fill: #39d353; }
                                rect { rx: 3px; ry: 3px; }
                            `}</style>
                        </div>
                    </div>
                </div>

                {/* Submissions History */}
                <div className="bg-[#151E2E] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-indigo-400">📝</span> Submission History
                        </h2>
                        <span className="text-sm text-gray-500 font-medium bg-gray-900 px-3 py-1 rounded-full">
                            {submissions.length} Total
                        </span>
                    </div>

                    {submissions.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600 text-2xl">⚡</div>
                            <h3 className="text-lg font-medium text-white mb-2">No submissions yet</h3>
                            <p className="text-gray-400 mb-6">Start solving problems to build your history!</p>
                            <Link to="/" className="inline-flex px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors">
                                Explore Problems
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-900/50 text-left">
                                        <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Problem</th>
                                        <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Verdict</th>
                                        <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Language</th>
                                        <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Time</th>
                                        <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {submissions.map((submission) => (
                                        <tr key={submission._id} className="hover:bg-indigo-500/5 transition-colors">
                                            <td className="py-4 px-6">
                                                <Link
                                                    to={`/problems/${submission.questionId?._id}`}
                                                    className="font-medium text-indigo-400 hover:text-indigo-300"
                                                >
                                                    {submission.questionId?.title || 'Unknown Problem'}
                                                </Link>
                                                <div className="text-xs text-gray-500 mt-0.5">{submission.questionId?.topic}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getVerdictColor(submission.verdict)}`}>
                                                    {submission.verdict}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm text-gray-300 font-mono bg-gray-800 px-2 py-1 rounded">
                                                    {submission.language}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-400 font-mono">
                                                {submission.runtime ? `${submission.runtime}ms` : '-'}
                                            </td>
                                            <td className="py-4 px-6 text-right text-sm text-gray-500">
                                                {formatDate(submission.submittedAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Profile;
