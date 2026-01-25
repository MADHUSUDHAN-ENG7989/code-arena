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

        const unreadCount = await Notification.countDocuments({
            recipient: req.userId,
            isRead: false
        });

        res.json({ notifications, unreadCount });
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

    try {
        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: req.userId
        });

        if (!notification || notification.type !== 'friend_request') {
            return res.status(404).json({ message: 'Invalid friend request notification' });
        }

        const requesterId = notification.sender;
        const user = await User.findById(req.userId);
        const requester = await User.findById(requesterId);

        if (!user || !requester) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the specific request in user's friendRequests array
        const requestIndex = user.friendRequests.findIndex(
            req => req.from.toString() === requesterId.toString() && req.status === 'pending'
        );

        if (requestIndex === -1) {
            // Even if not found in array (maybe already handled), we should update notification
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
