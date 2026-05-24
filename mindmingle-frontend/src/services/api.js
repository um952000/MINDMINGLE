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

export const doubtAPI = {
    getDoubts: (params = {}) => apiClient.get('/doubts/doubts/', { params }),
    getDoubt: (id) => apiClient.get(`/doubts/doubts/${id}/`),
    getUserDoubts: (userId) => apiClient.get('/doubts/doubts/', {
        params: { author: userId }
    }),  // ✅ for profile page doubts tab
    createDoubt: (data) => apiClient.post('/doubts/doubts/', data),
    upvoteDoubt: (id) => apiClient.post(`/doubts/doubts/${id}/upvote/`),
    downvoteDoubt: (id) => apiClient.post(`/doubts/doubts/${id}/downvote/`),
    reactDoubt: (id, reaction) => apiClient.post(`/doubts/doubts/${id}/react/`, { reaction_type: reaction }),
}

// Answer APIs
export const answerAPI = {
    // getAnswers: (doubtId) => apiClient.get('/doubts/answers/', {
    //     params: { doubt_id: doubtId }
    // }),

    createAnswer: (data) => apiClient.post('/doubts/answers/', data),
    upvoteAnswer: (id) => apiClient.post(`/doubts/answers/${id}/upvote/`),
    downvoteAnswer: (id) => apiClient.post(`/doubts/answers/${id}/downvote/`),
    acceptAnswer: (id) => apiClient.post(`/doubts/answers/${id}/accept/`),
    reactAnswer: (id, type) => apiClient.post(`/doubts/answers/${id}/react/`, { reaction_type: type }),
    createComment: (data) => apiClient.post('/doubts/comments/', data),

    // Get all answers
    getAllAnswers: () => apiClient.get('/doubts/answers/'),

    // Get answers for a specific doubt
    getAnswersByDoubt: (doubtId) => apiClient.get('/doubts/answers/', {
        params: { doubt_id: doubtId }
    }),

    // Get answers by a specific author/user
    getAnswersByAuthor: (authorId) =>
        apiClient.get('/doubts/answers/', {
            params: { author: authorId }
        }),

    // Get answers by author inside a doubt
    getAnswersByDoubtAndAuthor: (doubtId, authorId) =>
        apiClient.get('/doubts/answers/', {
            params: {
                doubt_id: doubtId,
                author: authorId
            }
        }),

    // Get single answer details
    getAnswerById: (id) =>
        apiClient.get(`/doubts/answers/${id}/`),
}

export const commentAPI = {
    // Get comments for a doubt
    getDoubtComments: (doubtId) => apiClient.get('/doubts/comments/', { params: { doubt_id: doubtId } }),

    // Get comments for an answer
    getAnswerComments: (answerId) => apiClient.get('/doubts/comments/', { params: { answer_id: answerId } }),

    // Post a comment on a doubt
    commentOnDoubt: (doubtId, content) => apiClient.post('/doubts/comments/', {
        doubt: doubtId,
        content,
    }),

    // Post a comment on an answer
    commentOnAnswer: (answerId, content) => apiClient.post('/doubts/comments/', {
        answer: answerId,
        content,
    }),

    // Delete a comment
    deleteComment: (commentId) => apiClient.delete(`/doubts/comments/${commentId}/`),
}

// Auth APIs (you'll implement later)
export const authAPI = {
    login: (credentials) => apiClient.post('/core/api/token/', credentials),
    me: () => apiClient.get('/core/auth/me/'),
    register: (data) => apiClient.post('/core/register/', data),
    getProfile: (id) => apiClient.get(`/core/users/${id}/`),
    updateProfile: (data) => apiClient.put('/core/users/update_profile/', data),
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

export const friendshipAPI = {

    // =========================
    // GET ALL FRIENDSHIPS
    // =========================
    getAll: (page = 1) =>
        apiClient.get('/core/friendships/', {
            params: { page }
        }),

    // =========================
    // GET SINGLE FRIENDSHIP
    // =========================
    getFriendship: (id) =>
        apiClient.get(`/core/friendships/${id}/`),

    // =========================
    // SEND FOLLOW REQUEST
    // =========================
    sendRequest: (toUserId, fromUserId) =>
        apiClient.post('/core/friendships/', {
            from_user: fromUserId,
            to_user: toUserId,
            status: 'pending'
        }),

    // =========================
    // ACCEPT REQUEST
    // =========================
    acceptRequest: (id) =>
        apiClient.post(`/core/friendships/${id}/accept/`),

    // =========================
    // REJECT REQUEST
    // =========================
    rejectRequest: (id) =>
        apiClient.post(`/core/friendships/${id}/reject/`),

    // =========================
    // REMOVE FRIENDSHIP / UNFOLLOW
    // =========================
    removeFriendship: (id) =>
        apiClient.delete(`/core/friendships/${id}/`),

    // =========================
    // GET RECEIVED REQUESTS
    // =========================
    getReceivedRequests: () =>
        apiClient.get('/core/friendships/received_requests/'),

    // =========================
    // GET SENT REQUESTS
    // =========================
    getSentRequests: () =>
        apiClient.get('/core/friendships/sent_requests/'),

    // =========================
    // GET FOLLOWERS
    // =========================
    getFollowers: () =>
        apiClient.get('/core/friendships/followers/'),

    // =========================
    // GET FOLLOWING
    // =========================
    getFollowing: () =>
        apiClient.get('/core/friendships/following/'),

    // =========================
    // FULL UPDATE
    // =========================
    updateFriendship: (id, data) =>
        apiClient.put(`/core/friendships/${id}/`, data),

    // =========================
    // PARTIAL UPDATE
    // =========================
    patchFriendship: (id, data) =>
        apiClient.patch(`/core/friendships/${id}/`, data),

}

// AI APIs
export const aiAPI = {

    solveDoubt: (prompt) =>
        apiClient.post('/ai/solve-doubt/', {
            prompt
        }),
}
export const chatAPI = {

    getConversations: () =>
        api.get('/chat/conversations/'),

    createConversation: (userId) =>
        api.post('/chat/conversations/', {
            user_id: userId.user_id
        }),

    getMessages: (conversationId) =>
        api.get(`/chat/conversations/${conversationId}/messages/`),

    sendMessage: (conversationId, data) =>
        api.post(
            `/chat/conversations/${conversationId}/messages/`,
            data
        ),

    // ✅ new — upload media file
    uploadFile: (conversationId, file, messageType) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('message_type', messageType)
        return api.post(
            `/chat/conversations/${conversationId}/messages/upload/`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
    },
}