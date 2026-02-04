import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login({ rollNumber, password });

            // Redirect based on first login status
            if (user.isFirstLogin) {
                navigate('/change-password');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B1120] relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Welcome Banner Modal */}
            {showWelcomeBanner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-500">
                    <div className="bg-[#151E2E] border border-indigo-500/30 w-full max-w-lg p-8 rounded-2xl shadow-2xl transform transition-all scale-100 animate-fade-in-up">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/25">
                                <span className="text-3xl">👋</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">Welcome to CodeArena</h2>
                            <p className="text-indigo-300 font-medium mb-6">
                                This application is only made for KMIT students and by KMIT students.
                            </p>

                            <div className="bg-[#0B1120]/50 p-5 rounded-xl border border-gray-700/50 mb-8 text-left">
                                <h3 className="text-gray-200 font-semibold mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Login Instructions
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Login through your <span className="text-white font-semibold">Roll No</span> and <span className="text-white font-semibold">Password</span>. For the first time, your password will be <strong>same as your Roll No</strong>, and then you will be asked to change it.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowWelcomeBanner(false)}
                                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
                            >
                                OK, Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-md w-full mx-4 relative z-10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-indigo-500/20 mx-auto mb-4">
                        C
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                        Code<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Arena</span>
                    </h1>
                    <p className="text-gray-400 text-lg">College Coding Platform</p>
                </div>

                <div className="bg-[#151E2E] rounded-2xl border border-gray-800 p-8 shadow-2xl">
                    <h2 className="text-xl font-bold mb-6 text-center text-white">
                        Student Login
                    </h2>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-medium flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">
                                Roll Number
                            </label>
                            <input
                                type="text"
                                value={rollNumber}
                                onChange={(e) => setRollNumber(e.target.value)}
                                className="w-full px-4 py-3 bg-[#0B1120] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
                                placeholder="Enter your roll number"
                                required
                                autoFocus
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-[#0B1120] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none"
                                placeholder="Enter your password"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 px-4 rounded-xl font-bold text-white transition-all transform duration-200 
                                ${loading
                                    ? 'bg-indigo-600/50 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging in...
                                </span>
                            ) : 'Login'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>First time login? You'll be asked to change your password.</p>
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-gray-600">
                    <p>&copy; {new Date().getFullYear()} CodeArena Platform</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
