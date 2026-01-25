import React, { useState, useEffect } from 'react';

const FullScreenPrompt = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [status, setStatus] = useState('prompt'); // 'prompt' | 'success'

    useEffect(() => {
        // Check if already shown this session
        const hasSeenPrompt = sessionStorage.getItem('hasSeenFullScreenPrompt');
        if (hasSeenPrompt) return;

        // Show after a small delay (e.g., 2 seconds) to avoid overwhelming login
        const timer = setTimeout(() => {
            if (!document.fullscreenElement) {
                setIsVisible(true);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('hasSeenFullScreenPrompt', 'true');
    };

    const handleEnableFullScreen = async () => {
        try {
            await document.documentElement.requestFullscreen();
            setStatus('success');

            // Dissolve after showing the exit message
            setTimeout(() => {
                setIsVisible(false);
                sessionStorage.setItem('hasSeenFullScreenPrompt', 'true');
            }, 3000);
        } catch (err) {
            console.error("Error attempting to enable full-screen mode:", err.message);
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed top-4 right-4 z-[9999] max-w-sm w-full transition-all duration-500 ease-in-out ${status === 'success' ? 'opacity-90' : 'opacity-100'}`}>
            <div className="bg-[#151E2E]/90 backdrop-blur-md border border-indigo-500/30 rounded-xl shadow-2xl p-4 relative overflow-hidden group">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

                {status === 'prompt' ? (
                    <>
                        <button
                            onClick={handleClose}
                            className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0">
                                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-sm mb-1">Minimize Distractions</h3>
                                <p className="text-gray-400 text-xs mb-3">Enable full screen mode for better focus while coding.</p>
                                <button
                                    onClick={handleEnableFullScreen}
                                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    Enable Full Screen
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-2 animate-in fade-in duration-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <svg className="w-8 h-8 text-emerald-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <h3 className="text-white font-medium text-sm">Full Screen Enabled</h3>
                            <p className="text-gray-400 text-xs">Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 font-mono">ESC</kbd> to exit anytime</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FullScreenPrompt;
