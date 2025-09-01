import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for payment operations
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

    // Log request for debugging
    console.log('Payment API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      hasAuth: !!token
    })

    return config
  },
  (error) => {
    console.error('Payment API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Payment API Response Success:', {
      status: response.status,
      url: response.config.url,
      success: response.data?.success
    })
    return response
  },
  (error) => {
    console.error('Payment API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    })

    if (error.response?.status === 401) {
      localStorage.removeItem('member_token')
      localStorage.removeItem('member_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface PaymentData {
  planId: string
  paymentMethod: 'card' | 'promptpay'
  paymentSource?: string // Omise token for card payments
  customerData?: {
    name?: string
    email?: string
    phone?: string
  }
}

export interface PaymentResult {
  success: boolean
  paymentId: string
  chargeId: string
  amount: number
  currency: string
  status: string
  qr_code_url?: string // For PromptPay
  expires_at?: string // For PromptPay
}

export interface PaymentStatus {
  id: string
  status: 'pending' | 'successful' | 'failed' | 'expired' | 'refunded'
  amount: number
  currency: string
  paymentMethod: string
  description: string
  planName: string
  organization: string
  subscription?: {
    id: string
    status: string
    startDate: string
    endDate: string
    daysRemaining: number | null
  }
  createdAt: string
  updatedAt: string
}

export interface PaymentHistory {
  id: string
  planName: string
  organization: string
  amount: number
  currency: string
  paymentMethod: string
  status: string
  description: string
  subscription?: {
    id: string
    status: string
    startDate: string
    endDate: string
  }
  createdAt: string
  updatedAt: string
}

export interface PaymentMethod {
  type: 'card' | 'promptpay'
  name: string
  description: string
  icon: string
  enabled: boolean
  currencies: string[]
  processing_time: string
}

const handleApiError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    console.error('Payment API Error:', {
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

    // Handle specific HTTP status codes
    if (error.response?.status === 400) {
      return new Error(error.response.data?.message || 'Invalid request data')
    } else if (error.response?.status === 401) {
      return new Error('Authentication required. Please log in again.')
    } else if (error.response?.status === 402) {
      return new Error(error.response.data?.message || 'Payment required')
    } else if (error.response?.status === 403) {
      return new Error('Access denied')
    } else if (error.response?.status === 404) {
      return new Error('Payment or resource not found')
    } else if (error.response?.status === 409) {
      return new Error(error.response.data?.message || 'Conflict - resource already exists')
    } else if (error.response?.status === 429) {
      return new Error('Too many requests. Please wait before trying again.')
    } else if ((error.response?.status ?? 0) >= 500) {
      return new Error('Server error. Please try again later.')
    } else if (error.response?.data?.message) {
      return new Error(error.response.data.message)
    } else if (error.request) {
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

export const paymentApi = {
  // Get Omise public key
  async getOmisePublicKey(): Promise<string> {
    try {
      console.log('Getting Omise public key')
      const response = await api.get('/api/payments/omise-key')

      if (response.data.success && response.data.publicKey) {
        console.log('Omise public key received successfully')
        return response.data.publicKey
      } else {
        throw new Error('Failed to get Omise public key from server')
      }
    } catch (error) {
      console.error('Failed to get Omise public key:', error)
      throw handleApiError(error)
    }
  },

  // Get available payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      console.log('Getting payment methods')
      const response = await api.get('/api/payments/methods')

      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data
      } else {
        throw new Error('Failed to get payment methods')
      }
    } catch (error) {
      console.error('Failed to get payment methods:', error)
      throw handleApiError(error)
    }
  },

  // Create subscription payment
  async createSubscriptionPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      console.log('Creating subscription payment:', {
        planId: paymentData.planId,
        paymentMethod: paymentData.paymentMethod,
        hasPaymentSource: !!paymentData.paymentSource,
        customerData: paymentData.customerData
      })

      // Validate required fields
      if (!paymentData.planId || typeof paymentData.planId !== 'string') {
        throw new Error('Plan ID is required')
      }

      if (!paymentData.paymentMethod || !['card', 'promptpay'].includes(paymentData.paymentMethod)) {
        throw new Error('Valid payment method is required')
      }

      if (paymentData.paymentMethod === 'card' && !paymentData.paymentSource) {
        throw new Error('Payment source token is required for card payments')
      }

      const response = await api.post('/api/payments/subscription', paymentData)

      if (response.data.success && response.data.data) {
        console.log('Subscription payment created successfully:', response.data.data.paymentId)
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Payment creation failed')
      }
    } catch (error) {
      console.error('Payment creation failed:', error)
      throw handleApiError(error)
    }
  },

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      console.log('Getting payment status:', paymentId)

      if (!paymentId || paymentId.trim() === '') {
        throw new Error('Payment ID is required')
      }

      const response = await api.get(`/api/payments/status/${paymentId.trim()}`)

      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to get payment status')
      }
    } catch (error) {
      console.error('Failed to get payment status:', error)
      throw handleApiError(error)
    }
  },

  // Poll payment status (for PromptPay)
  async pollPaymentStatus(paymentId: string, maxAttempts = 60): Promise<PaymentStatus> {
    try {
      console.log(`Starting payment status polling for: ${paymentId}`);

      if (!paymentId || paymentId.trim() === '') {
        throw new Error('Payment ID is required')
      }

      const response = await api.get(`/api/payments/poll/${paymentId.trim()}`, {
        params: { maxAttempts },
        timeout: (maxAttempts * 3 + 30) * 1000 // Dynamic timeout based on max attempts
      })

      if (response.data.success && response.data.data) {
        console.log('Payment polling completed successfully')
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Payment polling failed')
      }
    } catch (error) {
      console.error('Payment polling failed:', error)

      // Handle timeout errors specifically
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new Error('Payment verification timeout. Please check your payment status manually.')
      }

      throw handleApiError(error)
    }
  },

  // Get payment history
  async getPaymentHistory(options?: {
    limit?: number
    offset?: number
    status?: string
  }): Promise<{
    data: PaymentHistory[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }> {
    try {
      console.log('Getting payment history')

      const params: Record<string, string | number | undefined> = {}
      if (options?.limit) params.limit = options.limit
      if (options?.offset) params.offset = options.offset
      if (options?.status) params.status = options.status

      const response = await api.get('/api/payments/history', { params })

      if (response.data.success) {
        // Ensure we return an array
        const data = Array.isArray(response.data.data) ? response.data.data : []
        return {
          data,
          pagination: response.data.pagination || {
            total: data.length,
            limit: options?.limit || 50,
            offset: options?.offset || 0,
            hasMore: false
          }
        }
      } else {
        throw new Error(response.data.message || 'Failed to get payment history')
      }
    } catch (error) {
      console.error('Failed to get payment history:', error)
      throw handleApiError(error)
    }
  },

  // Simplified polling for PromptPay (client-side implementation)
  async simplePaymentPolling(paymentId: string, maxAttempts = 60): Promise<PaymentStatus> {
    let attempts = 0

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++
          console.log(`Simple polling attempt ${attempts}/${maxAttempts} for payment: ${paymentId}`)

          const status = await this.getPaymentStatus(paymentId)

          if (status.status === 'successful') {
            console.log('Payment successful, stopping polling')
            resolve(status)
          } else if (status.status === 'failed' || status.status === 'expired') {
            console.log(`Payment ${status.status}, stopping polling`)
            reject(new Error(`Payment ${status.status}`))
          } else if (attempts >= maxAttempts) {
            console.log('Polling timeout reached')
            reject(new Error('Payment verification timeout. Please check your payment status manually.'))
          } else {
            // Continue polling after 3 seconds
            console.log(`Payment still ${status.status}, continuing to poll...`)
            setTimeout(poll, 3000)
          }
        } catch (error) {
          console.error(`Polling attempt ${attempts} failed:`, error)

          if (attempts >= maxAttempts) {
            reject(handleApiError(error))
          } else {
            // Retry after 3 seconds on error
            setTimeout(poll, 3000)
          }
        }
      }

      // Start polling immediately
      poll()
    })
  },

  // Validate payment data before sending
  validatePaymentData(paymentData: PaymentData): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!paymentData.planId || typeof paymentData.planId !== 'string' || paymentData.planId.trim() === '') {
      errors.push('Plan ID is required')
    }

    if (!paymentData.paymentMethod || !['card', 'promptpay'].includes(paymentData.paymentMethod)) {
      errors.push('Valid payment method is required (card or promptpay)')
    }

    if (paymentData.paymentMethod === 'card') {
      if (!paymentData.paymentSource || typeof paymentData.paymentSource !== 'string' || paymentData.paymentSource.trim() === '') {
        errors.push('Payment source token is required for card payments')
      } else if (!paymentData.paymentSource.startsWith('tokn_')) {
        errors.push('Invalid payment token format')
      }

      if (paymentData.customerData?.name && (typeof paymentData.customerData.name !== 'string' || paymentData.customerData.name.trim() === '')) {
        errors.push('Valid cardholder name is required')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}
