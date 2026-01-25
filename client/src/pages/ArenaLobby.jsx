import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { v4 as uuidv4 } from 'uuid';

const ArenaLobby = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => {
                console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const createRoom = () => {
        const newRoomId = uuidv4().slice(0, 8);
        navigate(`/arena/room/${newRoomId}`);
    };

    const joinRoom = (e) => {
        e.preventDefault();
        if (roomId.trim()) {
            navigate(`/arena/room/${roomId.trim()}`);
        }
    };

    return (
        <MainLayout minimal={true}>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="relative overflow-hidden rounded-3xl bg-[#151E2E] border border-gray-800 p-8 md:p-12 text-center shadow-2xl">
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 max-w-4xl mx-auto space-y-12">
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 animate-text">
                                Code Arena
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
                                Experience the thrill of real-time competitive coding. Create a room, setup the challenge, and race against your friends to the solution.
                            </p>
                            <button onClick={toggleFullScreen} className="text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors flex items-center justify-center gap-2 mx-auto border border-indigo-500/30 px-3 py-1.5 rounded-full hover:bg-indigo-500/10">
                                <span>⛶</span> Toggle Full Screen
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
                            {/* Create Room */}
                            <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all hover:bg-white/10 group">
                                <span className="text-4xl mb-4 opacity-80 group-hover:scale-110 transition-transform duration-300">⚡</span>
                                <h2 className="text-2xl font-bold text-white mb-2">Create Room</h2>
                                <p className="text-sm text-gray-400 mb-6">Start a new battle and invite friends.</p>
                                <button
                                    onClick={createRoom}
                                    className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all"
                                >
                                    Create New Room
                                </button>
                            </div>

                            {/* Join Room */}
                            <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all hover:bg-white/10 group">
                                <span className="text-4xl mb-4 opacity-80 group-hover:scale-110 transition-transform duration-300">🚀</span>
                                <h2 className="text-2xl font-bold text-white mb-2">Join Room</h2>
                                <p className="text-sm text-gray-400 mb-6">Enter an existing Room ID.</p>
                                <form onSubmit={joinRoom} className="w-full flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Room ID"
                                        value={roomId}
                                        onChange={(e) => setRoomId(e.target.value)}
                                        className="flex-1 bg-[#0B1120] border border-gray-700 rounded-xl px-4 text-white text-center focus:outline-none focus:border-violet-500 font-mono"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!roomId.trim()}
                                        className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/30 transition-all"
                                    >
                                        Join
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-t border-white/5">
                            <div className="p-4">
                                <div className="text-indigo-400 text-xl mb-2">🔥 Real-time Sync</div>
                                <p className="text-sm text-gray-400">Code together with zero latency. See every keystroke as it happens.</p>
                            </div>
                            <div className="p-4">
                                <div className="text-violet-400 text-xl mb-2">⏱️ Beat the Timer</div>
                                <p className="text-sm text-gray-400">Set custom time limits and feel the pressure of the clock.</p>
                            </div>
                            <div className="p-4">
                                <div className="text-pink-400 text-xl mb-2">🏆 Compete & Win</div>
                                <p className="text-sm text-gray-400">Challenge friends using curated problems from our library.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ArenaLobby;
