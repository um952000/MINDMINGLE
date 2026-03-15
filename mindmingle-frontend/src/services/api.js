// Axios is a library for making HTTP(GET, POST, PUT etc) requests. We'll use it to communicate with our Django backend API.
import axios from 'axios'

const API_BASE = 'http://localhost:8000/api'  // Your Django API

//create an axios instance with default settings for our API. This allows us to easily manage headers, base URL, and other settings in one place.
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor for auth token. This will add the token to every request if it's available in localStorage.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`  // ✅ already correct for JWT
    }
    return config
})
export const apiClient = api

// api.js - add this utility function
export const extractErrorMessage = (err, fallback = 'Something went wrong') => {
    const data = err.response?.data
    if (!data) return fallback
    if (typeof data === 'string') return data
    return (
        data.detail ||
        data.non_field_errors?.[0] ||
        Object.values(data)[0]?.[0] ||  // first field error
        fallback
    )
}

// Doubt APIs
export const doubtAPI = {
    getDoubts: (params = {}) => apiClient.get('/doubts/doubts/', { params }),
    getDoubt: (id) => apiClient.get(`/doubts/doubts/${id}/`),
    createDoubt: (data) => apiClient.post('/doubts/doubts/', data),
    upvoteDoubt: (id) => apiClient.post(`/doubts/${id}/upvote/`),
    downvoteDoubt: (id) => apiClient.post(`/doubts/${id}/downvote/`),
    reactDoubt: (id, reaction) => apiClient.post(`/doubts/${id}/react/`, { reaction_type: reaction }),
}

// Answer APIs
export const answerAPI = {
    getAnswers: (doubtId) => apiClient.get('/answers/', { params: { doubt_id: doubtId } }),
    createAnswer: (data) => apiClient.post('/answers/', data),
}

// Auth APIs (you'll implement later)
export const authAPI = {
    login: (credentials) => apiClient.post('/core/api/token/', credentials),
    me: () => apiClient.get('/core/auth/me/'),
    register: (data) => apiClient.post('/core/register/', data),
    getProfile: (id) => apiClient.get(`/core/users/${id}/`),
}

export const gamificationAPI = {
    // Badges
    getAllBadges: () => apiClient.get('/gamification/badges/'),
    getMyBadges: () => apiClient.get('/gamification/user-badges/'),
    getUserBadges: (userId) => apiClient.get(`/gamification/user-badges/user/${userId}/`),

    // Reputation
    getMyReputation: () => apiClient.get('/gamification/reputation/'),
    getMyStats: () => apiClient.get('/gamification/reputation/summary/'),

    // Level
    getMyLevel: () => apiClient.get('/gamification/level/me/'),
    updateStreak: () => apiClient.post('/gamification/level/me/streak/'),

    // Leaderboard
    getLeaderboard: (period = 'all_time') => apiClient.get(`/gamification/leaderboard/?period=${period}`),
    getMyRank: (period = 'all_time') => apiClient.get(`/gamification/leaderboard/my-rank/?period=${period}`),
}