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
  planId: string
  status: 'active' | 'inactive' | 'cancelled'
  subscriptionStart: string
  subscriptionEnd: string
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
  growthPercentage: number
  activeSubscriptions: number
  cancelledSubscriptions: number
  revenueThisMonth: number
  revenueLastMonth: number
  newMembersThisMonth: number
}

export const dashboardService = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/api/dashboard/stats')
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to fetch dashboard statistics')
    }
  },

  // Get revenue data for charts
  async getRevenueData(period: string = '12months'): Promise<RevenueData[]> {
    try {
      const response = await api.get(`/api/dashboard/revenue?period=${period}`)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to fetch revenue data')
    }
  },

  // Get plans for dashboard
  async getPlans(): Promise<Plan[]> {
    try {
      const response = await api.get('/api/plans')
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to fetch plans')
    }
  },

  // Get members/subscribers
  async getMembers(): Promise<Member[]> {
    try {
      const response = await api.get('/api/dashboard/members')
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to fetch members')
    }
  },

  // Get member distribution by plan
  async getMembersByPlan(): Promise<
    Array<{ planId: string; planName: string; memberCount: number }>
  > {
    try {
      const response = await api.get('/api/dashboard/members-by-plan')
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to fetch members by plan')
    }
  },
}
