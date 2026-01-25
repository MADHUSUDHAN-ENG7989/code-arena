import React, { useState, useEffect } from 'react';

const MobileRestriction = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            const isMobileDevice = /android|ipad|iphone|ipod/i.test(userAgent);
            const isSmallScreen = window.innerWidth < 1024; // Restrict anything smaller than large tablet/laptop

            setIsMobile(isMobileDevice || isSmallScreen);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (isMobile) {
        return (
            <div className="fixed inset-0 z-[9999] bg-[#0B1120] flex flex-col items-center justify-center p-8 text-center text-white">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold mb-4">Desktop Access Only</h1>
                <p className="text-gray-400 max-w-md text-lg leading-relaxed">
                    This platform is optimized for competitive programming and complex problem solving, which requires a desktop environment.
                </p>
                <div className="mt-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <p className="text-indigo-300 font-medium">Please open this application on your laptop or desktop computer.</p>
                </div>
            </div>
        );
    }

    return children;
};

export default MobileRestriction;
