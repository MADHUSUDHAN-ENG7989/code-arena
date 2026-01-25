import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../lib/api';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await authAPI.changePassword({
                currentPassword: user?.isFirstLogin ? undefined : currentPassword,
                newPassword,
            });

            // Update user state to reflect password change
            if (user) {
                updateUser({ ...user, isFirstLogin: false });
            }

            alert('Password changed successfully!');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
            <div className="max-w-md w-full">
                <div className="card">
                    <h2 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-white">
                        {user?.isFirstLogin ? 'Set New Password' : 'Change Password'}
                    </h2>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                        {user?.isFirstLogin
                            ? 'Please set a new password for your account'
                            : 'Update your password'}
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {!user?.isFirstLogin && (
                            <div className="mb-4">
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter current password"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Enter new password (min 6 characters)"
                                required
                                autoFocus
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Confirm new password"
                                required
                                autocomplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
