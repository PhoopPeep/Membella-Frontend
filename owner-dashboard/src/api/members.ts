import { apiClient } from './client'

export interface PlanStats {
  id: string
  name: string
  description: string
  price: number
  duration: number
  totalSubscriptions: number
  activeSubscriptions: number
  totalRevenue: number
  members: Array<{
    id: string
    fullName: string
    email: string
  }>
}

export interface Member {
  id: string
  fullName: string
  email: string
  phone?: string
  createdAt: string
  currentPlan?: {
    id: string
    name: string
    price: number
    duration: number
    startDate: string
    endDate: string
    status: string
  }
  paymentHistory: Array<{
    id: string
    amount: number
    status: string
    planName: string
    createdAt: string
  }>
  totalSpent: number
}

export const membersApi = {
  // Get plan statistics with member counts
  getPlanStats: async (): Promise<PlanStats[]> => {
    const response = await apiClient.get('/members/plan-stats')
    return response.data
  },

  // Get all members with their subscriptions and payment history
  getMembers: async (): Promise<Member[]> => {
    const response = await apiClient.get('/members/members')
    return response.data
  },

  // Delete member (cancel all subscriptions)
  deleteMember: async (memberId: string): Promise<{ success: boolean; message: string; cancelledSubscriptions: number }> => {
    const response = await apiClient.delete(`/members/members/${memberId}`)
    return response.data
  }
}
