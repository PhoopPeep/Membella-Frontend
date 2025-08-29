import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL

console.log('Member API Base URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
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
      console.log('Adding auth token to request')
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
    console.error('Axios Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    })

    // Handle Axios-specific errors
    if (error.response?.data) {
      const message = typeof error.response.data === 'object' &&
                    error.response.data !== null &&
                    'message' in error.response.data
                    ? String(error.response.data.message)
                    : 'Request failed'
      return new Error(message)
    } else if (error.request) {
      console.error('Network error - no response received:', error.request)
      return new Error('Network error: Unable to connect to server. Please check your internet connection.')
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
    console.log('Member API Response Success:', {
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
      console.log('Unauthorized - clearing tokens and redirecting to login')
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

  // Get a list of all owners with statistics
  async getOwners() {
    try {
      console.log('Getting all owners...')
      console.log('Request URL:', `${API_BASE_URL}/api/member/owners`)

      const response = await api.get('/api/member/owners')
      console.log('Owners API response:', response.data)

      // Ensure we return an array
      if (Array.isArray(response.data)) {
        return response.data
      } else {
        console.warn('API returned non-array data for owners:', response.data)
        return []
      }
    } catch (error: unknown) {
      console.error('Failed to get owners:', error)

      // Provide more specific error messages
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Unable to connect to server. Please check if the backend is running.')
        } else if (error.response?.status === 404) {
          throw new Error('API endpoint not found. Please check the server configuration.')
        } else if (error.response?.status === 500) {
          throw new Error('Server error. Please try again later.')
        }
      }

      throw handleApiError(error)
    }
  },

  // Get plans of a specific owner - IMPROVED VERSION
  async getOwnerPlans(ownerId: string) {
    try {
      console.log('Getting plans for owner:', ownerId)

      if (!ownerId || ownerId.trim() === '') {
        throw new Error('Owner ID is required')
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(ownerId.trim())) {
        throw new Error('Invalid owner ID format')
      }

      const cleanOwnerId = ownerId.trim()
      const requestUrl = `/api/member/owners/${cleanOwnerId}/plans`

      console.log('Request URL:', `${API_BASE_URL}${requestUrl}`)
      console.log('Owner ID being sent:', cleanOwnerId)

      const response = await api.get(requestUrl)
      console.log('Owner plans API response status:', response.status)
      console.log('Owner plans API response data:', response.data)

      // Ensure we return an array
      if (Array.isArray(response.data)) {
        console.log(`Successfully loaded ${response.data.length} plans for owner ${cleanOwnerId}`)
        return response.data
      } else {
        console.warn('API returned non-array data for owner plans:', response.data)
        return []
      }
    } catch (error: unknown) {
      console.error('Failed to get owner plans:', error)

      // Provide more specific error messages
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        })

        if (error.response?.status === 404) {
          throw new Error('Organization not found or has no plans available.')
        } else if (error.response?.status === 400) {
          const message = error.response.data?.message || 'Invalid organization ID provided.'
          throw new Error(message)
        } else if (error.response?.status === 500) {
          const message = error.response.data?.message || 'Server error while fetching plans.'
          throw new Error(message)
        } else if (error.code === 'ECONNREFUSED') {
          throw new Error('Unable to connect to server. Please check if the backend is running.')
        } else if (error.code === 'ETIMEDOUT') {
          throw new Error('Request timeout. Please try again.')
        }
      }

      throw handleApiError(error)
    }
  },

  // Get available plans (public)
  async getAvailablePlans() {
    try {
      console.log('Getting available plans...')
      const response = await api.get('/api/member/plans/available')

      if (Array.isArray(response.data)) {
        return response.data
      } else {
        console.warn('API returned non-array data for available plans:', response.data)
        return []
      }
    } catch (error: unknown) {
      console.error('Failed to get available plans:', error)
      throw handleApiError(error)
    }
  },

  // Subscribe to a plan (requires auth)
  async subscribe(planId: string) {
    try {
      console.log('Subscribing to plan:', planId)

      if (!planId || planId.trim() === '') {
        throw new Error('Plan ID is required')
      }

      const response = await api.post('/api/member/subscribe', { planId })
      return response.data
    } catch (error: unknown) {
      console.error('Failed to subscribe:', error)

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Please login to subscribe to plans.')
        } else if (error.response?.status === 404) {
          throw new Error('Plan not found or no longer available.')
        }
      }

      throw handleApiError(error)
    }
  },

  // Get member's subscription status (mockup)
  async getSubscription() {
    try {
      console.log('Getting member subscription...')
      const response = await api.get('/api/member/subscription')
      return response.data
    } catch (error: unknown) {
      console.error('Failed to get subscription:', error)

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Please login to view your subscription.')
        }
      }

      throw handleApiError(error)
    }
  },
}
