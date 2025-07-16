import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)

    // Handle different types of errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid - clear auth and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(new Error('Authentication failed. Please login again.'))
    }

    // Handle validation errors (400)
    if (error.response?.status === 400) {
      const errorData = error.response.data
      if (errorData.errors && Array.isArray(errorData.errors)) {
        // Multiple validation errors
        const errorMessages = errorData.errors.map((err) => err.message).join(', ')
        return Promise.reject(new Error(errorMessages))
      }
      return Promise.reject(new Error(errorData.message || 'Validation failed'))
    }

    // Handle not found errors (404)
    if (error.response?.status === 404) {
      return Promise.reject(new Error(error.response.data.message || 'Resource not found'))
    }

    // Handle conflict errors (409)
    if (error.response?.status === 409) {
      return Promise.reject(new Error(error.response.data.message || 'Resource already exists'))
    }

    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      return Promise.reject(
        new Error(
          error.response.data.message || 'Too many requests. Please wait before trying again.',
        ),
      )
    }

    // Handle server errors (500+)
    if (error.response?.status >= 500) {
      return Promise.reject(new Error('Server error. Please try again later.'))
    }

    // Network or timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return Promise.reject(
        new Error('Request timeout. Please check your connection and try again.'),
      )
    }

    if (error.code === 'ERR_NETWORK') {
      return Promise.reject(new Error('Network error. Please check your connection and try again.'))
    }

    // Default error
    return Promise.reject(
      new Error(error.response?.data?.message || error.message || 'An unexpected error occurred'),
    )
  },
)

export default api
