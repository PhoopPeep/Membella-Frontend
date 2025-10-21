import { apiClient } from '@/api/client'

export interface VerificationStatus {
  user_id: string
  verified: boolean
  email?: string
  confirmed_at?: string
  sent_at?: string
  last_updated?: string
  error?: string
  status?: string
}

export interface VerificationUpdate {
  type: 'verification_status' | 'verification_update'
  event?: 'email_confirmed' | 'confirmation_email_sent'
  data: VerificationStatus
}

class VerificationService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private readonly reconnectDelay = 1000
  private readonly subscribers: Map<string, (status: VerificationStatus) => void> = new Map()
  private currentUserId: string | null = null

  constructor() {
    // Auto-connect WebSocket when service is created
    this.connectWebSocket()
  }

  // API Methods
  async getVerificationStatus(userId: string): Promise<VerificationStatus> {
    try {
      console.log('🔍 Checking verification status for user:', userId)

      const response = await apiClient.get<{
        success: boolean
        data: VerificationStatus
      }>(`/api/webhook/verification-status/${userId}`)

      console.log('📊 Verification status result:', response.data)

      return response.data || {
        user_id: userId,
        verified: false,
        status: 'unknown',
      }
    } catch (error) {
      console.error('❌ Error checking verification status:', error)
      return {
        user_id: userId,
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async getRealTimeVerificationStatus(userId: string): Promise<VerificationStatus> {
    try {
      console.log('🔄 Checking real-time verification status for user:', userId)

      const response = await apiClient.get<{
        success: boolean
        data: VerificationStatus
        timestamp: string
      }>(`/api/webhook/verification-status/${userId}/realtime`)

      console.log('📊 Real-time verification status result:', response.data)

      return response.data || {
        user_id: userId,
        verified: false,
        status: 'unknown',
      }
    } catch (error) {
      console.error('❌ Error checking real-time verification status:', error)
      return {
        user_id: userId,
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // WebSocket Methods
  connectWebSocket(): void {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

    try {
      console.log('🔌 Connecting to WebSocket:', wsUrl)

      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected successfully')
        this.reconnectAttempts = 0

        // Subscribe to verification updates for current user
        if (this.currentUserId) {
          this.subscribeToUser(this.currentUserId)
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const message: VerificationUpdate = JSON.parse(event.data)
          console.log('📨 WebSocket message received:', message)

          if (message.type === 'verification_status' || message.type === 'verification_update') {
            this.handleVerificationUpdate(message.data)
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error)
        }
      }

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason)
        this.ws = null

        // Auto-reconnect if not closed intentionally
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect()
        }
      }

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
      }
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error)
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) // Exponential backoff

    console.log(
      `🔄 Scheduling WebSocket reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`,
    )

    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connectWebSocket()
      } else {
        console.error('❌ Max reconnect attempts reached. WebSocket will not reconnect automatically.')
      }
    }, delay)
  }

  subscribeToVerificationUpdates(
    userId: string,
    callback: (status: VerificationStatus) => void,
  ): () => void {
    console.log('👤 Subscribing to verification updates for user:', userId)

    this.currentUserId = userId
    this.subscribers.set(userId, callback)

    // Subscribe via WebSocket if connected
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.subscribeToUser(userId)
    }

    // Return unsubscribe function
    return () => {
      console.log('🚫 Unsubscribing from verification updates for user:', userId)
      this.subscribers.delete(userId)

      if (this.currentUserId === userId) {
        this.currentUserId = null
      }
    }
  }

  private subscribeToUser(userId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'subscribe_verification',
          user_id: userId,
        }),
      )
      console.log('📡 Sent WebSocket subscription for user:', userId)
    }
  }

  private handleVerificationUpdate(status: VerificationStatus): void {
    console.log('📊 Handling verification update:', status)

    const callback = this.subscribers.get(status.user_id)
    if (callback) {
      callback(status)
    }
  }

  // Polling fallback method
  async startPolling(
    userId: string,
    callback: (status: VerificationStatus) => void,
    intervalMs: number = 5000,
  ): Promise<() => void> {
    console.log('🔄 Starting verification status polling for user:', userId, 'interval:', intervalMs + 'ms')

    const poll = async () => {
      try {
        const status = await this.getVerificationStatus(userId)
        callback(status)

        // Stop polling if verified
        if (status.verified) {
          console.log('✅ User verified, stopping polling')
          clearInterval(intervalId)
        }
      } catch (error) {
        console.error('❌ Polling error:', error)
      }
    }

    // Initial poll
    await poll()

    // Set up interval
    const intervalId = setInterval(poll, intervalMs)

    // Return stop function
    return () => {
      console.log('🛑 Stopping verification status polling for user:', userId)
      clearInterval(intervalId)
    }
  }

  // Cleanup method
  disconnect(): void {
    console.log('🧹 Disconnecting verification service')

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect')
      this.ws = null
    }

    this.subscribers.clear()
    this.currentUserId = null
    this.reconnectAttempts = 0
  }

  // Helper method to get WebSocket connection status
  getConnectionStatus(): 'connecting' | 'open' | 'closing' | 'closed' {
    if (!this.ws) return 'closed'

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'open'
      case WebSocket.CLOSING:
        return 'closing'
      case WebSocket.CLOSED:
        return 'closed'
      default:
        return 'closed'
    }
  }

  // Helper method to check if verification is in progress
  isVerificationInProgress(status: VerificationStatus): boolean {
    return !status.verified && (!!status.sent_at || !!status.email)
  }

  // Helper method to format verification status message
  getStatusMessage(status: VerificationStatus): string {
    if (status.error) {
      return `Verification failed: ${status.error}`
    }

    if (status.verified) {
      return `Email verified successfully ${status.confirmed_at ? 'on ' + new Date(status.confirmed_at).toLocaleString() : ''}`
    }

    if (status.sent_at) {
      return `Verification email sent ${new Date(status.sent_at).toLocaleString()}. Please check your email.`
    }

    return 'Email verification pending'
  }
}

// Export singleton instance
export const verificationService = new VerificationService()
