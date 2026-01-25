import React, { useState, useEffect } from 'react';
import { adminAPI, questionsAPI } from '../lib/api';
import MainLayout from '../components/MainLayout';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('students');
    const [students, setStudents] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Add Student Form State
    const [newStudent, setNewStudent] = useState({
        rollNumber: '',
        name: '',
        email: '',
        password: '',
    });

    useEffect(() => {
        if (activeTab === 'students') {
            fetchStudents();
        } else if (activeTab === 'questions') {
            fetchQuestions();
        }
    }, [activeTab]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getStudents();
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
            alert('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await questionsAPI.getAll();
            setQuestions(response.data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();

        if (!newStudent.rollNumber || !newStudent.name || !newStudent.password) {
            alert('Please fill all required fields');
            return;
        }

        try {
            await adminAPI.addStudent(newStudent);
            alert('Student added successfully!');
            setNewStudent({ rollNumber: '', name: '', email: '', password: '' });
            fetchStudents();
        } catch (error) {
            console.error('Error adding student:', error);
            alert(error.response?.data?.message || 'Failed to add student');
        }
    };

    const handleDeleteStudent = async (id) => {
        if (!confirm('Are you sure you want to delete this student?')) {
            return;
        }

        try {
            await adminAPI.deleteStudent(id);
            alert('Student deleted successfully');
            fetchStudents();
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Failed to delete student');
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!confirm('Are you sure you want to delete this question?')) {
            return;
        }

        try {
            await adminAPI.deleteQuestion(id);
            alert('Question deleted successfully');
            fetchQuestions();
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Failed to delete question');
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        ⚙️ Admin Dashboard
                    </h1>
                    <p className="text-gray-400">
                        Manage students, questions, and system settings
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`px-4 py-3 font-medium text-sm transition-all relative ${activeTab === 'students'
                            ? 'text-indigo-400'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        Students
                        {activeTab === 'students' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('questions')}
                        className={`px-4 py-3 font-medium text-sm transition-all relative ${activeTab === 'questions'
                            ? 'text-indigo-400'
                            : 'text-gray-400 hover:text-gray-300'
                            }`}
                    >
                        Questions
                        {activeTab === 'questions' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></div>
                        )}
                    </button>
                </div>

                {/* Students Tab */}
                {activeTab === 'students' && (
                    <div className="space-y-6">
                        {/* Add Student Form */}
                        <div className="bg-[#151E2E] rounded-2xl border border-gray-800 p-6 shadow-lg">
                            <h2 className="text-xl font-bold text-white mb-6">
                                Add New Student
                            </h2>
                            <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-gray-400 text-sm font-medium mb-2">
                                        Roll Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={newStudent.rollNumber}
                                        onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                                        className="w-full px-4 py-2 bg-[#0B1120] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                                        placeholder="2024001"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm font-medium mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newStudent.name}
                                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-[#0B1120] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={newStudent.email}
                                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-[#0B1120] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                                        placeholder="john@college.edu"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm font-medium mb-2">
                                        Default Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={newStudent.password}
                                        onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                                        className="w-full px-4 py-2 bg-[#0B1120] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                                        placeholder="student123"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors">
                                        Add Student
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Students List */}
                        <div className="bg-[#151E2E] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
                            <h2 className="text-xl font-bold text-white p-6 border-b border-gray-800">
                                All Students ({students.length})
                            </h2>

                            {loading ? (
                                <p className="text-gray-400 p-6">Loading...</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-900/50 text-left border-b border-gray-800">
                                                <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Roll Number</th>
                                                <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Name</th>
                                                <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Email</th>
                                                <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Score</th>
                                                <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Solved</th>
                                                <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {students.map((student) => (
                                                <tr
                                                    key={student._id}
                                                    className="hover:bg-white/5 transition-colors"
                                                >
                                                    <td className="py-4 px-6 text-white font-mono">
                                                        {student.rollNumber}
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-300">
                                                        {student.name}
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-400 text-sm">
                                                        {student.email || 'N/A'}
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-300 font-bold">
                                                        {student.score}
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-300">
                                                        {student.solvedQuestions.length}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <button
                                                            onClick={() => handleDeleteStudent(student._id)}
                                                            className="text-rose-400 hover:text-rose-300 text-sm font-medium bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Questions Tab */}
                {activeTab === 'questions' && (
                    <div className="bg-[#151E2E] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-800">
                            <h2 className="text-xl font-bold text-white">
                                All Questions ({questions.length})
                            </h2>
                            <p className="text-sm text-gray-500">
                                Use database seed script or API to add questions
                            </p>
                        </div>

                        {loading ? (
                            <p className="text-gray-400 p-6">Loading...</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-900/50 text-left border-b border-gray-800">
                                            <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Title</th>
                                            <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Topic</th>
                                            <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Difficulty</th>
                                            <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Solved By</th>
                                            <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Acceptance</th>
                                            <th className="py-4 px-6 text-xs text-gray-500 uppercase font-bold tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {questions.map((question) => (
                                            <tr
                                                key={question._id}
                                                className="hover:bg-white/5 transition-colors"
                                            >
                                                <td className="py-4 px-6 text-white font-medium">
                                                    {question.title}
                                                </td>
                                                <td className="py-4 px-6 text-gray-300">
                                                    {question.topic}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${question.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                        question.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                        }`}>
                                                        {question.difficulty}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-gray-300">
                                                    {question.solvedBy}
                                                </td>
                                                <td className="py-4 px-6 text-gray-300 font-mono text-sm">
                                                    {question.acceptanceRate.toFixed(1)}%
                                                </td>
                                                <td className="py-4 px-6">
                                                    <button
                                                        onClick={() => handleDeleteQuestion(question._id)}
                                                        className="text-rose-400 hover:text-rose-300 text-sm font-medium bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default AdminDashboard;
