// frontend/src/service/dashboardService.ts
import api from '../router/api'

export interface Plan {
  id: string
  name: string
  description: string
  price: number
  duration: number
  features: string[]
  createdAt: string
  updatedAt: string
}

export interface Member {
  id: string
  email: string
  fullName?: string
  phone?: string
  planId: string
  status: 'active' | 'inactive' | 'cancelled'
  subscriptionStart: string
  subscriptionEnd: string | null
  createdAt: string
}

export interface RevenueData {
  month: string
  revenue: number
}

export interface DashboardStats {
  totalRevenue: number
  totalMembers: number
  totalPlans: number
  totalFeatures: number
  growthPercentage: number
  activeSubscriptions: number
  cancelledSubscriptions: number
  revenueThisMonth: number
  revenueLastMonth: number
  newPlansThisMonth: number
}

export const dashboardService = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('Fetching dashboard stats...')
      const response = await api.get('/api/dashboard/stats')
      console.log('Dashboard stats response:', response.data)

      // Handle response format
      if (response.data && typeof response.data === 'object') {
        return response.data
      } else {
        throw new Error('Invalid dashboard stats response format')
      }
    } catch (error: any) {
      console.error('Dashboard stats error:', error)
      throw error
    }
  },

  // Get revenue data for charts
  async getRevenueData(period: string = '12months'): Promise<RevenueData[]> {
    try {
      console.log('Fetching revenue data for period:', period)

      // Validate period
      if (!['6months', '12months'].includes(period)) {
        throw new Error('Invalid period. Must be 6months or 12months')
      }

      const response = await api.get(`/api/dashboard/revenue?period=${period}`)
      console.log('Revenue data response:', response.data)

      if (Array.isArray(response.data)) {
        return response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data
      } else {
        throw new Error('Invalid revenue data response format')
      }
    } catch (error: any) {
      console.error('Revenue data error:', error)
      throw error
    }
  },

  // Get plans for dashboard
  async getPlans(): Promise<Plan[]> {
    try {
      console.log('Fetching plans for dashboard...')
      const response = await api.get('/api/plans')
      console.log('Plans response:', response.data)

      if (Array.isArray(response.data)) {
        return response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data
      } else {
        throw new Error('Invalid plans response format')
      }
    } catch (error: any) {
      console.error('Plans error:', error)
      throw error
    }
  },

  // Get members/subscribers
  async getMembers(): Promise<Member[]> {
    try {
      console.log('Fetching members...')
      const response = await api.get('/api/dashboard/members')
      console.log('Members response:', response.data)

      if (Array.isArray(response.data)) {
        return response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data
      } else {
        return []
      }
    } catch (error: any) {
      console.error('Members error:', error)
      // Return empty array if no members found
      return []
    }
  },

  // Get member distribution by plan
  async getMembersByPlan(): Promise<
    Array<{ planId: string; planName: string; memberCount: number }>
  > {
    try {
      console.log('Fetching members by plan...')
      const response = await api.get('/api/dashboard/members-by-plan')
      console.log('Members by plan response:', response.data)

      if (Array.isArray(response.data)) {
        return response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data
      } else {
        return []
      }
    } catch (error: any) {
      console.error('Members by plan error:', error)
      // Return empty array if no data found
      return []
    }
  },

  // Get members for a specific plan
  async getPlanMembers(planId: string): Promise<Member[]> {
    try {
      console.log('Fetching members for plan:', planId)
      const response = await api.get(`/api/dashboard/plans/${planId}/members`)
      console.log('Plan members response:', response.data)

      if (Array.isArray(response.data)) {
        return response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data
      } else {
        return []
      }
    } catch (error: any) {
      console.error('Plan members error:', error)
      // Return empty array if no data found
      return []
    }
  },
}
