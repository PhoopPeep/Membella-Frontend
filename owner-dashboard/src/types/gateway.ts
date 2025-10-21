// Features API Gateway types

// API Key data for gateway
export interface GatewayApiKeyData {
  api_key_id?: string
  key_value?: string
  ownerId: string
  name: string
  description?: string
  permissions: string[]
  rate_limit?: number
  is_active?: boolean
  create_at?: string
  last_used_at?: string | null
  expires_at?: string
}

// Gateway API Key creation
export interface GatewayCreateApiKeyRequest {
  ownerId: string
  permissions: string[]
  rateLimit?: number
  expiresInDays?: number
}

export interface GatewayCreateApiKeyResponse {
  success: boolean
  data: {
    api_key: string
    owner_id: string
    permissions: string[]
    rate_limit: number
    created_at: string
    expires_at: string
  }
  timestamp: string
}

// Features list via gateway
export interface GatewayListFeaturesResponse {
  success: boolean
  data: {
    features: any[]
    count: number
    pagination: {
      limit: number
      has_more: boolean
      last_evaluated_key: string | null
    }
  }
  timestamp: string
}

// Usage statistics via gateway
export interface GatewayUsageStatsResponse {
  success: boolean
  data: {
    owner_id: string
    api_key_info: {
      created_at: string
      expires_at: string
      last_used_at: string | null
      is_active: boolean
      rate_limit: number
      usage_count: number
    }
    features: {
      total_count: number
      synced_count: number
      pending_sync: number
      failed_sync: number
    }
    usage: {
      total_requests: number
      requests_today: number
      requests_this_month: number
      rate_limit_hits: number
    }
    period: {
      start: string
      end: string
    }
    features_list?: any[]
  }
  timestamp: string
}

