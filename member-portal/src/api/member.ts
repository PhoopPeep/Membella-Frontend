import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('member_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('member_token')
      localStorage.removeItem('member_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export const memberApi = {
  // Get available plans (public)
  async getAvailablePlans() {
    const response = await api.get('/api/member/plans/available')
    return response.data
  },

  // Subscribe to a plan (requires auth)
  async subscribe(planId: string) {
    const response = await api.post('/api/member/subscribe', { planId })
    return response.data
  },

  // Get member's subscription
  async getSubscription() {
    const response = await api.get('/api/member/subscription')
    return response.data
  },

  // Member auth
  async login(email: string, password: string) {
    const response = await api.post('/api/auth/login', {
      email,
      password,
      role: 'member',
    })
    return response.data
  },

  async register(userData: { email: string; password: string; fullName: string; phone?: string }) {
    const response = await api.post('/api/auth/register', {
      ...userData,
      role: 'member',
    })
    return response.data
  },
}
