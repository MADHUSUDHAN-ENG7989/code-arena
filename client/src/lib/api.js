import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log('API_URL:', API_URL); // Debug log

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth APIs
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    changePassword: (data) => api.post('/auth/change-password', data),
    getCurrentUser: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
};

// Questions APIs
export const questionsAPI = {
    getAll: (params) => api.get('/questions', { params }),
    getById: (id) => api.get(`/questions/${id}`),
    getTopics: () => api.get('/questions/meta/topics'),
};

// Submissions APIs
export const submissionsAPI = {
    run: (data) => api.post('/submissions/run', data),
    submit: (data) => api.post('/submissions/submit', data),
    getHistory: (questionId) => api.get(`/submissions/history/${questionId}`),
    getAllHistory: () => api.get('/submissions/history'),
    analyze: (data) => api.post('/submissions/analyze', data),
};

// Challenges APIs
export const challengesAPI = {
    getDaily: () => api.get('/challenges/daily'),
    getLeaderboard: (timeframe = 'weekly') => api.get('/challenges/leaderboard', { params: { timeframe } }),
};

// Admin APIs
export const adminAPI = {
    // Students
    addStudent: (data) => api.post('/admin/students', data),
    getStudents: () => api.get('/admin/students'),
    updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
    deleteStudent: (id) => api.delete(`/admin/students/${id}`),

    // Questions
    addQuestion: (data) => api.post('/admin/questions', data),
    updateQuestion: (id, data) => api.put(`/admin/questions/${id}`, data),
    deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),

    setDailyChallenge: (data) => api.post('/admin/daily-challenge', data),
};

// Social APIs
export const socialAPI = {
    searchUsers: (query) => api.get('/social/search', { params: { query } }),
    sendFriendRequest: (userId) => api.post(`/social/friend-request/${userId}`),
    respondToRequest: (requestId, action) => api.put(`/social/friend-request/${requestId}`, { action }),
    getFriends: () => api.get('/social/friends'),
    getPublicProfile: (userId) => api.get(`/social/profile/${userId}`),
};

export default api;
