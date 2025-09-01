// member-portal/src/api/subscription.ts
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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

export interface Feature {
  id: string
  name: string
  description: string
}

export interface Payment {
  id: string
  amount: number
  currency: string
  method: string
  status: string
  description: string
  paidAt: string
}

export interface Subscription {
  id: string
  planId: string
  planName: string
  planDescription: string
  organization: string
  organizationContact?: string
  price: number
  duration: number
  status: 'active' | 'cancelled' | 'expired'
  startDate: string
  endDate: string
  daysRemaining: number
  isActive: boolean
  isExpired: boolean
  features: Feature[]
  payment: Payment
  member?: {
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface SubscriptionStats {
  totalSubscriptions: number
  activeSubscriptions: number
  expiredSubscriptions: number
  cancelledSubscriptions: number
  totalSpent: number
  currency: string
}

export const subscriptionApi = {
  // Get all member subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    try {
      console.log('Getting member subscriptions')

      const response = await api.get('/api/subscriptions')

      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to get subscriptions')
      }
    } catch (error) {
      console.error('Failed to get subscriptions:', error)

      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }

      throw new Error('Failed to cancel subscription')
    }
  },
  // Get subscription by ID
  async getSubscriptionById(subscriptionId: string): Promise<Subscription> {
    try {
      console.log('Getting subscription details:', subscriptionId)

      const response = await api.get(`/api/subscriptions/${subscriptionId}`)

      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to get subscription details')
      }
    } catch (error) {
      console.error('Failed to get subscription details:', error)

      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }

      throw new Error('Failed to get subscription details')
    }
  },

  // Get subscription statistics
  async getSubscriptionStats(): Promise<SubscriptionStats> {
    try {
      console.log('Getting subscription stats')

      const response = await api.get('/api/subscriptions/stats')

      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to get subscription stats')
      }
    } catch (error) {
      console.error('Failed to get subscription stats:', error)

      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }

      throw new Error('Failed to get subscription statistics')
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      console.log('Cancelling subscription:', subscriptionId)

      const response = await api.patch(`/api/subscriptions/${subscriptionId}/status`, {
        status: 'cancelled'
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error)

      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to cancel subscription')
    }
  },
}
