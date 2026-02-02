const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authMiddleware: protect } = require('../middleware/auth');
const { sendNotification } = require('../services/socketService');

// Get all notifications for current user
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('sender', 'name rollNumber'); // Populate basic info if needed

        // Fetch current user to check friend status
        const currentUser = await User.findById(req.userId).select('friends friendRequests');
        const friendIds = new Set(currentUser.friends.map(id => id.toString()));
        const requestStatusMap = new Map();
        if (currentUser.friendRequests) {
            currentUser.friendRequests.forEach(r => {
                if (r.from) requestStatusMap.set(r.from.toString(), r.status);
            });
        }

        // Process notifications to handle stale friend requests
        const processedNotifications = notifications.map(n => {
            if (n.type === 'friend_request' && n.sender) {
                const senderId = n.sender._id.toString();

                // If already friends, modify to show as accepted
                if (friendIds.has(senderId)) {
                    const nObj = n.toObject();
                    nObj.type = 'system';
                    nObj.message = 'Friend request accepted';
                    nObj.isRead = true; // Effectively read
                    return nObj;
                }

                // If explicitly rejected
                if (requestStatusMap.get(senderId) === 'rejected') {
                    const nObj = n.toObject();
                    nObj.type = 'system';
                    nObj.message = 'Friend request declined';
                    nObj.isRead = true;
                    return nObj;
                }

                // If status is accepted but somehow not in friends list yet (edge case)
                if (requestStatusMap.get(senderId) === 'accepted') {
                    const nObj = n.toObject();
                    nObj.type = 'system';
                    nObj.message = 'Friend request accepted';
                    nObj.isRead = true;
                    return nObj;
                }
            }
            return n;
        });

        // Recalculate unread count based on processed notifications
        // Note: This is an approximation. If we want true sync, we should update DB.
        // For now, we filter count based on what we return.
        const unreadCount = processedNotifications.filter(n => !n.isRead).length;

        res.json({ notifications: processedNotifications, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark a single notification as read
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.userId
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.isRead = true;
        await notification.save();

        res.json({ message: 'Marked as read', notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark all as read
router.put('/mark-all-read', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.userId, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Respond to friend request (This logic combines Notification + Social logic to keep it simple)
router.post('/friend-request/respond', protect, async (req, res) => {
    const { notificationId, action } = req.body; // action: 'accept' or 'reject'

    console.log('[FRIEND-REQUEST-RESPOND] Request received:', { notificationId, action, userId: req.userId });

    try {
        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: req.userId
        });

        console.log('[FRIEND-REQUEST-RESPOND] Notification found:', notification ? {
            id: notification._id,
            type: notification.type,
            sender: notification.sender,
            recipient: notification.recipient
        } : 'NOT FOUND');

        if (!notification || notification.type !== 'friend_request') {
            console.log('[FRIEND-REQUEST-RESPOND] Invalid notification - type:', notification?.type);
            return res.status(404).json({ message: 'Invalid friend request notification' });
        }

        const requesterId = notification.sender;
        const user = await User.findById(req.userId);
        const requester = await User.findById(requesterId);

        console.log('[FRIEND-REQUEST-RESPOND] Users lookup:', {
            userFound: !!user,
            requesterFound: !!requester,
            requesterId: requesterId?.toString(),
            userFriendRequestsCount: user?.friendRequests?.length
        });

        if (!user || !requester) {
            console.log('[FRIEND-REQUEST-RESPOND] User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the specific request in user's friendRequests array
        console.log('[FRIEND-REQUEST-RESPOND] FriendRequests array:', user.friendRequests.map(fr => ({
            from: fr.from?.toString(),
            status: fr.status
        })));

        const requestIndex = user.friendRequests.findIndex(
            r => r.from.toString() === requesterId.toString() && r.status === 'pending'
        );

        console.log('[FRIEND-REQUEST-RESPOND] Request index found:', requestIndex);

        if (requestIndex === -1) {
            // Even if not found in array (maybe already handled), we should update notification
            console.log('[FRIEND-REQUEST-RESPOND] Request not found - returning 400');
            notification.isRead = true;
            await notification.save();
            return res.status(400).json({ message: 'Friend request no longer pending' });
        }

        if (action === 'accept') {
            // Update status
            user.friendRequests[requestIndex].status = 'accepted';

            // Add to friends lists
            if (!user.friends.includes(requesterId)) {
                user.friends.push(requesterId);
            }
            if (!requester.friends.includes(user._id)) {
                requester.friends.push(user._id);
            }

            await requester.save();

            // Create a notification for the requester associated with acceptance
            await Notification.create({
                recipient: requesterId,
                sender: user._id,
                type: 'system',
                message: `${user.name} accepted your friend request!`,
                data: { link: `/profile/${user.rollNumber}` }
            });

            // Send real-time notification to requester
            sendNotification(requesterId, {
                type: 'system',
                message: `${user.name} accepted your friend request!`,
            });

        } else if (action === 'reject') {
            user.friendRequests[requestIndex].status = 'rejected';
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await user.save();

        // Update current notification
        notification.isRead = true;
        // Optionally delete it or keep it as history
        // await notification.deleteOne(); 
        await notification.save();

        res.json({ message: `Friend request ${action}ed` });

    } catch (error) {
        console.error('Error responding to friend request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
