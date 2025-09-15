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
  fullName: string
  phone?: string
  createdAt: string
  subscriptions: Array<{
    id: string
    planName: string
    status: string
    startDate: string
    endDate?: string
    price: number
  }>
  paymentHistory?: Array<{
    id: string
    amount: number
    status: string
    planName: string
    createdAt: string
  }>
  totalSpent?: number
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
  totalSubscriptions: number
  revenueThisMonth: number
  revenueLastMonth: number
  newPlansThisMonth: number
}
