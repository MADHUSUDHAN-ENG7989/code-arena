import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ToastNotification = ({ notification, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for animation
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    // Render into a portal or just fixed at top (simple approach first)
    return createPortal(
        <div
            className={`fixed top-4 right-1/2 translate-x-1/2 z-[200] transition-all duration-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}
        >
            <div className="bg-[#151E2E] border border-indigo-500/50 p-4 rounded-xl shadow-2xl shadow-indigo-500/20 max-w-sm w-[90vw] md:w-96 flex items-start gap-3 backdrop-blur-md">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    🔔
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm mb-1">New Notification</h4>
                    <p className="text-gray-300 text-sm truncate">{notification.message}</p>
                </div>
                <button
                    onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
                    className="text-gray-500 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>
        </div>,
        document.body
    );
};

export default ToastNotification;
