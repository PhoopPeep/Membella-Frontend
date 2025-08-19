import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

console.log('Member API Base URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor with debugging
api.interceptors.request.use(
  (config) => {
    console.log('Member API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      headers: config.headers
    })

    const token = localStorage.getItem('member_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Member API Request Error:', error)
    return Promise.reject(error)
  }
)

// Helper function to safely handle unknown errors
const handleApiError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    // Handle Axios-specific errors
    if (error.response?.data) {
      const message = typeof error.response.data === 'object' &&
                    error.response.data !== null &&
                    'message' in error.response.data
                    ? String(error.response.data.message)
                    : 'Request failed'
      return new Error(message)
    } else if (error.request) {
      return new Error('Network error: Unable to connect to server')
    } else {
      return new Error('Request failed: ' + error.message)
    }
  } else if (error instanceof Error) {
    return error
  } else {
    return new Error('An unknown error occurred')
  }
}

// Response interceptor with detailed error logging
api.interceptors.response.use(
  (response) => {
    console.log('Member API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      url: response.config.url
    })
    return response
  },
  (error: unknown) => {
    console.error('Member API Response Error:', {
      message: axios.isAxiosError(error) ? error.message : 'Unknown error',
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
      statusText: axios.isAxiosError(error) ? error.response?.statusText : undefined,
      data: axios.isAxiosError(error) ? error.response?.data : undefined,
      url: axios.isAxiosError(error) ? error.config?.url : undefined,
      fullError: error
    })

    // Handle 401 unauthorized
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('member_token')
      localStorage.removeItem('member_user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export const memberApi = {
  // Member authentication
  async register(userData: { fullName: string; email: string; password: string; phone?: string }) {
    try {
      console.log('Attempting member registration with data:', {
        fullName: userData.fullName,
        email: userData.email,
        hasPassword: !!userData.password,
        phone: userData.phone || 'not provided'
      })

      const response = await api.post('/api/member/auth/register', userData)
      return response.data
    } catch (error: unknown) {
      console.error('Member registration failed:', error)

      if (axios.isAxiosError(error) && error.response?.data) {
        console.error('Backend error response:', error.response.data)
        const message = typeof error.response.data === 'object' &&
                       error.response.data !== null &&
                       'message' in error.response.data
                       ? String(error.response.data.message)
                       : 'Registration failed'
        throw new Error(message)
      }

      throw handleApiError(error)
    }
  },

  async login(email: string, password: string) {
    try {
      console.log('Attempting member login for:', email)

      const response = await api.post('/api/member/auth/login', {
        email,
        password,
      })
      return response.data
    } catch (error: unknown) {
      console.error('Member login failed:', error)
      throw handleApiError(error)
    }
  },

  async resendVerification(email: string) {
    try {
      console.log('Resending verification email to:', email)

      const response = await api.post('/api/member/auth/resend-verification', {
        email,
      })
      return response.data
    } catch (error: unknown) {
      console.error('Resend verification failed:', error)
      throw handleApiError(error)
    }
  },

  async handleAuthCallback(accessToken: string, refreshToken: string) {
    try {
      console.log('Processing auth callback')

      const response = await api.post('/api/member/auth/callback', {
        access_token: accessToken,
        refresh_token: refreshToken,
        type: 'signup',
      })
      return response.data
    } catch (error: unknown) {
      console.error('Auth callback failed:', error)
      throw handleApiError(error)
    }
  },

  // Get a list of all owners with statistics.
  async getOwners() {
    try {
      console.log('Getting all owners')
      const response = await api.get('/api/member/owners')
      return response.data
    } catch (error: unknown) {
      console.error('Failed to get owners:', error)
      throw handleApiError(error)
    }
  },

  // Get plans of a specific owner
  async getOwnerPlans(ownerId: string) {
    try {
      console.log('Getting plans for owner:', ownerId)
      const response = await api.get(`/api/member/owners/${ownerId}/plans`)
      return response.data
    } catch (error: unknown) {
      console.error('Failed to get owner plans:', error)
      throw handleApiError(error)
    }
  },

  // Get available plans (public)
  async getAvailablePlans() {
    try {
      const response = await api.get('/api/member/plans/available')
      return response.data
    } catch (error: unknown) {
      throw handleApiError(error)
    }
  },

  // Subscribe to a plan (requires auth)
  async subscribe(planId: string) {
    try {
      const response = await api.post('/api/member/subscribe', { planId })
      return response.data
    } catch (error: unknown) {
      throw handleApiError(error)
    }
  },

  // Get member's subscription
  async getSubscription() {
    try {
      const response = await api.get('/api/member/subscription')
      return response.data
    } catch (error: unknown) {
      throw handleApiError(error)
    }
  },
}
