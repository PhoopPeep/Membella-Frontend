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
