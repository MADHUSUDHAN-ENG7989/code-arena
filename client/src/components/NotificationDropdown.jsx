import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, respondToFriendRequest } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        // Navigate if data.link exists
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleBellClick}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Notifications"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-[#151E2E] border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-[#1A2333]">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-800/50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`p-4 hover:bg-white/5 transition-colors ${!notification.isRead ? 'bg-indigo-500/5' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Icon based on type */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notification.type === 'friend_request' ? 'bg-indigo-500/20 text-indigo-400' :
                                                    notification.type === 'event' ? 'bg-purple-500/20 text-purple-400' :
                                                        'bg-gray-700/50 text-gray-400'
                                                }`}>
                                                {notification.type === 'friend_request' ? '👥' :
                                                    notification.type === 'event' ? '📅' : '🔔'}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-200">
                                                    <span className="font-semibold">{notification.sender?.name}</span> {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(notification.createdAt).toLocaleDateString()}
                                                </p>

                                                {/* Friend Request Actions */}
                                                {notification.type === 'friend_request' && (
                                                    <div className="flex gap-2 mt-3">
                                                        <button
                                                            onClick={() => respondToFriendRequest(notification._id, 'accept')}
                                                            className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => respondToFriendRequest(notification._id, 'reject')}
                                                            className="flex-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-lg transition-colors"
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {!notification.isRead && (
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
