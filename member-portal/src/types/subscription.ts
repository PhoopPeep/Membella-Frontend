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

