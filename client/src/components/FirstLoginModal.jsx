import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../lib/api';

const FirstLoginModal = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1 = T&C, 2 = Change Password
    const [accepted, setAccepted] = useState(false);

    // Check if we should show the modal
    if (!user || !user.isFirstLogin) return null;

    const handleAccept = () => {
        if (!accepted) return;
        setStep(2);
    };

    const handlePasswordChangeRedirect = () => {
        navigate('/change-password');
        // We don't close the modal here; the modal persists until isFirstLogin is false.
        // However, on the Change Password page, this modal might block the form.
        // STRATEGY: 
        // We will make this modal invisible on the '/change-password' route?
        // OR we just redirect and let the ChangePassword page handle the final 'isFirstLogin: false' update upon success.
    };

    // If on change-password page, don't show this blocking modal, 
    // allow the user to interact with the form.
    if (window.location.pathname === '/change-password') return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-[#151E2E] w-full max-w-2xl rounded-2xl border border-indigo-500/30 shadow-2xl overflow-hidden animate-fade-in-up">

                {step === 1 && (
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🤝</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Welcome to CodeArena!</h2>
                            <p className="text-gray-400">Before we begin, please review the following.</p>
                        </div>

                        <div className="bg-[#0B1120] p-6 rounded-xl border border-gray-800 mb-6 space-y-4 text-sm text-gray-300 max-h-60 overflow-y-auto custom-scrollbar">
                            <p><strong className="text-white">1. Exclusive Access:</strong> This application is designed exclusively for students of <strong className="text-indigo-400">KMIT (Keshav Memorial Institute of Technology)</strong>.</p>
                            <p><strong className="text-white">2. Competitive Integrity:</strong> The platform is built to foster healthy competition. Cheating, sharing solutions during active contests, or manipulating scores is strictly prohibited.</p>
                            <p><strong className="text-white">3. Privacy:</strong> Your performance data (leaderboard rankings, activity) is visible to other students to encourage competition.</p>
                            <p><strong className="text-white">4. Account Security:</strong> You are responsible for maintaining the security of your account. Do not share your credentials.</p>
                            <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-500/20 rounded-lg text-indigo-300">
                                By proceeding, you confirm that you are a KMIT student and agree to these terms.
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => setAccepted(!accepted)}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${accepted ? 'bg-indigo-500 border-indigo-500' : 'border-gray-600'}`}>
                                {accepted && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className="text-gray-300 select-none">I agree to the Terms and Conditions</span>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => logout()} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold transition-all">
                                Decline & Logout
                            </button>
                            <button
                                onClick={handleAccept}
                                disabled={!accepted}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${accepted ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🔒</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Security Update Required</h2>
                        <p className="text-gray-300 mb-8 max-w-md mx-auto">
                            To ensure your account is secure, we request you to kindly change your default password before accessing the complete application.
                        </p>

                        <button
                            onClick={handlePasswordChangeRedirect}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all transform hover:scale-[1.02]"
                        >
                            Change Password Now →
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default FirstLoginModal;
