const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authMiddleware: auth } = require('../middleware/auth');
const { sendNotification } = require('../services/socketService');

// Search users
router.get('/search', auth, async (req, res) => {
    try {
        console.log("Search request received. Query:", req.query.query);
        console.log("Authenticated User ID:", req.userId || 'N/A');

        const { query } = req.query;
        if (!query) return res.json([]);

        // Search by name or rollNumber, excluding current user
        const users = await User.find({
            $and: [
                { _id: { $ne: req.userId } },
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { rollNumber: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        })
            .select('name rollNumber email score solvedQuestions isFirstLogin')
            .limit(10);

        console.log(`Found ${users.length} users.`);
        res.json(users);
    } catch (error) {
        console.error('Search error details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send friend request
router.post('/friend-request/:userId', auth, async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.userId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already friends
        if (targetUser.friends.includes(req.userId)) {
            return res.status(400).json({ message: 'Already friends' });
        }

        // Check if request already sent
        const existingRequest = targetUser.friendRequests.find(
            r => r.from.toString() === req.userId.toString() && r.status === 'pending'
        );

        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already sent' });
        }

        targetUser.friendRequests.push({
            from: req.userId,
            status: 'pending'
        });

        await targetUser.save();


        // Create Notification
        const notification = await Notification.create({
            recipient: targetUser._id,
            sender: req.userId,
            type: 'friend_request',
            message: 'sent you a friend request',
            data: {
                senderName: req.user?.name // Might need to fetch user name if not in req
            }
        });

        // We need sender name for the notification message/data
        const senderPayload = await User.findById(req.userId).select('name rollNumber');

        // Update notification with correct message if needed or just rely on populated sender
        // Let's send real-time update
        sendNotification(targetUser._id.toString(), {
            _id: notification._id,
            type: 'friend_request',
            message: `${senderPayload.name} sent you a friend request`,
            sender: senderPayload,
            createdAt: new Date()
        });

        res.json({ message: 'Friend request sent' });
    } catch (error) {
        console.error('Friend request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Accept/Reject friend request
router.put('/friend-request/:requestId', auth, async (req, res) => {
    try {
        const { action } = req.body; // 'accept' or 'reject'
        const user = await User.findById(req.userId);

        const request = user.friendRequests.id(req.params.requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (action === 'accept') {
            request.status = 'accepted';

            // Add to both users' friend lists
            user.friends.push(request.from);

            const sender = await User.findById(request.from);
            if (sender) {
                sender.friends.push(user._id);
                await sender.save();
            }
        } else {
            request.status = 'rejected';
        }

        // Remove the request from the list after processing (cleaner)
        user.friendRequests.pull(req.params.requestId);

        await user.save();
        res.json({ message: `Friend request ${action}ed` });
    } catch (error) {
        console.error('Handle request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get specific user profile (public info + mutuals)
router.get('/profile/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = await User.findById(req.userId);
        const targetUser = await User.findById(userId)
            .select('-password -__v')
            .populate('friends', 'name rollNumber')
            .populate('solvedQuestions', 'title difficulty'); // Minimal info

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate Mutual Friends
        const currentUserFriendIds = currentUser.friends.map(id => id.toString());
        const mutualFriends = targetUser.friends.filter(friend =>
            currentUserFriendIds.includes(friend._id.toString())
        );

        // Check friendship status
        let friendshipStatus = 'none'; // none, pending, friends
        if (currentUser.friends.includes(targetUser._id)) {
            friendshipStatus = 'friends';
        } else if (targetUser.friendRequests.some(r => r.from.toString() === currentUser._id.toString())) {
            friendshipStatus = 'pending';
        } else if (currentUser.friendRequests.some(r => r.from.toString() === targetUser._id.toString())) {
            friendshipStatus = 'received'; // Received request from them
        }

        res.json({
            user: targetUser,
            mutualFriends,
            friendshipStatus,
            stats: {
                solvedCount: targetUser.solvedQuestions.length,
                score: targetUser.score,
                activeDays: targetUser.activeDays || [] // Ensure activeDays exists
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get friend list (with details)
router.get('/friends', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate('friends', 'name rollNumber score solvedQuestions')
            .populate('friendRequests.from', 'name rollNumber');

        const pendingRequests = user.friendRequests.filter(r => r.status === 'pending');

        res.json({
            friends: user.friends,
            requests: pendingRequests
        });
    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
