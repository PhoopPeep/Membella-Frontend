export interface DashboardStats {
  totalRevenue: number
  totalMembers: number
  totalPlans: number
  totalFeatures: number
  growthPercentage: number
  activeSubscriptions: number
  cancelledSubscriptions: number
  totalSubscriptions?: number
  revenueThisMonth: number
  revenueLastMonth: number
  newPlansThisMonth: number
}

export interface RevenueData {
  month: string
  revenue: number
}

