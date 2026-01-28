import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import api from '../lib/api';
import ToastNotification from '../components/ToastNotification';

const NotificationContext = createContext(null);

export const useNotifications = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const socket = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeToast, setActiveToast] = useState(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (!socket) return;

        socket.on('new_notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            setActiveToast(notification);

            // Play sound?
            // const audio = new Audio('/notification.mp3');
            // audio.play().catch(e => console.log('Audio play failed', e));
        });

        return () => {
            socket.off('new_notification');
        };
    }, [socket]);

    const markAsRead = async (notificationId) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n =>
                n._id === notificationId ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));

            await api.put(`/notifications/${notificationId}/read`);
        } catch (error) {
            console.error('Error marking read:', error);
            // Revert if needed, but low priority
        }
    };

    const markAllAsRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);

            await api.put('/notifications/mark-all-read');
        } catch (error) {
            console.error('Error marking all read:', error);
        }
    };

    const respondToFriendRequest = async (notificationId, action) => {
        try {
            await api.post('/notifications/friend-request/respond', { notificationId, action });

            // Mark as read locally and maybe remove specific actions if UI needs update
            markAsRead(notificationId);

            // Update the notification message locally to reflect action
            setNotifications(prev => prev.map(n => {
                if (n._id === notificationId) {
                    return {
                        ...n,
                        message: action === 'accept' ? 'Friend request accepted' : 'Friend request declined',
                        type: 'system' // Change type so buttons disappear
                    };
                }
                return n;
            }));

        } catch (error) {
            console.error('Error responding to friend request:', error);
            alert('Failed to respond to request');
        }
    };

    const value = {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        respondToFriendRequest
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {activeToast && (
                <ToastNotification
                    notification={activeToast}
                    onClose={() => setActiveToast(null)}
                />
            )}
        </NotificationContext.Provider>
    );
};
