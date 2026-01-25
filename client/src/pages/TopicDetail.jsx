import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { questionsAPI } from '../lib/api';
import MainLayout from '../components/MainLayout';

const TopicDetail = () => {
    const { topic } = useParams();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuestions();
    }, [topic]);

    const fetchQuestions = async () => {
        try {
            const response = await questionsAPI.getAll({ topic });
            setQuestions(response.data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy':
                return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Medium':
                return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Hard':
                return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default:
                return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const solvedCount = questions.filter((q) => q.isSolved).length;

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link to="/" className="text-indigo-400 hover:text-indigo-300 mb-2 inline-flex items-center gap-1 text-sm font-medium transition-colors">
                            <span>←</span> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {topic}
                        </h1>
                        <p className="text-gray-400">
                            You've solved <span className="text-white font-bold">{solvedCount}</span> out of <span className="text-white font-bold">{questions.length}</span> problems
                        </p>
                    </div>

                    <div className="bg-[#151E2E] px-6 py-3 rounded-xl border border-gray-800 flex items-center gap-5 shadow-lg min-w-[200px]">
                        <div className="text-right flex-1">
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider whitespace-nowrap">Progress</div>
                            <div className="text-2xl font-bold text-white leading-none mt-1">
                                {Math.round((solvedCount / (questions.length || 1)) * 100)}%
                            </div>
                        </div>
                        <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center relative">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 56 56">
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="24"
                                    stroke="currentColor"
                                    strokeWidth="5"
                                    fill="transparent"
                                    className="text-gray-700"
                                />
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="24"
                                    stroke="currentColor"
                                    strokeWidth="5"
                                    fill="transparent"
                                    strokeDasharray={150.8}
                                    strokeDashoffset={150.8 - ((solvedCount / (questions.length || 1)) * 100 / 100) * 150.8}
                                    strokeLinecap="round"
                                    className="text-indigo-500 transition-all duration-1000 ease-out"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-[#151E2E] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-800 bg-gray-900/50">
                                    <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm uppercase tracking-wider">Status</th>
                                    <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm uppercase tracking-wider">Title</th>
                                    <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm uppercase tracking-wider">Difficulty</th>
                                    <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm uppercase tracking-wider">Acceptance</th>
                                    <th className="text-right py-4 px-6 text-gray-400 font-semibold text-sm uppercase tracking-wider">Solved By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {questions.map((question) => (
                                    <tr
                                        key={question._id}
                                        className="hover:bg-indigo-500/5 transition-colors group"
                                    >
                                        <td className="py-4 px-6">
                                            {question.isSolved ? (
                                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border-2 border-gray-700"></div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <Link
                                                to={`/problems/${question._id}`}
                                                className="text-white font-medium hover:text-indigo-400 transition-colors text-lg"
                                            >
                                                {question.title}
                                            </Link>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(
                                                    question.difficulty
                                                )}`}
                                            >
                                                {question.difficulty}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-400 text-sm font-mono">
                                            {question.acceptanceRate.toFixed(1)}%
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            {question.friendsSolved?.count === 1 ? (
                                                <div className="flex justify-end items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-[#151E2E] flex items-center justify-center text-xs text-white font-bold">
                                                        {(question.friendsSolved.names[0] || '?').charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-300 truncate max-w-[100px]">
                                                        {question.friendsSolved.names[0] ? (question.friendsSolved.names[0].split(' ')[1] || question.friendsSolved.names[0].split(' ')[0]) : ''}
                                                    </span>
                                                </div>
                                            ) : question.friendsSolved?.count > 1 ? (
                                                <div className="flex justify-end items-center -space-x-2">
                                                    {[...Array(Math.min(3, question.friendsSolved.count))].map((_, i) => (
                                                        <div key={i} className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-[#151E2E] flex items-center justify-center text-xs text-white font-bold" title={question.friendsSolved.names[i]}>
                                                            {(question.friendsSolved.names[i] || '?').charAt(0)}
                                                        </div>
                                                    ))}
                                                    {question.friendsSolved.count > 3 && (
                                                        <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#151E2E] flex items-center justify-center text-xs text-white font-bold">
                                                            +{question.friendsSolved.count - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-600">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default TopicDetail;
