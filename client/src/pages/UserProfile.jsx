import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { socialAPI } from '../lib/api';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requestSent, setRequestSent] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const response = await socialAPI.getPublicProfile(id);
            setProfileData(response.data);
            if (response.data.friendshipStatus === 'pending') {
                setRequestSent(true);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async () => {
        try {
            await socialAPI.sendFriendRequest(id);
            setRequestSent(true);
            // Optimistically update status
            setProfileData(prev => ({ ...prev, friendshipStatus: 'pending' }));
        } catch (error) {
            console.error('Error sending request:', error);
        }
    };

    const handleAcceptRequest = async () => {
        // Find the request ID? The backend 'getPublicProfile' doesn't return request ID easily unless we look it up.
        // For simplicity, maybe we just show "Friend Request Received" and let them go to their dashboard/profile to accept?
        // Or we should update backend to return requestId. 
        // For now, let's keep it simple: "Request Received" (Go to your profile to accept).
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

    if (!profileData) {
        return (
            <MainLayout>
                <div className="text-center text-white p-8">User not found</div>
            </MainLayout>
        );
    }

    const { user, mutualFriends, stats, friendshipStatus } = profileData;

    // Prepare heatmap data
    const heatmapValues = (stats.activeDays || []).map(date => ({ date, count: 1 }));

    return (
        <MainLayout>
            <div className="space-y-8 max-w-5xl mx-auto">
                {/* Header Card */}
                <div className="bg-[#151E2E] rounded-2xl border border-gray-800 p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg shadow-indigo-500/20">
                            {user.name.charAt(0)}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                                    <p className="text-gray-400 font-mono mb-4">@{user.rollNumber}</p>
                                </div>

                                <div className="flex gap-3">
                                    {friendshipStatus === 'none' && currentUser.rollNumber !== user.rollNumber && (
                                        <button
                                            onClick={handleSendRequest}
                                            disabled={requestSent}
                                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-indigo-500/20"
                                        >
                                            {requestSent ? 'Request Sent' : 'Add Friend'}
                                        </button>
                                    )}
                                    {friendshipStatus === 'friends' && (
                                        <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-bold">
                                            Friends
                                        </div>
                                    )}
                                    {friendshipStatus === 'pending' && (
                                        <div className="px-6 py-2 bg-gray-800 text-gray-400 rounded-lg font-bold border border-gray-700">
                                            Request Pending
                                        </div>
                                    )}
                                    {friendshipStatus === 'received' && (
                                        <div className="px-6 py-2 bg-amber-500/10 text-amber-400 rounded-lg font-bold border border-amber-500/20">
                                            Request Received
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="bg-[#0B1120] p-4 rounded-xl border border-gray-800">
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Score</div>
                                    <div className="text-xl font-bold text-white">{stats.score}</div>
                                </div>
                                <div className="bg-[#0B1120] p-4 rounded-xl border border-gray-800">
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Solved</div>
                                    <div className="text-xl font-bold text-white">{stats.solvedCount}</div>
                                </div>
                                <div className="bg-[#0B1120] p-4 rounded-xl border border-gray-800">
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Connections</div>
                                    <div className="text-xl font-bold text-white">{user.friends.length}</div>
                                </div>
                                <div className="bg-[#0B1120] p-4 rounded-xl border border-gray-800">
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Active Days</div>
                                    <div className="text-xl font-bold text-white">{stats.activeDays.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Activity Heatmap */}
                    <div className="md:col-span-2 bg-[#151E2E] rounded-2xl border border-gray-800 p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            Activity
                        </h2>
                        <div className="text-gray-400 text-sm">
                            {/* Basic Calendar Heatmap configuration */}
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

                    {/* Mutual Connections */}
                    <div className="bg-[#151E2E] rounded-2xl border border-gray-800 p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            Mutual Connections
                            <span className="bg-gray-800 text-xs px-2 py-1 rounded-full text-gray-400">{mutualFriends.length}</span>
                        </h2>

                        {mutualFriends.length > 0 ? (
                            <div className="space-y-4">
                                {mutualFriends.map(friend => (
                                    <div key={friend._id} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                                            {friend.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">{friend.name}</div>
                                            <div className="text-xs text-gray-500">{friend.rollNumber}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm text-center py-8">
                                No mutual connections found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default UserProfile;
