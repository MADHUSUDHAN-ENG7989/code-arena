import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Pages
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import TopicDetail from './pages/TopicDetail';
import ProblemPage from './pages/ProblemPage';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import ArenaLobby from './pages/ArenaLobby';
import ArenaRoom from './pages/ArenaRoom';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';
import MeetTheDeveloper from './pages/MeetTheDeveloper';
import InvitationListener from './components/InvitationListener';
import MobileRestriction from './components/MobileRestriction';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function AppRoutes() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <>
            {isAuthenticated && <InvitationListener />}
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
                />

                {/* Protected Routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/change-password"
                    element={
                        <ProtectedRoute>
                            <ChangePassword />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/topics/:topic"
                    element={
                        <ProtectedRoute>
                            <TopicDetail />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/problems/:id"
                    element={
                        <ProtectedRoute>
                            <ProblemPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile/:id"
                    element={
                        <ProtectedRoute>
                            <UserProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/arena"
                    element={
                        <ProtectedRoute>
                            <ArenaLobby />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/arena/room/:roomId"
                    element={
                        <ProtectedRoute>
                            <ArenaRoom />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/leaderboard"
                    element={
                        <ProtectedRoute>
                            <Leaderboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/meet-the-developer"
                    element={
                        <ProtectedRoute>
                            <MeetTheDeveloper />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute adminOnly>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <SocketProvider>
                    <NotificationProvider>
                        <MobileRestriction>
                            <AppRoutes />
                        </MobileRestriction>
                    </NotificationProvider>
                </SocketProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
