import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi'; // Keeping FiChevronDown for dropdown if preferred, or finding Lu equivalent
import {
    LuChevronDown, LuVolume2, LuVolumeX, LuUsers, LuFilePen,
    LuTimer, LuUserPlus, LuLogOut, LuHash, LuMessageSquare,
    LuTrophy, LuPlay, LuSend, LuFileText
} from 'react-icons/lu';
import { useAuth } from '../contexts/AuthContext';
import { questionsAPI, socialAPI, submissionsAPI } from '../lib/api';
// import confetti from 'canvas-confetti'; // Optional: Restore if desired

const ENDPOINT = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const ArenaRoom = () => {
    // --- Router & Auth ---
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // --- Socket & Ref ---
    const socketRef = useRef();
    const submittingRef = useRef(false);
    const draftsRef = useRef({}); // Store drafts per language

    // --- Arena State ---
    const [users, setUsers] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // --- UI/Data State ---
    const [question, setQuestion] = useState(null);
    const [code, setCode] = useState('// Waiting for host to select a question...');
    const [language, setLanguage] = useState('javascript');

    // --- Tabs & Panels ---
    const [leftTab, setLeftTab] = useState('description'); // 'description', 'chat', 'leaderboard'
    const [activeTab, setActiveTab] = useState('testcases'); // 'testcases', 'results'

    // --- Chat State ---
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [typingUsers, setTypingUsers] = useState({});
    const typingTimeoutRef = useRef(null);

    // --- Execution State ---
    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);

    // --- Modals ---
    const [isSelecting, setIsSelecting] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [isPeopleOpen, setIsPeopleOpen] = useState(false); // New People Modal
    const [isTimerOpen, setIsTimerOpen] = useState(false); // New Timer Modal (was part of Settings)
    const [searchQuery, setSearchQuery] = useState('');
    const [questions, setQuestions] = useState([]);
    const [timerDurationInput, setTimerDurationInput] = useState(30);
    const [friends, setFriends] = useState([]);
    const [invitedUsers, setInvitedUsers] = useState(new Set());

    // Track all users who have ever joined this session
    const allUsersHistory = useRef({}); // { userId: { name, _id, joinedAt } }

    // --- Misc ---
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const langDropdownRef = useRef(null);
    const [activeTestCaseId, setActiveTestCaseId] = useState(0);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);

    // --- Helper: Click Outside ---
    useEffect(() => {
        function handleClickOutside(event) {
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
                setIsLangDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- Socket Initialization ---
    useEffect(() => {
        if (!user) return;
        socketRef.current = io(ENDPOINT);
        const socket = socketRef.current;

        socket.emit('join_room', { roomId, user });

        socket.on('room_state', ({ users, hostId, question, timer }) => {
            setUsers(users);
            // Track history
            users.forEach(u => allUsersHistory.current[u._id] = { ...u, lastSeen: new Date() });

            setIsHost(hostId === user._id);
            if (question) {
                setQuestion(question);
                if (code.startsWith('// Waiting')) {
                    setCode(question.starterCode?.javascript || '// Start coding...');
                }
            }
            if (timer) {
                setIsTimerRunning(timer.isRunning);
                setTimeLeft(timer.timeLeft);
            }
        });

        socket.on('user_joined', (newUser) => {
            setUsers(prev => [...prev, newUser]);
            allUsersHistory.current[newUser._id] = { ...newUser, lastSeen: new Date() };
            setMessages(prev => [...prev, { system: true, text: `${newUser.name} joined.` }]);
        });

        socket.on('user_left', (userId) => {
            setUsers(prev => {
                const leftUser = prev.find(u => u._id === userId);
                if (leftUser) setMessages(m => [...m, { system: true, text: `${leftUser.name} left.` }]);
                return prev.filter(u => u._id !== userId);
            });
        });

        socket.on('leaderboard_update', (data) => setLeaderboard(data));

        socket.on('user_completed', ({ userId, name }) => {
            setMessages(prev => [...prev, { system: true, text: `🏆 ${name} has completed the challenge!` }]);
            // Optional: Toast/Sound
        });

        socket.on('question_updated', (newQuestion) => {
            setQuestion(newQuestion);
            // Reset code to fresh starter code on new question
            draftsRef.current = {}; // Clear drafts
            const starter = newQuestion.starterCode?.javascript || '// Start coding...';
            setCode(starter);
            setLanguage('javascript');
            setTestResults(null);
            setLeaderboard([]);
            setLeftTab('description');
        });

        socket.on('join_success', ({ roomId, roomState }) => {
            setUsers(roomState.users);
            setIsHost(roomState.hostId === user._id);
            if (roomState.question) setQuestion(roomState.question);
            if (roomState.question && code.startsWith('// Waiting')) {
                setCode(roomState.question.starterCode?.javascript || '// Start coding...');
            }
            socket.emit('finalize_join', { roomId });
        });

        socket.on('user_typing', ({ user, isTyping }) => {
            setTypingUsers(prev => {
                const newState = { ...prev };
                if (isTyping) newState[user._id] = user.name;
                else delete newState[user._id];
                return newState;
            });
        });

        socket.on('receive_message', (msg) => setMessages(prev => [...prev, msg]));

        socket.on('timer_start', (duration) => {
            setIsTimerRunning(true);
            setTimeLeft(duration);
            setMessages(prev => [...prev, { system: true, text: `Timer started: ${Math.floor(duration / 60)}m` }]);
        });
        socket.on('timer_tick', (time) => setTimeLeft(time));
        socket.on('timer_stop', () => {
            setIsTimerRunning(false);
            setTimeLeft(0);
            setMessages(prev => [...prev, { system: true, text: 'Time is up!' }]);
            alert('Time is up!');
        });

        return () => socket.disconnect();
    }, [roomId, user, navigate]);

    // --- Sound Logic ---
    const playDingSound = () => {
        if (!isSoundEnabled) return;
        const ding = "data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7cQBMNJcq77Wh7tvJhF7kmIPVnBa1ifCJ6dy0ryVzSuAvjG+CsQCNzpE1BVipEMZYqVOg9MNoL8wpCFQhbFCMmjZmOzOlQ4xP6f8aDwmCJMbcsMcGCxaCQtsGPhv26qTooQa1bjubN9HVgnbyhLKwBAbD9p+/AHQto8YgBQOAyuI6qRclqSRn/6sRAAA";
        new Audio(ding).play().catch(e => console.error("Error playing sound:", e));
    };

    const playSubmittedSound = () => {
        if (!isSoundEnabled) return;
        const audio = new Audio('/sounds/submitted.mp3');
        audio.play().catch(e => console.error("Error playing sound:", e));
    };

    const playFailSound = () => {
        if (!isSoundEnabled) return;
        const audio = new Audio('/sounds/fail.mp3');
        audio.play().catch(e => console.error("Error playing sound:", e));
    };

    // --- Event Handlers ---



    // Initialize code when question loads (if empty or waiting)
    useEffect(() => {
        if (question) {
            const starter = question.starterCode?.[language] || question.starterCode?.['javascript'] || '// Start coding...';
            if (code.startsWith('// Waiting') || code === '') {
                setCode(starter);
            }
        }
    }, [question]); // removed language dependency to avoid overwriting on switch

    const handleLanguageChange = (newLang) => {
        if (newLang === language) {
            setIsLangDropdownOpen(false);
            return;
        }

        // Save current code to draft
        draftsRef.current[language] = code;

        // Load new code: Draft -> Starter -> Default
        if (draftsRef.current[newLang]) {
            setCode(draftsRef.current[newLang]);
        } else if (question) {
            const starter = question.starterCode?.[newLang] || question.starterCode?.['javascript'] || '';
            setCode(starter);
        }

        setLanguage(newLang);
        setIsLangDropdownOpen(false);
    };

    const handleRunCode = async () => {
        if (!question) return;
        setRunning(true);
        setTestResults(null);
        setActiveTab('results');

        try {
            const response = await submissionsAPI.run({
                code,
                language,
                questionId: question._id,
            });
            setTestResults(response.data);

            // Sound Logic for Run
            if (response.data.passed === response.data.total) {
                playDingSound();
            } else {
                playFailSound();
            }

        } catch (error) {
            console.error('Error running code:', error);
            setTestResults({ error: 'Runtime Error: Failed to execute code.' });
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!question) return;
        setSubmitting(true);
        setTestResults(null);
        setActiveTab('results');

        try {
            // Use 'arena' mode to avoid persistent history mixing
            const response = await submissionsAPI.submit({
                code,
                language,
                questionId: question._id,
                mode: 'arena'
            });
            const result = response.data.result;
            const submission = response.data.submission;
            setTestResults(result);

            if (result.passed === result.total) {
                playSubmittedSound(); // Success sound
                // Emit success to socket for Leaderboard
                socketRef.current.emit('submit_result', {
                    roomId,
                    userId: user._id,
                    passed: result.passed,
                    total: result.total
                });
                // Play success sound logic here?
            } else {
                // Emit partial progress?
                playFailSound(); // Fail sound
                socketRef.current.emit('submit_result', {
                    roomId,
                    userId: user._id,
                    passed: result.passed,
                    total: result.total
                });
            }

        } catch (error) {
            console.error('Error submitting code:', error);
            setTestResults({ error: 'Submission Failed: Server error.' });
        } finally {
            setSubmitting(false);
        }
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

    const getTypingText = () => {
        const names = Object.values(typingUsers);
        if (names.length === 0) return '';
        if (names.length === 1) return `${names[0]} is typing...`;
        return 'Several people are typing...';
    };

    // --- Host Controls ---
    const startTimer = () => {
        socketRef.current.emit('start_timer', { roomId, duration: timerDurationInput * 60 });
        setIsTimerOpen(false);
    };
    const stopTimer = () => socketRef.current.emit('stop_timer', { roomId });
    const handleLeave = () => { if (confirm('Leave Arena?')) navigate('/'); };

    // --- People Status Helper ---
    const getPeopleStatus = () => {
        const all = { ...allUsersHistory.current };
        // Ensure current users are up to date
        users.forEach(u => all[u._id] = { ...all[u._id], ...u, online: true });

        return Object.values(all).map(u => {
            const isOnline = users.some(on => on._id === u._id);
            const stats = leaderboard.find(l => l.userId === u._id);
            const isSolved = stats && stats.passed === stats.total && stats.total > 0;

            return {
                ...u,
                isOnline,
                status: !isOnline ? 'Offline' : (isSolved ? 'Solved' : 'Solving')
            };
        });
    };
    // --- Invitation ---
    const handleInviteUser = (friend) => {
        socketRef.current.emit('invite_user', { targetUserId: friend._id, roomId, hostName: user.name });
        setInvitedUsers(prev => new Set(prev).add(friend._id));
    };
    useEffect(() => {
        if (isInviting && friends.length === 0) socialAPI.getFriends().then(res => setFriends(res.data.friends));
    }, [isInviting]);

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // --- Question Selection ---
    useEffect(() => {
        if (isSelecting) {
            const t = setTimeout(() => questionsAPI.getAll({ search: searchQuery }).then(res => setQuestions(res.data)), 500);
            return () => clearTimeout(t);
        }
    }, [searchQuery, isSelecting]);
    const handleSelectQuestion = (q) => {
        socketRef.current.emit('change_question', { roomId, question: q });
        setIsSelecting(false);
    };

    // --- Render Main UI ---
    return (
        <div className="h-screen bg-[#1A1A1A] text-gray-300 flex flex-col overflow-hidden font-sans">

            {/* Arena Header */}
            <div className="bg-[#151E2E] border-b border-[#2A2A2A] px-4 py-2 flex justify-between items-center shadow-md z-10 shrink-0 h-14">
                <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-gray-400 flex items-center gap-1"><LuHash size={14} className="text-gray-500" /> ID: <span className="select-all text-white font-bold">{roomId}</span></span>

                    {/* People Button */}
                    <button onClick={() => setIsPeopleOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-medium text-white transition-all">
                        <LuUsers size={14} /> People
                    </button>

                    {/* Sound Toggle */}
                    <button onClick={() => setIsSoundEnabled(!isSoundEnabled)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all">
                        {isSoundEnabled ? <LuVolume2 size={14} /> : <LuVolumeX size={14} />}
                    </button>

                    {isHost && (
                        <>
                            <button onClick={() => setIsSelecting(true)} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-medium text-white transition-all">
                                <LuFilePen size={14} /> Pick Question
                            </button>
                            <button onClick={() => setIsTimerOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-medium text-white transition-all">
                                <LuTimer size={14} />
                            </button>
                        </>
                    )}
                </div>

                <div className={`font-mono text-2xl font-bold tracking-wider ${timeLeft < 60 && isTimerRunning ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setIsInviting(true)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all"><LuUserPlus size={14} /> Invite</button>
                    <button onClick={handleLeave} className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-all"><LuLogOut size={14} /> {isHost ? 'End' : 'Leave'}</button>
                </div>
            </div>

            {/* Main Content (Split Pane) */}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Left Panel */}
                <div className="lg:w-1/2 w-full h-1/2 lg:h-full flex flex-col border-r border-[#282828] bg-[#282828]">
                    {/* Tabs */}
                    <div className="h-10 px-2 bg-[#1A1A1A] flex items-center space-x-1 border-b border-[#282828] shrink-0">
                        <button onClick={() => setLeftTab('description')} className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-t-2 transition-colors ${leftTab === 'description' ? 'text-white bg-[#282828] border-transparent rounded-t-lg relative top-[1px]' : 'text-gray-500 border-transparent hover:text-white'}`}><LuFileText size={14} /> Description</button>
                        <button onClick={() => setLeftTab('chat')} className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-t-2 transition-colors ${leftTab === 'chat' ? 'text-white bg-[#282828] border-transparent rounded-t-lg relative top-[1px]' : 'text-gray-500 border-transparent hover:text-white'}`}><LuMessageSquare size={14} /> Chat <span className="bg-indigo-500 text-[10px] px-1 rounded-full text-white">{messages.length}</span></button>
                        <button onClick={() => setLeftTab('leaderboard')} className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-t-2 transition-colors ${leftTab === 'leaderboard' ? 'text-white bg-[#282828] border-transparent rounded-t-lg relative top-[1px]' : 'text-gray-500 border-transparent hover:text-white'}`}><LuTrophy size={14} /> Leaderboard</button>
                    </div>

                    {/* Left Panel Content */}
                    <div className="flex-1 overflow-hidden relative">
                        {leftTab === 'description' && (
                            <div className="absolute inset-0 overflow-y-auto p-5 custom-scrollbar">
                                {question ? (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <h1 className="text-2xl font-bold text-white mb-2">{question.title}</h1>
                                        <div className="flex gap-2 mb-4">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium bg-[#3C3C3C] ${question.difficulty === 'Easy' ? 'text-emerald-500' : question.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'}`}>{question.difficulty}</span>
                                        </div>
                                        <div className="text-gray-300 whitespace-pre-wrap">{question.description}</div>
                                        {question.examples?.map((ex, i) => (
                                            <div key={i} className="mt-4 p-3 bg-[#3C3C3C] rounded-lg">
                                                <div className="font-bold text-white text-xs mb-1">Example {i + 1}</div>
                                                <div className="text-xs text-gray-300 mb-1"><span className="text-gray-500">Input:</span> {ex.input}</div>
                                                <div className="text-xs text-gray-300"><span className="text-gray-500">Output:</span> {ex.output}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <div className="text-xl font-bold mb-2">Waiting for Host</div>
                                        <p>The host is selecting a problem...</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {leftTab === 'chat' && (
                            <div className="absolute inset-0 flex flex-col bg-[#0B1120]">
                                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                                    {messages.map((msg, i) => (
                                        <div key={i} className={`text-xs ${msg.system ? 'text-center text-gray-600 italic my-2' : ''}`}>
                                            {!msg.system && (
                                                <div className="flex gap-2">
                                                    <span className="font-bold text-indigo-400 shrink-0">{msg.user.name}:</span>
                                                    <span className="text-gray-300 break-words">{msg.message}</span>
                                                </div>
                                            )}
                                            {msg.system && msg.text}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-2 bg-[#151E2E] border-t border-[#2A2A2A]">
                                    <div className="text-[10px] text-gray-500 h-4 italic mb-1 truncate">{getTypingText()}</div>
                                    <form onSubmit={sendMessage} className="flex gap-2">
                                        <input className="flex-1 bg-[#0B1120] border border-gray-700 rounded px-3 py-2 text-xs focus:border-indigo-500 outline-none"
                                            placeholder="Type..." value={newMessage} onChange={handleTyping} />
                                        <button type="submit" className="px-3 py-2 bg-indigo-600 rounded text-xs font-bold text-white">Send</button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {leftTab === 'leaderboard' && (
                            <div className="absolute inset-0 overflow-y-auto p-4 custom-scrollbar">
                                <h3 className="text-lg font-bold text-white mb-4">Live Rankings</h3>
                                <div className="space-y-2">
                                    {[...users].sort((a, b) => {
                                        const sA = leaderboard.find(l => l.userId === a._id) || { passed: 0, total: 0 };
                                        const sB = leaderboard.find(l => l.userId === b._id) || { passed: 0, total: 0 };
                                        // Sort: Completed first (by time?), then by passed count desc
                                        const aComp = sA.passed === sA.total && sA.total > 0;
                                        const bComp = sB.passed === sB.total && sB.total > 0;
                                        if (aComp && bComp) {
                                            // Ideally utilize timestamp if available in 'leaderboard' data
                                            const tA = new Date(sA.completionTime || 0);
                                            const tB = new Date(sB.completionTime || 0);
                                            return tA - tB;
                                        }
                                        if (aComp) return -1;
                                        if (bComp) return 1;
                                        return sB.passed - sA.passed;
                                    }).map((u, i) => {
                                        const stats = leaderboard.find(l => l.userId === u._id) || { passed: 0, total: 0 };
                                        const isDone = stats.passed === stats.total && stats.total > 0;
                                        return (
                                            <div key={u._id} className={`flex items-center justify-between p-3 rounded-lg border ${isDone ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#1A1A1A] border-[#333]'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-300'}`}>{i + 1}</div>
                                                    <div className="text-sm font-bold text-white">{u.name} {u._id === user._id && '(You)'}</div>
                                                </div>
                                                <div className="text-xs font-mono text-gray-400">
                                                    {isDone ? <span className="text-emerald-400">DONE</span> : `${stats.passed}/${stats.total}`}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Code */}
                <div className="lg:w-1/2 w-full h-1/2 lg:h-full flex flex-col">
                    {/* Top: Editor Toolbar */}
                    <div className="h-10 px-2 border-b border-[#282828] flex items-center justify-between bg-[#1E1E1E] shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-500">CODE</span>
                            <div className="relative" ref={langDropdownRef}>
                                <button onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)} className="flex items-center gap-2 px-2 py-1 rounded bg-[#2A2A2A] text-xs font-bold text-gray-300 border border-[#333]">
                                    {language} <LuChevronDown className={isLangDropdownOpen ? 'rotate-180' : ''} />
                                </button>
                                {isLangDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 w-32 bg-[#2A2A2A] border border-[#444] rounded shadow-xl z-50">
                                        {['javascript', 'python', 'java', 'cpp', 'c'].map(l => (
                                            <button key={l} onClick={() => handleLanguageChange(l)} className="w-full text-left px-3 py-2 text-xs hover:bg-[#333] text-gray-300">{l}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleRunCode} disabled={running || submitting} className="px-3 py-1 bg-[#2A2A2A] text-gray-300 rounded text-xs border border-[#444] hover:bg-[#333] flex items-center gap-1">
                                <LuPlay size={12} /> {running ? 'Running...' : 'Run'}
                            </button>
                            <button onClick={handleSubmit} disabled={running || submitting} className="px-3 py-1 bg-emerald-600/20 text-emerald-500 rounded text-xs border border-emerald-500/50 hover:bg-emerald-600/30 flex items-center gap-1">
                                <LuSend size={12} /> {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="flex-1 relative bg-[#1E1E1E]">
                        <Editor height="100%" language={language === 'c' || language === 'cpp' ? 'cpp' : language} theme="vs-dark" value={code} onChange={setCode}
                            options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: "'JetBrains Mono', monospace", scrollBeyondLastLine: false, automaticLayout: true }} />
                    </div>

                    {/* Bottom: Results */}
                    <div className="h-[40%] flex flex-col bg-[#282828] border-t border-[#333]">
                        <div className="h-9 flex items-center bg-[#1E1E1E] border-b border-[#282828] px-2 shrink-0">
                            <button onClick={() => setActiveTab('testcases')} className={`px-3 h-full text-xs font-medium border-b-2 transition-colors ${activeTab === 'testcases' ? 'text-white border-white' : 'text-gray-500 border-transparent'}`}>Testcases</button>
                            <button onClick={() => setActiveTab('results')} className={`px-3 h-full text-xs font-medium border-b-2 transition-colors ${activeTab === 'results' ? 'text-white border-white' : 'text-gray-500 border-transparent'}`}>Results</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {activeTab === 'testcases' && question && (
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        {question.examples.map((_, i) => (
                                            <button key={i} onClick={() => setActiveTestCaseId(i)} className={`px-3 py-1 rounded text-xs font-medium ${activeTestCaseId === i ? 'bg-[#4C4C4C] text-white' : 'bg-[#3C3C3C] text-gray-400'}`}>Case {i + 1}</button>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs text-gray-400">Input:</div>
                                        <div className="p-2 bg-[#3C3C3C] rounded text-sm font-mono text-gray-200">{question.examples[activeTestCaseId]?.input}</div>
                                        <div className="text-xs text-gray-400">Output:</div>
                                        <div className="p-2 bg-[#3C3C3C] rounded text-sm font-mono text-gray-200">{question.examples[activeTestCaseId]?.output}</div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'results' && (
                                testResults ? (
                                    <div className={`space-y-3 ${testResults.error ? 'text-rose-400' : ''}`}>
                                        {testResults.error && <pre className="text-xs whitespace-pre-wrap">{testResults.error}</pre>}
                                        {!testResults.error && (
                                            <>
                                                <div className={`text-sm font-bold ${testResults.passed === testResults.total ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {testResults.passed === testResults.total ? 'Accepted' : 'Wrong Answer'} ({testResults.passed}/{testResults.total})
                                                </div>
                                                {testResults.results?.map((r, i) => (
                                                    <div key={i} className={`p-2 rounded border text-xs font-mono space-y-1 ${r.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                                                        <div className="font-bold flex justify-between">
                                                            <span>Case {i + 1}</span>
                                                            <span>{r.isCorrect ? 'Passed' : 'Failed'}</span>
                                                        </div>
                                                        {!r.isCorrect && (
                                                            <>
                                                                <div>Input: {r.input}</div>
                                                                <div>Expected: {r.expectedOutput}</div>
                                                                <div>Actual: {r.actualOutput}</div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-xs mt-4 text-center">Run code to see results</div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals (Timer, Invite, Selection, People) */}
            {isTimerOpen && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-[#151E2E] p-6 rounded-xl w-80 border border-gray-700">
                        <h2 className="text-white text-lg font-bold mb-4">Timer Settings</h2>
                        <label className="text-xs text-gray-400 uppercase font-bold">Duration (min)</label>
                        <input type="number" value={timerDurationInput} onChange={e => setTimerDurationInput(e.target.value)} className="w-full bg-[#0B1120] border border-gray-700 rounded p-2 text-white mb-4" />
                        <div className="flex gap-2">
                            <button onClick={startTimer} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold">Start</button>
                            <button onClick={stopTimer} className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold">Stop</button>
                        </div>
                        <button onClick={() => setIsTimerOpen(false)} className="w-full py-2 mt-2 text-gray-400 hover:text-white">Close</button>
                    </div>
                </div>
            )}

            {isPeopleOpen && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-[#151E2E] p-6 rounded-xl w-96 border border-gray-700 max-h-[80vh] flex flex-col">
                        <h2 className="text-white text-lg font-bold mb-4">People ({getPeopleStatus().length})</h2>
                        <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                            {getPeopleStatus().map(u => (
                                <div key={u._id} className="flex justify-between items-center bg-[#0B1120] p-3 rounded border border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${u.isOnline ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                                        <span className={`text-sm font-bold ${u.isOnline ? 'text-white' : 'text-gray-500'}`}>{u.name} {u._id === user._id && '(You)'}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${u.status === 'Solved' ? 'bg-emerald-500/20 text-emerald-400' :
                                        u.status === 'Solving' ? 'bg-indigo-500/20 text-indigo-400' :
                                            'bg-gray-700 text-gray-400'
                                        }`}>
                                        {u.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setIsPeopleOpen(false)} className="w-full py-2 mt-4 text-gray-400 hover:text-white">Close</button>
                    </div>
                </div>
            )}
            {isInviting && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-[#151E2E] p-6 rounded-xl w-96 border border-gray-700">
                        <h2 className="text-white text-lg font-bold mb-4">Invite Friends</h2>
                        <div className="flex gap-2 mb-4">
                            <div className="bg-[#0B1120] p-2 text-gray-400 text-xs truncate flex-1 rounded border border-gray-700">{window.location.href}</div>
                            <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="px-3 bg-gray-700 text-white text-xs rounded">Copy</button>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar">
                            {friends.map(f => (
                                <div key={f._id} className="flex justify-between items-center bg-[#0B1120] p-2 rounded">
                                    <span className="text-white text-sm">{f.name}</span>
                                    {invitedUsers.has(f._id) ? (
                                        <button disabled className="text-emerald-400 text-xs font-bold cursor-default">Invited</button>
                                    ) : (
                                        <button onClick={() => handleInviteUser(f)} className="text-indigo-400 text-xs font-bold hover:text-indigo-300">Invite</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setIsInviting(false)} className="w-full py-2 mt-4 text-gray-400 hover:text-white">Close</button>
                    </div>
                </div>
            )}
            {isSelecting && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-[#151E2E] p-6 rounded-xl w-[500px] border border-gray-700 h-[600px] flex flex-col">
                        <h2 className="text-white text-lg font-bold mb-4">Select Problem</h2>
                        <input autoFocus placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#0B1120] border border-gray-700 rounded p-3 text-white mb-4 outline-none focus:border-indigo-500" />
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                            {questions.map(q => (
                                <button key={q._id} onClick={() => handleSelectQuestion(q)} className="w-full text-left p-3 hover:bg-gray-800 rounded border border-transparent hover:border-gray-700 flex justify-between">
                                    <span className="text-gray-200 font-medium">{q.title}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${q.difficulty === 'Easy' ? 'text-emerald-500 bg-emerald-500/10' : q.difficulty === 'Medium' ? 'text-amber-500 bg-amber-500/10' : 'text-rose-500 bg-rose-500/10'}`}>{q.difficulty}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setIsSelecting(false)} className="w-full py-2 mt-4 text-gray-400 hover:text-white">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArenaRoom;
