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
  subscription?: {
    id: string
    status: string
    startDate: string
    endDate: string
    daysRemaining: number | null
  }
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
  subscription?: {
    id: string
    status: string
    startDate: string
    endDate: string
  }
  createdAt: string
  updatedAt: string
}

export interface PaymentMethod {
  type: 'card' | 'promptpay'
  name: string
  description: string
  icon: string
  enabled: boolean
  currencies: string[]
  processing_time: string
}

