import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { useAuth } from '../contexts/AuthContext';
import { questionsAPI, socialAPI, submissionsAPI } from '../lib/api';
import confetti from 'canvas-confetti';
import Navbar from '../components/Navbar';

const ENDPOINT = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const ArenaRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const socketRef = useRef();

    const [users, setUsers] = useState([]);
    const [code, setCode] = useState('// Waiting for host to select a question...');
    const [language, setLanguage] = useState('javascript'); // Individual language preference
    const [question, setQuestion] = useState(null);
    const [messages, setMessages] = useState([]); // Chat messages
    const [newMessage, setNewMessage] = useState('');
    const [isHost, setIsHost] = useState(false);

    // Approval State
    const [isWaiting, setIsWaiting] = useState(false);
    const [joinRequests, setJoinRequests] = useState([]);

    // Timer State
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // Modals & UI State
    const [isSelecting, setIsSelecting] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [questions, setQuestions] = useState([]);

    // Typing State
    const [typingUsers, setTypingUsers] = useState({});
    const typingTimeoutRef = useRef(null);

    // Invitation State
    const [friends, setFriends] = useState([]);
    const [invitedFriends, setInvitedFriends] = useState({});
    const [timerDurationInput, setTimerDurationInput] = useState(30); // Default 30 mins

    // Execution State
    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [activeTab, setActiveTab] = useState('testcases');
    const [leaderboard, setLeaderboard] = useState([]);
    const [isDevBannerVisible, setIsDevBannerVisible] = useState(false);

    useEffect(() => {
        socketRef.current = io(ENDPOINT);

        // Join Room
        socketRef.current.emit('join_room', { roomId, user });

        // Listeners
        // Listeners
        socketRef.current.on('room_state', ({ users, hostId, question, timer }) => {
            setUsers(users);
            setIsHost(hostId === user._id);
            if (question) {
                setQuestion(question);
                // Only set code if it's still the default waiting message
                if (code.startsWith('// Waiting')) {
                    setCode(question.starterCode?.javascript || '// Start coding...');
                }
            }
            if (timer) {
                setIsTimerRunning(timer.isRunning);
                setTimeLeft(timer.timeLeft);
            }
        });

        socketRef.current.on('user_joined', (newUser) => {
            setUsers(prev => [...prev, newUser]);
            setMessages(prev => [...prev, { system: true, text: `${newUser.name} joined.` }]);
        });

        socketRef.current.on('user_left', (userId) => {
            setUsers(prev => {
                const leftUser = prev.find(u => u._id === userId);
                if (leftUser) {
                    setMessages(prevMsgs => [...prevMsgs, { system: true, text: `${leftUser.name} left.` }]);
                }
                return prev.filter(u => u._id !== userId);
            });
        });

        // Removed code_update listener to stop syncing

        socketRef.current.on('leaderboard_update', (data) => {
            setLeaderboard(data);
        });

        socketRef.current.on('user_completed', ({ userId, name }) => {
            setMessages(prev => [...prev, { system: true, text: `🏆 ${name} has completed the challenge!` }]);
            if (userId !== user._id) {
                // Maybe play a sound or show a toast
            }
        });

        socketRef.current.on('question_updated', (newQuestion) => {
            setQuestion(newQuestion);
            const starter = newQuestion.starterCode?.javascript || '// Start coding...';
            setCode(starter); // Reset code for everyone on new question
        });

        socketRef.current.on('waiting_for_approval', () => {
            setIsWaiting(true);
        });

        socketRef.current.on('join_request', ({ user }) => {
            setJoinRequests(prev => [...prev, user]);
        });

        socketRef.current.on('join_success', ({ roomId, roomState }) => {
            setIsWaiting(false);
            setUsers(roomState.users);
            setIsHost(roomState.hostId === user._id);
            if (roomState.question) setQuestion(roomState.question);
            // Don't overwrite execution code with room state code
            if (roomState.question && code.startsWith('// Waiting')) {
                setCode(roomState.question.starterCode?.javascript || '// Start coding...');
            }
            socketRef.current.emit('finalize_join', { roomId });
        });

        socketRef.current.on('join_rejected', () => {
            alert('Host rejected your join request.');
            navigate('/arena');
        });

        // Typing Listeners
        socketRef.current.on('user_typing', ({ user, isTyping }) => {
            setTypingUsers(prev => {
                const newState = { ...prev };
                if (isTyping) newState[user._id] = user.name;
                else delete newState[user._id];
                return newState;
            });
        });

        socketRef.current.on('receive_message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        // Timer Events
        socketRef.current.on('timer_start', (duration) => {
            setIsTimerRunning(true);
            setTimeLeft(duration);
            setMessages(prev => [...prev, { system: true, text: `Timer started: ${Math.floor(duration / 60)}m` }]);
        });

        socketRef.current.on('timer_tick', (time) => {
            setTimeLeft(time);
        });

        socketRef.current.on('timer_stop', () => {
            setIsTimerRunning(false);
            setTimeLeft(0);
            setMessages(prev => [...prev, { system: true, text: 'Time is up!' }]);
            alert('Time is up!');
        });

        socketRef.current.on('invitation', (data) => {
            // Handled globally, but good to ensure
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [roomId, user]);

    useEffect(() => {
        // Fetch friends when Invite modal opens
        if (isInviting && friends.length === 0) {
            socialAPI.getFriends().then(res => setFriends(res.data.friends));
        }
    }, [isInviting]);

    useEffect(() => {
        if (question) {
            const starterCodeMap = question.starterCode || {};
            const langCode = starterCodeMap[language] || starterCodeMap['javascript'] || '// Start coding...';
            setCode(langCode);
        }
    }, [language, question]);

    // Code Change
    const handleCodeChange = (value) => {
        setCode(value);
        // socketRef.current.emit('code_change', { roomId, code: value }); // Disabled sync
    };

    // Chat
    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        socketRef.current.emit('typing_start', { roomId, user });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current.emit('typing_stop', { roomId, user });
        }, 1000);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            socketRef.current.emit('send_message', { roomId, message: newMessage, user });
            socketRef.current.emit('typing_stop', { roomId, user });
            setNewMessage('');
        }
    };

    // Host Actions
    const respondToRequest = (requestUser, approved) => {
        socketRef.current.emit('respond_join_request', { roomId, user: requestUser, approved });
        setJoinRequests(prev => prev.filter(u => u._id !== requestUser._id));
    };

    const getTypingText = () => {
        const names = Object.values(typingUsers);
        if (names.length === 0) return '';
        if (names.length === 1) return `${names[0]} is typing...`;
        if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
        return 'Several people are typing...';
    };

    // Question Selection
    const fetchQuestions = async () => {
        try {
            const res = await questionsAPI.getAll({ search: searchQuery });
            setQuestions(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSelectQuestion = (q) => {
        socketRef.current.emit('change_question', { roomId, question: q });
        setIsSelecting(false);
        setIsSettingsOpen(true); // Return to settings
    };

    useEffect(() => {
        if (isSelecting) {
            const delay = setTimeout(() => fetchQuestions(), 500);
            return () => clearTimeout(delay);
        }
    }, [searchQuery, isSelecting]);

    // Timer Controls
    const startTimer = () => {
        const durationInSeconds = timerDurationInput * 60;
        socketRef.current.emit('start_timer', { roomId, duration: durationInSeconds });
        setIsSettingsOpen(false);
    };

    const stopTimer = () => {
        socketRef.current.emit('stop_timer', { roomId });
    };

    const handleLeave = () => {
        if (confirm('Are you sure you want to leave the Arena?')) {
            navigate('/');
        }
    };

    // Invite Controls
    const handleInviteUser = (friend) => {
        socketRef.current.emit('invite_user', { targetUserId: friend._id, roomId, hostName: user.name });
        setInvitedFriends(prev => ({ ...prev, [friend._id]: true }));
    };

    const copyInviteLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link);
        alert('Invite link copied to clipboard!');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleRun = async () => {
        console.log('handleRun called', { question, code, language });
        if (!question) {
            console.error('Question is missing in handleRun');
            return;
        }
        setRunning(true);
        setTestResults(null);
        setActiveTab('results');

        try {
            console.log('Sending run request...');
            // Assuming submissionsAPI.run exists and works similarly
            const response = await submissionsAPI.run({
                code,
                language,
                questionId: question._id,
            });
            console.log('Run response received:', response.data);
            setTestResults(response.data);
        } catch (error) {
            console.error(error);
            setTestResults({ error: error.response?.data?.message || error.message || 'Runtime Error' });
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        // Show development banner instead of submitting
        setIsDevBannerVisible(true);
        /*
        if (!question) return;
        setSubmitting(true);
        setTestResults(null);
        setActiveTab('results');

        try {
            const response = await submissionsAPI.submit({
                code,
                language,
                questionId: question._id,
            });
            const result = response.data.result;
            setTestResults(result);

            if (result.passed === result.total) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10B981', '#34D399']
                });
            }

            // Emit result to server for leaderboard
            socketRef.current.emit('submit_result', {
                roomId,
                userId: user._id,
                passed: result.passed,
                total: result.total
            });

        } catch (error) {
            console.error(error);
            setTestResults({ error: error.response?.data?.message || error.message || 'Submission Error' });
        } finally {
            setSubmitting(false);
        }
        */
    };

    if (isWaiting) {
        return (
            <div className="h-screen bg-[#0B1120] text-gray-300 flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Waiting for Approval</h2>
                    <p className="text-gray-400">The host has been notified. Please wait...</p>
                </div>
                <button onClick={() => navigate('/arena')} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-bold transition-colors">
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#1A1A1A] text-gray-300 flex flex-col overflow-hidden font-sans">
            <Navbar minimal={true} />

            {/* Sub-header for Status/Timer */}
            <div className="bg-[#151E2E] border-b border-[#2A2A2A] px-6 py-3 flex justify-between items-center shadow-md z-10 shrink-0 h-16">
                <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-gray-400">ID: <span className="select-all text-white font-bold">{roomId}</span></span>
                    {isHost && (
                        <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium text-white transition-all hover:scale-105 active:scale-95 shadow-lg border border-gray-600">
                            Settings ⚙️
                        </button>
                    )}
                </div>

                <div className={`font-mono text-3xl font-bold tracking-wider ${timeLeft < 60 && isTimerRunning ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                </div>

                <div className="flex items-center gap-3">
                    {isHost ? (
                        isTimerRunning ? (
                            <button onClick={stopTimer} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/20 flex items-center gap-2">
                                ⏹ End Arena
                            </button>
                        ) : (
                            <button onClick={handleLeave} className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold rounded-lg transition-all hover:scale-105 active:scale-95 border border-gray-600 flex items-center gap-2">
                                🚪 Exit
                            </button>
                        )
                    ) : (
                        <button onClick={handleLeave} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/20 flex items-center gap-2">
                            Leave Arena
                        </button>
                    )}
                    <button onClick={() => setIsInviting(true)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                        <span>+</span> Invite
                    </button>
                    <button onClick={() => setIsUserListOpen(true)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold rounded-lg transition-all border border-gray-600 flex items-center gap-2">
                        👥 {users.length}
                    </button>
                </div>
            </div>

            {/* Join Requests (Host Only) */}
            {isHost && joinRequests.length > 0 && (
                <div className="absolute top-20 right-4 z-50 w-80 space-y-2">
                    {joinRequests.map(req => (
                        <div key={req._id} className="bg-[#151E2E] border border-indigo-500/50 p-4 rounded-xl shadow-2xl flex items-center justify-between animate-slide-in">
                            <div>
                                <h4 className="text-sm font-bold text-white">{req.name}</h4>
                                <p className="text-xs text-indigo-300">wants to join</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => respondToRequest(req, true)} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold transition-colors">Accept</button>
                                <button onClick={() => respondToRequest(req, false)} className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-bold transition-colors">✕</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Info & Chat */}
                <div className="w-80 bg-[#151E2E] border-r border-[#2A2A2A] flex flex-col">
                    {/* Question Area */}
                    <div className="flex-1 overflow-y-auto p-4 border-b border-[#2A2A2A]">
                        {question ? (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="m-0 text-white">{question.title}</h3>
                                    <span className={`px-2 py-0.5 text-xs rounded border ${question.difficulty === 'Hard' ? 'text-rose-400 border-rose-400' : question.difficulty === 'Medium' ? 'text-amber-400 border-amber-400' : 'text-emerald-400 border-emerald-400'}`}>{question.difficulty}</span>
                                </div>
                                <p className="text-gray-400">{question.description}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
                                <div className="text-4xl">Waiting...</div>
                                <p className="text-sm">Host is selecting a problem.</p>
                            </div>
                        )}
                    </div>

                    {/* Chat Area */}
                    <div className="h-1/3 flex flex-col bg-[#0B1120]">
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {messages.map((msg, i) => (
                                <div key={i} className={`text-xs ${msg.system ? 'text-center text-gray-600 italic my-1' : ''}`}>
                                    {!msg.system && (
                                        <>
                                            <span className="font-bold text-indigo-400">{msg.user.name}:</span> <span className="text-gray-300">{msg.message}</span>
                                        </>
                                    )}
                                    {msg.system && msg.text}
                                </div>
                            ))}
                        </div>
                        <div className="px-3 h-4 text-[10px] text-gray-500 italic">
                            {getTypingText()}
                        </div>
                        <form onSubmit={sendMessage} className="p-2 border-t border-gray-800">
                            <input
                                className="w-full bg-gray-800 text-white rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={handleTyping}
                            />
                        </form>
                    </div>
                </div>

                {/* Right Panel: Editor & Controls */}
                <div className="flex-1 flex flex-col bg-[#1E1E1E] relative min-w-0">
                    {/* Editor Toolbar */}
                    <div className="h-16 border-b border-[#2A2A2A] bg-[#1E1E1E] flex items-center justify-between px-6 shrink-0 z-10">
                        <div className="flex items-center gap-2 relative group">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="appearance-none bg-[#2A2A2A] text-gray-200 text-sm font-bold pl-4 pr-10 py-2.5 rounded-lg hover:bg-[#333] transition-colors border border-gray-700 focus:ring-0 cursor-pointer uppercase tracking-widest outline-none"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                                <option value="c">C</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRun}
                                disabled={running || submitting || !question}
                                className="px-6 py-2.5 bg-[#2A2A2A] hover:bg-[#333] text-gray-200 rounded-lg text-sm font-bold transition-all border border-gray-600 disabled:opacity-50 flex items-center gap-2 hover:border-gray-500 hover:shadow-lg active:scale-95"
                            >
                                {running ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg>}
                                {running ? 'Running...' : 'Run Code'}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={running || submitting || !question}
                                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95 transform"
                            >
                                {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>}
                                {submitting ? 'Submitting...' : 'Submit Solution'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative">
                        <Editor
                            height="100%"
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={handleCodeChange}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', monospace",
                                padding: { top: 16 },
                            }}
                        />
                    </div>

                    {/* Test Results Panel - Integrated */}
                    {testResults && (
                        <div className="h-48 border-t border-[#2A2A2A] bg-[#151E2E] flex flex-col">
                            <div className="px-4 py-2 border-b border-[#2A2A2A] flex justify-between items-center bg-[#0B1120]">
                                <h4 className="text-xs font-bold text-gray-400 uppercase">Test Results</h4>
                                <button onClick={() => setTestResults(null)} className="text-gray-500 hover:text-white">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                {testResults.error ? (
                                    <div className="text-rose-400 font-mono text-sm whitespace-pre-wrap">{testResults.error}</div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className={`text-lg font-bold ${testResults.passed === testResults.total ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {testResults.passed === testResults.total ? 'All Test Cases Passed! 🎉' : `${testResults.passed}/${testResults.total} Test Cases Passed`}
                                        </div>
                                        {testResults.results && testResults.results.map((r, i) => (
                                            <div key={i} className={`p-2 rounded text-xs font-mono border ${r.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                                                <div className="font-bold mb-1">Case {i + 1}: {r.isCorrect ? 'Pass' : 'Fail'}</div>
                                                {!r.isCorrect && (
                                                    <div className="pl-2 border-l-2 border-rose-500/30 text-[10px] space-y-1">
                                                        <div><span className="text-gray-500">Input:</span> <span className="text-gray-300">{r.input}</span></div>
                                                        <div><span className="text-gray-500">Expected:</span> <span className="text-gray-300">{r.expectedOutput}</span></div>
                                                        <div><span className="text-gray-500">Actual:</span> <span className="text-rose-300">{r.actualOutput}</span></div>
                                                        {r.error && <div><span className="text-rose-500">Error:</span> <span className="text-rose-400">{r.error}</span></div>}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* User List Modal / Leaderboard */}
            {
                isUserListOpen && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-[#151E2E] w-full max-w-md rounded-2xl border border-gray-800 shadow-2xl flex flex-col max-h-[80vh]">
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0B1120] rounded-t-2xl">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Leaderboard</h3>
                                    <p className="text-xs text-gray-400">{users.length} participants</p>
                                </div>
                                <button onClick={() => setIsUserListOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {/* Show sorted leaderboard if exists, otherwise show all users */}
                                {[...users].sort((a, b) => {
                                    // Sort by passed cases descending
                                    const statsA = leaderboard.find(l => l.userId === a._id) || { passed: 0 };
                                    const statsB = leaderboard.find(l => l.userId === b._id) || { passed: 0 };
                                    return statsB.passed - statsA.passed;
                                }).map(u => {
                                    const stats = leaderboard.find(l => l.userId === u._id);
                                    const isCompleted = stats && stats.passed === stats.total;
                                    return (
                                        <div key={u._id} className={`flex items-center gap-3 p-3 rounded-xl border ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#1A1A1A] border-gray-800'}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${isCompleted ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-gray-700 text-gray-300 border-gray-600'}`}>
                                                {u.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-white truncate">{u.name}</p>
                                                    {u._id === user._id && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 rounded">You</span>}
                                                    {stats && (
                                                        <span className={`text-[10px] px-1.5 rounded border ${isCompleted ? 'text-emerald-400 border-emerald-400/30' : 'text-gray-400 border-gray-700'}`}>
                                                            {stats.passed}/{stats.total}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>{question ? 'Solving...' : 'Waiting'}</span>
                                                </div>
                                            </div>
                                            {isCompleted && (
                                                <div className="text-emerald-400 font-bold text-xl">🏆</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Settings Modal */}
            {
                isSettingsOpen && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-[#151E2E] border border-gray-700 rounded-xl p-6 w-96 shadow-2xl">
                            <h2 className="text-xl font-bold text-white mb-6">Room Settings</h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Timer (Minutes)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={timerDurationInput}
                                        onChange={(e) => setTimerDurationInput(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Problem</label>
                                    {question ? (
                                        <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-700">
                                            <span className="text-sm text-white truncate flex-1 mr-2">{question.title}</span>
                                            <button onClick={() => { setIsSelecting(true); setIsSettingsOpen(false); }} className="text-xs text-indigo-400 hover:text-indigo-300">Change</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => { setIsSelecting(true); setIsSettingsOpen(false); }} className="w-full py-3 bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 rounded-lg text-sm text-gray-400 transition-colors">
                                            + Select Problem
                                        </button>
                                    )}
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button onClick={() => setIsSettingsOpen(false)} className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold">Cancel</button>
                                    <button onClick={startTimer} className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/20">
                                        Start Banner
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Question Selection Modal */}
            {
                isSelecting && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-[#151E2E] w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl flex flex-col max-h-[80vh]">
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">Select Question</h3>
                                <button onClick={() => { setIsSelecting(false); setIsSettingsOpen(true); }} className="text-gray-400 hover:text-white">Back</button>
                            </div>
                            <div className="p-4 border-b border-gray-800">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search questions..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#0B1120] border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto p-2">
                                {questions.map(q => (
                                    <button
                                        key={q._id}
                                        onClick={() => handleSelectQuestion(q)}
                                        className="w-full text-left p-3 hover:bg-gray-800 rounded-lg group transition-colors"
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-200 group-hover:text-white">{q.title}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded border ${q.difficulty === 'Easy' ? 'text-emerald-400 border-emerald-400/20' :
                                                q.difficulty === 'Medium' ? 'text-amber-400 border-amber-400/20' :
                                                    'text-rose-400 border-rose-400/20'
                                                }`}>{q.difficulty}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Invitation Modal */}
            {
                isInviting && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-[#151E2E] w-full max-w-sm rounded-2xl border border-gray-800 shadow-2xl flex flex-col">
                            <div className="p-5 border-b border-gray-800 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">Invite Friends</h3>
                                <button onClick={() => setIsInviting(false)} className="text-gray-400 hover:text-white">✕</button>
                            </div>

                            <div className="p-5 space-y-6">
                                {/* Copy Link Section */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Share Link</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-black/30 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 truncate font-mono">
                                            {window.location.href}
                                        </div>
                                        <button onClick={copyInviteLink} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-xs font-bold transition-colors">
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-800"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-[#151E2E] px-2 text-xs text-gray-500">OR INVITE DIRECTLY</span>
                                    </div>
                                </div>

                                {/* Friends List */}
                                <div className="max-h-60 overflow-y-auto pr-1">
                                    {friends.length === 0 ? (
                                        <p className="text-center text-gray-500 text-sm">No friends found.</p>
                                    ) : (
                                        friends.map(friend => (
                                            <div key={friend._id} className="flex justify-between items-center p-3 hover:bg-gray-800/50 rounded-lg transition-colors mb-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                                                        {friend.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-200">{friend.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleInviteUser(friend)}
                                                    disabled={invitedFriends[friend._id]}
                                                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${invitedFriends[friend._id]
                                                        ? 'bg-emerald-500/10 text-emerald-400 cursor-default'
                                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
                                                        }`}
                                                >
                                                    {invitedFriends[friend._id] ? 'Sent' : 'Invite'}
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Development Banner */}
            {isDevBannerVisible && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-4 animate-bounce-in">
                    <div className="flex flex-col">
                        <span className="font-bold text-lg">🚧 Under Development</span>
                        <span className="text-sm opacity-90">Submissions are currently disabled.</span>
                    </div>
                    <button
                        onClick={() => setIsDevBannerVisible(false)}
                        className="bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div >
    );
};

export default ArenaRoom;
