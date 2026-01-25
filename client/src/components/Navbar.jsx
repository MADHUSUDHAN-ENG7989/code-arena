import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserSearch from './UserSearch';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ minimal = false }) => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'text-indigo-400' : 'text-gray-400 hover:text-indigo-300';
    };

    return (
        <nav className="bg-[#0B1120]/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <img
                            src="/website_logo.png"
                            alt="CodeArena Logo"
                            className="w-10 h-10 object-contain rounded-lg shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all"
                        />
                        <span className="text-xl font-bold text-white tracking-tight">
                            Code<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Arena</span>
                        </span>
                    </Link>

                    {/* Centered Search Bar */}
                    {!minimal && (
                        <div className="flex-1 max-w-xl mx-8 hidden md:block">
                            <UserSearch />
                        </div>
                    )}

                    <div className="flex items-center space-x-8">
                        {!minimal && (
                            <div className="hidden md:flex items-center space-x-6">
                                <Link
                                    to="/"
                                    className={`text-sm font-medium transition-colors ${isActive('/')}`}
                                >
                                    Dashboard
                                </Link>

                                <Link
                                    to="/arena"
                                    className={`text-sm font-medium transition-colors ${isActive('/arena')}`}
                                >
                                    Arena
                                </Link>

                                <Link
                                    to="/leaderboard"
                                    className={`text-sm font-medium transition-colors ${isActive('/leaderboard')}`}
                                >
                                    Leaderboard
                                </Link>



                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        className={`text-sm font-medium transition-colors ${isActive('/admin')}`}
                                    >
                                        Admin
                                    </Link>
                                )}
                            </div>
                        )}

                        <Link
                            to="/profile"
                            className="flex items-center space-x-3 pl-6 border-l border-gray-800 hover:opacity-80 transition-opacity"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-200">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-indigo-400 font-mono">
                                    {user?.rollNumber}
                                </p>
                            </div>
                        </Link>

                        <div className="flex items-center space-x-4">
                            <NotificationDropdown />
                            <button
                                onClick={handleLogout}
                                className="px-4 py-1.5 text-xs font-semibold text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-full hover:bg-rose-400/20 transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
