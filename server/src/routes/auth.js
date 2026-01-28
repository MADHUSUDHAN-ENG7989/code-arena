const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { rollNumber, password } = req.body;

        if (!rollNumber || !password) {
            return res.status(400).json({ message: 'Please provide roll number and password' });
        }

        const user = await User.findOne({ rollNumber });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-site (Vercel -> Render)
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            user: {
                id: user._id,
                rollNumber: user.rollNumber,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isFirstLogin: user.isFirstLogin,
                score: user.score,
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change password
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // For first login, we might not require current password
        if (!user.isFirstLogin) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required' });
            }

            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
        }

        user.password = newPassword;
        user.isFirstLogin = false;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
