import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
// import confetti from 'canvas-confetti';
// import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { questionsAPI, submissionsAPI } from '../lib/api';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

/*
// Helper component for the drag handle
const ResizeHandle = ({ className = "" }) => (
    <PanelResizeHandle className={`bg-[#282828] transition-colors hover:bg-emerald-500/50 ${className}`}>
        <div className="h-full flex items-center justify-center">
             // Only show dots/lines on hover via CSS if needed, or keep clean 
        </div>
    </PanelResizeHandle>
);
*/

const ProblemPage = () => {
    const { user } = useAuth(); // Get user for storage key isolation
    const { id } = useParams();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [activeTab, setActiveTab] = useState('testcases');
    const [leftTab, setLeftTab] = useState('description'); // 'description' or 'submission_result'
    const [testResults, setTestResults] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [running, setRunning] = useState(false);

    const [activeTestCaseId, setActiveTestCaseId] = useState(0);
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [liveTestResults, setLiveTestResults] = useState([]); // Real-time results
    const [lastSubmission, setLastSubmission] = useState(null);
    const [showSuccessAnimations, setShowSuccessAnimations] = useState(false);

    // Refs for instant feedback logic
    const submittingRef = useRef(false);
    const hasFailedRef = useRef(false);

    // Language Dropdown State
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const langDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
                setIsLangDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const socket = useSocket();

    const playDingSound = () => {
        // Using a real short ding base64 to ensure it plays without external dependencies
        const ding = "data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7cQBMNJcq77Wh7tvJhF7kmIPVnBa1ifCJ6dy0ryVzSuAvjG+CsQCNzpE1BVipEMZYqVOg9MNoL8wpCFQhbFCMmjZmOzOlQ4xP6f8aDwmCJMbcsMcGCxaCQtsGPhv26qTooQa1bjubN9HVgnbyhLKwBAbD9p+/AHQto8YgBQOAyuI6qRclqSRn/6sRAAA";
        new Audio(ding).play().catch(e => console.error("Error playing sound:", e));
    };

    const playSubmittedSound = () => {
        const audio = new Audio('/sounds/submitted.mp3');
        audio.play().catch(e => console.error("Error playing sound:", e));
    };

    const playFailSound = () => {
        const audio = new Audio('/sounds/fail.mp3');
        audio.play().catch(e => console.error("Error playing sound:", e));
    };

    useEffect(() => {
        if (!socket) return;

        const handleProgress = (data) => {
            // Play ding if this specific case passed
            if (data.status === 'Passed' || (data.result && data.result.isCorrect)) {
                playDingSound();
            } else if (data.status === 'Failed' || (data.result && !data.result.isCorrect)) {
                // If any case fails, mark as failed
                hasFailedRef.current = true;
            }

            // check for instant success trigger (only if submitting, not running)
            if (submittingRef.current && !hasFailedRef.current) {
                // If this is the last test case and it Passed
                if (data.caseId === data.total - 1 && data.status === 'Passed') {
                    playSubmittedSound();
                    setShowSuccessAnimations(true);
                    setTimeout(() => setShowSuccessAnimations(false), 5000);
                }
            }

            // data: { caseId, total, status, result }
            setLiveTestResults(prev => {
                let newResults = [...prev];

                // If total known from server differs from our init, resize immediate
                if (data.total !== newResults.length) {
                    const resized = new Array(data.total).fill(null).map((_, i) => newResults[i] || { status: 'Pending' });
                    newResults = resized;
                }

                newResults[data.caseId] = { ...data.result, status: data.status };

                return newResults;
            });
        };
        socket.on('execution_progress', handleProgress);
        return () => {
            socket.off('execution_progress', handleProgress);
        };
    }, [socket]);

    useEffect(() => {
        fetchQuestion();
    }, [id]);

    const isResuming = React.useRef(false); // Ref to coordinate auto-resume

    // 1. Initial Load & History Fetch (Runs on ID change)
    useEffect(() => {
        const init = async () => {
            if (!user) return; // Wait for user to be loaded

            try {
                // Fetch History
                const historyRes = await submissionsAPI.getHistory(id);
                let fetchedSubmission = null;
                if (historyRes.data && historyRes.data.length > 0) {
                    fetchedSubmission = historyRes.data[0];
                    setLastSubmission(fetchedSubmission);
                }

                // Check Session Storage for the INITIAL language (usually javascript)
                const storageKey = `code_${user._id}_${id}_${language}`;
                const savedCode = sessionStorage.getItem(storageKey);

                // Helper to check if code is just starter code (robust whitespace check)
                const isStarterCode = (c, lang) => {
                    if (!question || !question.starterCode) return false;
                    const normalize = (str) => (str || '').replace(/\s+/g, '');
                    return normalize(c) === normalize(question.starterCode[lang]);
                };

                // DECISION LOGIC:
                // If we have a previous submission...
                if (fetchedSubmission) {
                    // And we do NOT have a meaningful draft in the current language...
                    if (!savedCode || isStarterCode(savedCode, language)) {

                        // Signal that we are performing a resume operation
                        isResuming.current = true;

                        // Switch language and code to the submission
                        setLanguage(fetchedSubmission.language);
                        setCode(fetchedSubmission.code);
                        return;
                    }
                }

                // Fallback: If no resume, load draft or starter for current language
                if (savedCode) {
                    setCode(savedCode);
                } else if (question) {
                    const starterCodeMap = question.starterCode || {};
                    setCode(starterCodeMap[language] || starterCodeMap['javascript'] || '');
                }

            } catch (err) {
                console.error("Failed to init problem:", err);
            }
        };

        if (question && user) {
            init();
        }
    }, [question, id, user]); // Added user dependency

    // 2. Language Change Handler Wrapper
    const handleLanguageChange = (newMode) => {
        if (!user) return; // Guard

        // Save current code before switching (redundant w/ effect but safer)
        if (code) {
            const storageKey = `code_${user._id}_${id}_${language}`;
            sessionStorage.setItem(storageKey, code);
        }

        // Load new code
        const newStorageKey = `code_${user._id}_${id}_${newMode}`;
        const savedCode = sessionStorage.getItem(newStorageKey);

        if (savedCode) {
            setCode(savedCode);
        } else if (question) {
            const starterCodeMap = question.starterCode || {};
            setCode(starterCodeMap[newMode] || starterCodeMap['javascript'] || '');
        }

        // Finally switch language state
        setLanguage(newMode);
    };

    // Save to Session Storage on Change
    useEffect(() => {
        if (code && user) {
            const storageKey = `code_${user._id}_${id}_${language}`;
            sessionStorage.setItem(storageKey, code);
        }
    }, [code, language, id, user]);

    const fetchQuestion = async () => {
        try {
            const response = await questionsAPI.getById(id);
            setQuestion(response.data);
            // Do NOT reset code here. Code is managed by initial load effects.
        } catch (error) {
            console.error('Error fetching question:', error);
        } finally {
            setLoading(false);
        }
    };





    const handleRunCode = async () => {
        setRunning(true);
        submittingRef.current = false; // logic separation for socket
        setTestResults(null);
        setLiveTestResults(Array(question.examples.length).fill({ status: 'Pending' })); // Init grid
        setActiveTab('results'); // Switch to results tab

        try {
            const response = await submissionsAPI.run({
                code,
                language,
                questionId: id,
            });
            setTestResults(response.data);

            // Play Sound based on final result
            if (response.data.passed === response.data.total) {
                // For Run, we arguably might not want the 'submitted' fanfare, just the dings are enough?
                // Or maybe a final success ding. Let's stick to the user request "play the sound ding"
                // The dings might have played during progress. extra ding is fine.
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
        setSubmitting(true);
        submittingRef.current = true; // Enable socket trigger
        hasFailedRef.current = false; // Reset fail tracker

        setTestResults(null);
        setActiveTab('results');

        try {
            const response = await submissionsAPI.submit({
                code,
                language,
                questionId: id,
            });
            setTestResults(response.data.result);

            // Play Sound based on final result (Fallback if socket didn't trigger, or redundantly safe)
            if (response.data.result.passed === response.data.result.total) {
                // If animation isn't already showing (e.g. from socket), trigger it
                if (!showSuccessAnimations) {
                    playSubmittedSound();
                    setShowSuccessAnimations(true);
                    setTimeout(() => setShowSuccessAnimations(false), 5000); // Auto-hide after 5s
                }
            } else {
                playFailSound();
            }

            const verdict = response.data.submission.verdict;
            if (verdict === 'Accepted') {
                setLeftTab('submission_result');
                fetchQuestion(); // Refresh to update solved status

                // Trigger AI Analysis
                setAnalyzing(true);
                setAnalysis(null);
                try {
                    const analysisRes = await submissionsAPI.analyze({
                        code,
                        language,
                        questionId: id
                    });
                    setAnalysis(analysisRes.data);
                } catch (err) {
                    console.error("Analysis failed:", err);
                } finally {
                    setAnalyzing(false);
                }
            }
        } catch (error) {
            console.error('Error submitting code:', error);
            setTestResults({ error: 'Submission Failed: Server error.' });
        } finally {
            setSubmitting(false);
            submittingRef.current = false;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-gray-600 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400 font-mono animate-pulse">Loading Environment...</p>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Question Locked 🔒</h1>
                    <Link to="/" className="text-emerald-400 hover:text-emerald-300 underline">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    const formatInput = (input, slug) => {
        if (!input) return null;
        if (slug === 'two-sum') {
            if (input.includes('nums =')) return <div className="font-mono text-sm text-white">{input}</div>;
            const parts = input.split(/\\n|\n/);
            if (parts.length >= 2) {
                const nums = parts[0].trim();
                const target = parts[1].trim();
                const fmtNums = nums.startsWith('[') ? nums : `[${nums.split(/\s+/).join(', ')}]`;
                return (
                    <div className="space-y-3">
                        <div><span className="block text-xs text-gray-500 mb-1">nums =</span><div className="bg-[#3C3C3C] border border-[#555] rounded-lg p-2 font-mono text-sm text-white">{fmtNums}</div></div>
                        <div><span className="block text-xs text-gray-500 mb-1">target =</span><div className="bg-[#3C3C3C] border border-[#555] rounded-lg p-2 font-mono text-sm text-white">{target}</div></div>
                    </div>
                );
            }
        }
        return (
            <div><span className="block text-xs text-gray-500 mb-1">Input =</span><div className="bg-[#3C3C3C] border border-[#555] rounded-lg p-2 font-mono text-sm text-white whitespace-pre-wrap">{input}</div></div>
        );
    };

    return (
        <div className="h-screen bg-[#1A1A1A] text-gray-300 flex flex-col overflow-hidden font-sans">
            <Navbar />

            {/* Main Content Area with Flexbox Layout (Fallback for Resizable Panels) */}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Left Panel: Description */}
                <div className="lg:w-1/2 w-full h-1/2 lg:h-full flex flex-col border-r border-[#282828] bg-[#282828]">
                    {/* Header Tabs (Description, Editorial, etc.) */}
                    <div className="h-10 px-2 bg-[#1A1A1A] flex items-center space-x-1 border-b border-[#282828] shrink-0">
                        <button onClick={() => setLeftTab('description')} className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors border-t-2 relative top-[1px] ${leftTab === 'description' ? 'text-white bg-[#282828] border-transparent rounded-t-lg' : 'text-gray-500 border-transparent hover:text-white'}`}>
                            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Description
                        </button>
                        {testResults && testResults.passed === testResults.total && (
                            <button onClick={() => setLeftTab('submission_result')} className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors border-t-2 relative top-[1px] ${leftTab === 'submission_result' ? 'text-white bg-[#282828] border-transparent rounded-t-lg' : 'text-gray-500 border-transparent hover:text-white'}`}>
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Submissions
                            </button>
                        )}
                        {/* ... Other Tabs (Editorial, Solutions, Submissions) ... */}
                    </div>

                    {/* Description Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                        {leftTab === 'submission_result' ? (
                            <div className="animate-fade-in">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="text-emerald-500">
                                            <h2 className="text-2xl font-bold">Accepted</h2>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 text-xs font-medium bg-[#3C3C3C] text-gray-300 rounded-lg hover:bg-[#444] transition-colors flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                            Editorial
                                        </button>
                                        <button className="px-3 py-1.5 text-xs font-medium bg-emerald-600/20 text-emerald-500 rounded-lg border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            Solution
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* AI Analysis Card */}
                                    <div className="bg-[#3C3C3C] rounded-xl p-5 border border-[#555]">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-1.5 bg-purple-500/20 rounded text-purple-400">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                            </div>
                                            <h3 className="text-lg font-bold text-white">Code Analysis</h3>
                                        </div>

                                        {analyzing ? (
                                            <div className="flex flex-col items-center py-6">
                                                <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-3"></div>
                                                <p className="text-gray-400 text-sm animate-pulse">Analyzing with Gemini AI...</p>
                                            </div>
                                        ) : analysis ? (
                                            analysis.error || analysis.fallback ? (
                                                <div className="flex flex-col items-center py-4 text-center">
                                                    <div className="bg-red-500/10 p-2 rounded-full mb-3 text-red-400">
                                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    </div>
                                                    <p className="text-red-400 text-sm font-medium mb-1">Analysis Failed</p>
                                                    <p className="text-gray-500 text-xs max-w-[200px]">{analysis.details || analysis.error || "Please try again later."}</p>
                                                </div>
                                            ) : (
                                                // Updated: Professional Analysis Panel
                                                <div className="space-y-6">
                                                    {/* Header: Algorithm & Optimality */}
                                                    <div className="flex items-center justify-between border-b border-[#444] pb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-500/30">
                                                                {analysis.algorithm?.type || "Algorithm Detected"}
                                                            </div>
                                                            <span className="text-gray-500 text-xs">{analysis.algorithm?.category}</span>
                                                        </div>
                                                        <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full ${analysis.optimality?.status === 'Optimal' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                                                            {analysis.optimality?.status === 'Optimal' ? (
                                                                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Optimal</>
                                                            ) : (
                                                                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> Suboptimal</>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Metrics Grid */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {/* Time Complexity */}
                                                        <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#444]">
                                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Time Complexity</h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between"><span className="text-gray-500">Best</span> <span className="font-mono text-emerald-400">{analysis.timeComplexity?.best || "?"}</span></div>
                                                                <div className="flex justify-between"><span className="text-gray-500">Average</span> <span className="font-mono text-blue-400">{analysis.timeComplexity?.average || "?"}</span></div>
                                                                <div className="flex justify-between"><span className="text-gray-500">Worst</span> <span className="font-mono text-yellow-400">{analysis.timeComplexity?.worst || "?"}</span></div>
                                                            </div>
                                                        </div>

                                                        {/* Space Complexity */}
                                                        <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#444]">
                                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> Space Complexity</h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between"><span className="text-gray-500">Auxiliary</span> <span className="font-mono text-purple-400">{analysis.spaceComplexity?.auxiliary || "?"}</span></div>
                                                                <div className="flex justify-between"><span className="text-gray-500">Total</span> <span className="font-mono text-gray-300">{analysis.spaceComplexity?.total || "?"}</span></div>
                                                            </div>
                                                            <p className="text-[10px] text-gray-500 mt-3 leading-tight">{analysis.spaceComplexity?.explanation}</p>
                                                        </div>
                                                    </div>

                                                    {/* Code Quality & Edge Cases */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {/* Quality Scores */}
                                                        <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#444]">
                                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Code Quality</h4>
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-400">Maintainability</span> <span className="text-emerald-400">{analysis.codeQuality?.maintainability || 0}/100</span></div>
                                                                    <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${analysis.codeQuality?.maintainability || 0}%` }}></div></div>
                                                                </div>
                                                                <div>
                                                                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-400">Readability</span> <span className="text-blue-400">{analysis.codeQuality?.readability || 0}/100</span></div>
                                                                    <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${analysis.codeQuality?.readability || 0}%` }}></div></div>
                                                                </div>
                                                                <div className="flex justify-between text-xs border-t border-[#333] pt-2">
                                                                    <span className="text-gray-500">Cyclomatic Complexity</span>
                                                                    <span className="font-mono font-bold text-gray-300">{analysis.codeQuality?.cyclomaticComplexity || "?"}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Edge Cases */}
                                                        <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#444]">
                                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Edge Cases</h4>
                                                            <div className="space-y-2 text-xs">
                                                                {analysis.edgeCases?.covered?.map((ec, i) => (
                                                                    <div key={i} className="flex items-start gap-2 text-gray-300"><span className="text-emerald-500">✓</span> {ec}</div>
                                                                ))}
                                                                {analysis.edgeCases?.missing?.map((ec, i) => (
                                                                    <div key={i} className="flex items-start gap-2 text-gray-400"><span className="text-red-500">✗</span> {ec} <span className="text-[10px] bg-red-500/10 text-red-400 px-1 rounded ml-auto">Missing</span></div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Suggestions */}
                                                    {analysis.suggestions && analysis.suggestions.length > 0 && (
                                                        <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#444]">
                                                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Optimization Advice</h4>
                                                            <ul className="space-y-3">
                                                                {analysis.suggestions.map((suggestion, idx) => (
                                                                    <li key={idx} className="flex gap-3">
                                                                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0"></div>
                                                                        <div>
                                                                            <div className="text-xs font-bold text-gray-200 mb-0.5">{suggestion.title}</div>
                                                                            <div className="text-xs text-gray-400 leading-snug">{suggestion.advice}</div>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        ) : (
                                            <div className="text-center py-6 text-gray-500 text-sm">
                                                Analysis unavailable.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6">
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <h1 className="text-2xl font-semibold text-white">{question.title}</h1>

                                    {question.friendsSolved?.count > 0 && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex -space-x-1.5">
                                                {[...Array(Math.min(3, question.friendsSolved.count))].map((_, i) => (
                                                    <div key={i} className="w-5 h-5 rounded-full bg-indigo-500 border border-[#1A1A1A] flex items-center justify-center text-[8px] text-white font-bold">
                                                        {(question.friendsSolved.names[i] || '?').charAt(0)}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                <span className="text-white font-bold uppercase">
                                                    {question.friendsSolved.names[0] ? (question.friendsSolved.names[0].split(' ')[1] || question.friendsSolved.names[0].split(' ')[0]) : ''}
                                                </span>
                                                {question.friendsSolved.count > 1 ? (
                                                    <span> and <span className="text-white font-medium">{question.friendsSolved.count - 1} people already solved this</span></span>
                                                ) : (
                                                    <span> solved this</span>
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs mb-4">
                                    <span className={`px-2.5 py-1 rounded-full font-medium bg-[#3C3C3C] text-emerald-500`}>
                                        {question.difficulty}
                                    </span>
                                    {/* Topics, Companies, Hint Buttons */}
                                </div>

                                <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-gray-100 prose-code:text-gray-300 prose-code:bg-[#3C3C3C] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#3C3C3C] prose-pre:border-none prose-pre:p-4 prose-pre:rounded-lg">
                                    <div className="whitespace-pre-wrap text-[14px] leading-6 text-gray-300">
                                        {question.description}
                                    </div>

                                    {question.examples && question.examples.length > 0 && (
                                        <div className="space-y-6 mt-8">
                                            {question.examples.map((example, idx) => (
                                                <div key={idx}>
                                                    <h3 className="text-sm font-bold text-white mb-2">Example {idx + 1}:</h3>
                                                    <div className="pl-4 border-l-2 border-[#3C3C3C] space-y-2 text-sm">
                                                        <div>
                                                            <span className="font-semibold text-white">Input:</span> <span className="font-mono text-gray-300">{example.input}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-white">Output:</span> <span className="font-mono text-gray-300">{example.output}</span>
                                                        </div>
                                                        {example.explanation && (
                                                            <div>
                                                                <span className="font-semibold text-white">Explanation:</span> <span className="text-gray-400">{example.explanation}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* Constraints */}
                                    {question.constraints && question.constraints.length > 0 && (
                                        <div className="mt-8">
                                            <h3 className="text-sm font-bold text-white mb-3">Constraints:</h3>
                                            <ul className="list-disc list-inside space-y-1 pl-2 text-sm text-gray-300">
                                                {question.constraints.map((constraint, idx) => (
                                                    <li key={idx}>
                                                        <code className="bg-[#3C3C3C] px-1.5 py-0.5 rounded text-xs">{constraint}</code>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Code & Results */}
                <div className="lg:w-1/2 w-full h-1/2 lg:h-full flex flex-col">
                    {/* Top: Code Editor */}
                    <div className="h-[60%] flex flex-col bg-[#1E1E1E] border-b border-[#282828]">
                        {/* Editor Toolbar */}
                        <div className="h-10 px-2 border-b border-[#282828] flex items-center justify-between bg-[#1A1A1A] shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                    Code
                                </span>
                                <span className="text-gray-600">|</span>
                                {
                                    <div className="relative" ref={langDropdownRef}>
                                        <button
                                            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#252526] hover:bg-[#2d2d2d] transition-colors border border-gray-700/50 text-xs font-medium text-gray-300 min-w-[120px] justify-between group"
                                        >
                                            <span className="flex items-center gap-2">
                                                {(() => {
                                                    const languages = [
                                                        { id: 'javascript', label: 'JavaScript', icon: '⚡' },
                                                        { id: 'python', label: 'Python', icon: '🐍' },
                                                        { id: 'java', label: 'Java', icon: '☕' },
                                                        { id: 'cpp', label: 'C++', icon: '🚀' },
                                                        { id: 'c', label: 'C', icon: '🔧' }
                                                    ];
                                                    const currentLang = languages.find(l => l.id === language) || languages[0];
                                                    return (
                                                        <>
                                                            <span className="opacity-70">{currentLang.icon}</span>
                                                            {currentLang.label}
                                                        </>
                                                    );
                                                })()}
                                            </span>
                                            <FiChevronDown className={`w-3 h-3 transition-transform duration-300 ${isLangDropdownOpen ? 'rotate-180 text-emerald-500' : 'text-gray-500'}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isLangDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                                    transition={{ duration: 0.1 }}
                                                    className="absolute top-full left-0 mt-1 w-40 !bg-[#1E1E1E] border border-[#333] rounded-md shadow-2xl overflow-hidden z-[9999]"
                                                >
                                                    <div className="py-1">
                                                        {[
                                                            { id: 'javascript', label: 'JavaScript', icon: '⚡' },
                                                            { id: 'python', label: 'Python', icon: '🐍' },
                                                            { id: 'java', label: 'Java', icon: '☕' },
                                                            { id: 'cpp', label: 'C++', icon: '🚀' },
                                                            { id: 'c', label: 'C', icon: '🔧' }
                                                        ].map((lang) => (
                                                            <button
                                                                key={lang.id}
                                                                onClick={() => {
                                                                    handleLanguageChange(lang.id);
                                                                    setIsLangDropdownOpen(false);
                                                                }}
                                                                className={`w-full text-left flex items-center gap-3 px-3 py-2 text-xs font-medium transition-colors ${language === lang.id
                                                                    ? 'bg-[#094771] text-white'
                                                                    : 'text-gray-300 hover:bg-[#2A2D2E] hover:text-white'
                                                                    }`}
                                                            >
                                                                <span className="shrink-0 w-4 text-center">{lang.icon}</span>
                                                                {lang.label}
                                                                {language === lang.id && (
                                                                    <span className="ml-auto text-white">✓</span>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                }
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleRunCode} disabled={running || submitting} className="px-3 py-1 bg-[#2A2A2A] hover:bg-[#333] text-gray-300 rounded text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-2 border border-[#333]">{running ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg>} Run </button>
                                <button onClick={handleSubmit} disabled={running || submitting} className="px-3 py-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-2 border border-emerald-500/20">{submitting ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : null} Submit </button>

                                <button
                                    onClick={() => {
                                        if (lastSubmission) {
                                            if (lastSubmission.language !== language) {
                                                isResuming.current = true; // Prevent effect from overwriting with starter code
                                                setLanguage(lastSubmission.language);
                                                setCode(lastSubmission.code);
                                            } else {
                                                setCode(lastSubmission.code);
                                            }
                                        }
                                    }}
                                    disabled={!lastSubmission}
                                    className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-emerald-400 transition-colors disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                                    title={`Restore Last Submission ${lastSubmission ? `(${lastSubmission.language})` : ''}`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                </button>

                                <button onClick={() => setCode(question.starterCode?.[language] || '')} className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-red-400 transition-colors" title="Reset to Starter Code"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <Editor
                                height="100%"
                                language={language === 'cpp' || language === 'c' ? 'cpp' : language}
                                theme="vs-dark"
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 10, bottom: 10 },
                                    fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                                    fontLigatures: true,
                                    cursorBlinking: 'smooth',
                                    contextmenu: true,
                                    roundedSelection: true,
                                    scrollBeyondLastColumn: 0,
                                }}
                            />
                        </div>
                    </div>

                    {/* Bottom: Testcases & Results */}
                    <div className="h-[40%] flex flex-col bg-[#282828]">
                        {/* Panel Tabs (Testcase / Test Result) */}
                        <div className="h-9 flex items-center bg-[#1E1E1E] border-b border-[#282828] px-2 shrink-0">
                            <button onClick={() => setActiveTab('testcases')} className={`px-3 h-full flex items-center gap-2 text-xs font-medium border-b-2 transition-colors ${activeTab === 'testcases' ? 'text-white border-white' : 'text-gray-500 border-transparent hover:text-gray-300'}`}><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> Testcase </button>
                            <button onClick={() => setActiveTab('results')} className={`px-3 h-full flex items-center gap-2 text-xs font-medium border-b-2 transition-colors ${activeTab === 'results' ? 'text-white border-white' : 'text-gray-500 border-transparent hover:text-gray-300'}`}><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> Test Result </button>
                        </div>

                        {/* Panel Body */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {activeTab === 'testcases' && question && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        {question.examples.map((_, idx) => (
                                            <button key={idx} onClick={() => setActiveTestCaseId(idx)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTestCaseId === idx ? 'bg-[#4C4C4C] text-white' : 'bg-[#3C3C3C] text-gray-400 hover:bg-[#444] hover:text-white'}`}>Case {idx + 1}</button>
                                        ))}
                                    </div>
                                    <div className="space-y-4">
                                        {question.examples.map((example, idx) => {
                                            let numsVal = '', targetVal = '';
                                            const inputStr = example.input || '';
                                            try {
                                                if (inputStr.includes('nums =') && inputStr.includes(', target =')) {
                                                    const parts = inputStr.split('nums = ')[1].split(', target = ');
                                                    numsVal = parts[0]; targetVal = parts[1];
                                                } else if (inputStr.includes('nums =')) {
                                                    numsVal = inputStr.split('nums = ')[1];
                                                } else if (inputStr.includes(', target =')) {
                                                    const parts = inputStr.split(', target = ');
                                                    numsVal = parts[0]; targetVal = parts[1];
                                                } else {
                                                    const parts = inputStr.split(/\\n|\n/);
                                                    if (parts.length >= 2 && (question.slug === 'two-sum' || question.slug === 'search-insert-position')) {
                                                        const rawNums = parts[0].trim();
                                                        numsVal = !rawNums.startsWith('[') ? `[${rawNums.split(/\s+/).join(', ')}]` : rawNums;
                                                        targetVal = parts[1].trim();
                                                    } else {
                                                        numsVal = inputStr;
                                                    }
                                                }
                                            } catch (e) {
                                                console.warn("Error parsing input", e);
                                                numsVal = inputStr;
                                            }

                                            return (
                                                <div key={idx} className={`${idx === activeTestCaseId ? '' : 'hidden'} pb-6`}>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-gray-400">nums =</label>
                                                        <div className="bg-[#3C3C3C] border border-[#555] rounded-lg p-3 text-base font-mono text-white tracking-wide">{numsVal}</div>
                                                    </div>
                                                    {targetVal && (
                                                        <div className="space-y-2 mt-4">
                                                            <label className="text-sm font-medium text-gray-400">target =</label>
                                                            <div className="bg-[#3C3C3C] border border-[#555] rounded-lg p-3 text-base font-mono text-white tracking-wide">{targetVal}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'results' && (
                                <div className="h-full">
                                    {/* Unified Result View: Live Grid -> Final Grid */}
                                    {(running || submitting || testResults) ? (
                                        <div className="h-full flex flex-col p-6">
                                            {/* Header Section */}
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-3">
                                                    {running || submitting ? (
                                                        <>
                                                            <div className="w-5 h-5 border-2 border-gray-600 border-t-yellow-500 rounded-full animate-spin"></div>
                                                            <h3 className="text-gray-300 font-medium animate-pulse">Running Tests...</h3>
                                                        </>
                                                    ) : testResults ? (
                                                        <>
                                                            <h2 className={`text-2xl font-bold ${testResults.passed === testResults.total ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                {testResults.passed === testResults.total ? 'Accepted' : 'Wrong Answer'}
                                                            </h2>
                                                            <span className="text-sm font-mono text-gray-400">
                                                                ({testResults.passed}/{testResults.total} passed)
                                                            </span>
                                                            {testResults.runtime && <span className="text-sm text-gray-400 bg-[#2A2A2A] px-2 py-1 rounded">Time: {testResults.runtime.toFixed(2)}ms</span>}
                                                        </>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {/* The Persistent 2x5 Grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full max-w-4xl mx-auto mb-8">
                                                {(testResults?.results || liveTestResults || []).map((res, i) => ( // Use final results if available to ensure sync, or live otherwise
                                                    <button
                                                        key={i}
                                                        onClick={() => setActiveTestCaseId(i)}
                                                        className={`h-14 rounded-lg flex items-center justify-center gap-3 border-2 transition-all duration-300 relative group ${(res.status === 'Passed' || res.isCorrect) ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.15)] hover:bg-emerald-500/20' :
                                                            (res.status === 'Failed' || (testResults && !res.isCorrect)) ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:bg-red-500/20' :
                                                                'bg-[#1e1e1e] border-yellow-500/60 text-yellow-500 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.1)]'
                                                            } ${activeTestCaseId === i ? 'ring-2 ring-white/30' : ''}`}
                                                    >
                                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${res.status === 'Pending' ? 'text-yellow-500/70' : 'opacity-60'}`}>Case</span>
                                                        <span className="text-lg font-bold font-mono">{i + 1}</span>

                                                        {/* Tooltip hint on hover */}
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                                            <span className="text-xs font-medium text-white">View Details</span>
                                                        </div>
                                                    </button>
                                                ))}

                                            </div>

                                            {/* Detail View (Below Grid) */}
                                            {testResults && (
                                                <div className="animate-fade-in border-t border-[#333] pt-6">
                                                    {(() => {
                                                        const currentResult = testResults.results[activeTestCaseId] || testResults.results[0];
                                                        if (!currentResult) return null;

                                                        return (
                                                            <div className="space-y-4">
                                                                {currentResult.error ? (
                                                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 font-mono whitespace-pre-wrap">
                                                                        {currentResult.error}
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        {formatInput(currentResult.input, question.slug)}
                                                                        <div><span className="block text-xs text-gray-500 mb-1">Output =</span><div className={`bg-[#3C3C3C] border border-[#555] rounded-lg p-2 font-mono text-sm ${currentResult.isCorrect ? 'text-white' : 'text-red-400'}`}>{currentResult.actualOutput}</div></div>
                                                                        <div><span className="block text-xs text-gray-500 mb-1">Expected =</span><div className="bg-[#3C3C3C] border border-[#555] rounded-lg p-2 font-mono text-sm text-white">{currentResult.expectedOutput}</div></div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm"><div className="mb-2">Run your code to see results</div></div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Status bar removed as buttons are now in top toolbar */}

            {/* Success Animations Overlay */}
            <AnimatePresence>
                {showSuccessAnimations && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center"
                        onLayoutAnimationComplete={() => console.log("Animation overlay visible")}
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <DotLottieReact
                                src="https://lottie.host/42e68507-20ff-4129-a6a0-2ecdb6063f6f/2j7dJ5fxuz.lottie"
                                loop={false}
                                autoplay
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default ProblemPage;
