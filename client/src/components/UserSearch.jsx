import React, { useState, useEffect } from 'react';
import { socialAPI } from '../lib/api';
import { Link } from 'react-router-dom';

const UserSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [requestSent, setRequestSent] = useState({}); // Track sent requests by userId
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                handleSearch();
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSearch = async () => {
        setLoading(true);
        setShowDropdown(true);
        try {
            const response = await socialAPI.searchUsers(query);
            setResults(response.data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (userId) => {
        try {
            await socialAPI.sendFriendRequest(userId);
            setRequestSent(prev => ({ ...prev, [userId]: true }));
        } catch (error) {
            console.error('Friend request error:', error);
            alert(error.response?.data?.message || 'Failed to send request');
        }
    };

    return (
        <div className="w-full relative z-50" ref={searchRef}>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-400 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    className="block w-full pl-9 pr-3 py-2 bg-[#1A2538] border border-gray-700/50 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200"
                    placeholder="Search users..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                />

                {/* Results Dropdown */}
                {showDropdown && (results.length > 0 || (query && loading)) && (
                    <div className="absolute mt-2 w-full bg-[#151E2E] rounded-xl border border-gray-800 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
                        ) : (
                            <ul className="divide-y divide-gray-800/50 max-h-96 overflow-y-auto">
                                {results.map((user) => (
                                    <li key={user._id} className="hover:bg-indigo-500/5 transition-colors">
                                        <div className="px-4 py-3 flex items-center justify-between">
                                            <Link
                                                to={`/profile/${user._id}`}
                                                className="flex items-center gap-3 flex-1"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">{user.name}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{user.rollNumber}</div>
                                                </div>
                                            </Link>

                                            <button
                                                onClick={() => handleSendRequest(user._id)}
                                                disabled={requestSent[user._id]}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${requestSent[user._id]
                                                    ? 'bg-emerald-500/10 text-emerald-400 cursor-default'
                                                    : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20'
                                                    }`}
                                            >
                                                {requestSent[user._id] ? 'Request Sent' : 'Add Friend'}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserSearch;
