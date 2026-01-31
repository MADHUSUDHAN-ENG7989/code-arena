import React from 'react';

const MaintenancePage = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
            <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
                <div className="mb-6">
                    <svg
                        className="w-24 h-24 text-yellow-500 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Under Maintenance</h1>
                <p className="text-gray-300 mb-6">
                    Our website is currently undergoing scheduled maintenance. We should be back shortly. Thank you for your patience.
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700 mb-2">
                    <div className="bg-yellow-500 h-2.5 rounded-full animate-pulse w-3/4"></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Expected recovery: Soon</p>
            </div>
        </div>
    );
};

export default MaintenancePage;
