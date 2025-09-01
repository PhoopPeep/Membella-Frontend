// member-portal/src/api/payment.ts
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 1 minute timeout for payment operations
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
  (error) => {
    return Promise.reject(error)
  }
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
  createdAt: string
  updatedAt: string
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

    if (error.response?.data?.message) {
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
        return response.data.publicKey
      } else {
        throw new Error('Failed to get Omise public key from server')
      }
    } catch (error) {
      console.error('Failed to get Omise public key:', error)
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

      const response = await api.post('/api/payments/subscription', paymentData)

      if (response.data.success && response.data.data) {
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

  // Get payment history
  async getPaymentHistory(): Promise<PaymentHistory[]> {
    try {
      console.log('Getting payment history')

      const response = await api.get('/api/payments/history')

      if (response.data.success) {
        // Ensure we return an array
        if (Array.isArray(response.data.data)) {
          return response.data.data
        } else {
          console.warn('API returned non-array data for payment history:', response.data.data)
          return []
        }
      } else {
        throw new Error(response.data.message || 'Failed to get payment history')
      }
    } catch (error) {
      console.error('Failed to get payment history:', error)
      throw handleApiError(error)
    }
  },

  // Poll payment status (for PromptPay)
  async pollPaymentStatus(paymentId: string, maxAttempts = 60): Promise<PaymentStatus> {
    let attempts = 0

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++
          console.log(`Polling payment status attempt ${attempts}/${maxAttempts} for payment: ${paymentId}`)

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
            // Continue polling after 5 seconds
            console.log(`Payment still ${status.status}, continuing to poll...`)
            setTimeout(poll, 5000)
          }
        } catch (error) {
          console.error(`Polling attempt ${attempts} failed:`, error)

          if (attempts >= maxAttempts) {
            reject(handleApiError(error))
          } else {
            // Retry after 5 seconds on error
            setTimeout(poll, 5000)
          }
        }
      }

      // Start polling
      poll()
    })
  }
}
