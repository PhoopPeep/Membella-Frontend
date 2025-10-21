export interface Member {
  id: string
  email: string
  fullName?: string
  phone?: string
  planId?: string
  planName?: string
  status: 'active' | 'inactive' | 'cancelled'
  subscriptionStart: string
  subscriptionEnd: string | null
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
  subscriptions?: Array<{
    id: string
    planName: string
    status: string
    startDate: string
    endDate: string | null
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

export interface CreateMemberData {
  email: string
  planId: string
  status?: 'active' | 'inactive'
  subscriptionEnd?: string
}

export interface UpdateMemberData {
  email?: string
  planId?: string
  status?: 'active' | 'inactive' | 'cancelled'
  subscriptionEnd?: string
}

export interface MemberResponse {
  message: string
  member?: Member
}

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

export interface MembersByPlan {
  planId: string
  planName: string
  memberCount: number
}

