import axios, { type AxiosError } from 'axios'

interface ErrorResponse {
  message?: string
  errors?: Array<{ message: string }>
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000, // เพิ่ม timeout เป็น 30 วินาที
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
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  },
)

// Helper: Handle authentication errors
const handleAuthError = (error: AxiosError<ErrorResponse>) => {
  const isAuthCallback = error.config?.url?.includes('/auth/callback')

  if (isAuthCallback) {
    console.warn('Auth callback failed:', error.response?.data?.message || 'Invalid token')
    return Promise.reject(new Error(error.response?.data?.message || 'Authentication failed'))
  }

  // Token expired or invalid - clear auth and redirect to login
  console.warn('Authentication failed:', error.response?.data?.message || 'Invalid token')
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  // Only redirect if not already on login page and not on auth callback page
  if (globalThis.window.location.pathname !== '/login' && !globalThis.window.location.pathname.includes('/auth/callback')) {
    globalThis.window.location.href = '/login'
  }
  return Promise.reject(new Error('Authentication failed. Please login again.'))
}

// Helper: Handle validation errors
const handleValidationError = (error: AxiosError<ErrorResponse>) => {
  const errorData = error.response?.data
  if (errorData?.errors && Array.isArray(errorData.errors)) {
    const errorMessages = errorData.errors.map((err) => err.message).join(', ')
    return Promise.reject(new Error(errorMessages))
  }
  return Promise.reject(new Error(errorData?.message || 'Validation failed'))
}

// Helper: Handle network errors
const handleNetworkError = (error: AxiosError<ErrorResponse>) => {
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return Promise.reject(new Error('Request timeout. Please check your connection and try again.'))
  }

  if (error.code === 'ERR_NETWORK') {
    return Promise.reject(new Error('Network error. Please check your connection and try again.'))
  }

  return null
}

// Error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)

    // Handle authentication errors (401/403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      return handleAuthError(error)
    }

    // Handle validation errors (400)
    if (error.response?.status === 400) {
      return handleValidationError(error)
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
        new Error(error.response.data.message || 'Too many requests. Please wait before trying again.'),
      )
    }

    // Handle server errors (500+)
    if (error.response?.status >= 500) {
      return Promise.reject(new Error('Server error. Please try again later.'))
    }

    // Handle network errors
    const networkError = handleNetworkError(error)
    if (networkError) {
      return networkError
    }

    // Default error
    return Promise.reject(
      new Error(error.response?.data?.message || error.message || 'An unexpected error occurred'),
    )
  },
)

export default api
