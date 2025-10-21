// API Key entity
export interface ApiKey {
  api_key_id: string
  name: string
  key_value: string
  permissions: string[]
  is_active: boolean
  last_used_at?: string
  expires_at?: string
  create_at: string
  update_at: string
}

// Generated API Key (for auto-generation)
export interface GeneratedApiKey {
  api_key_id: string
  name: string
  description: string
  key_value: string
  permissions: string[]
  expires_at?: string
  create_at: string
}

// Request types
export interface CreateApiKeyRequest {
  name: string
  permissions?: string[]
  expiresAt?: string
}

export interface UpdateApiKeyRequest {
  name?: string
  permissions?: string[]
  is_active?: boolean
  expiresAt?: string
}

export interface GenerateAdditionalKeyRequest {
  name?: string
  description?: string
  permissions?: string[]
  expiresAt?: string
}

// Response types
export interface ApiKeyResponse {
  success: boolean
  data: {
    api_key: ApiKey
  }
  message: string
  timestamp: string
}

export interface ApiKeysListResponse {
  success: boolean
  data: {
    api_keys: ApiKey[]
    count: number
  }
  message: string
  timestamp: string
}

export interface GenerateKeysResponse {
  success: boolean
  data: {
    keys: GeneratedApiKey[]
  }
  message: string
  timestamp: string
}

export interface GenerateAdditionalKeyResponse {
  success: boolean
  data: {
    api_key: GeneratedApiKey
  }
  message: string
  timestamp: string
}

export interface ApiKeyDeleteResponse {
  success: boolean
  message: string
  timestamp: string
}

// Statistics types
export interface KeyUsageStats {
  total_keys: number
  active_keys: number
  expired_keys: number
  recently_used: number
  keys: Array<{
    api_key_id: string
    name: string
    is_active: boolean
    last_used_at?: string
    expires_at?: string
    create_at: string
  }>
}

export interface StatsResponse {
  success: boolean
  data: {
    stats: KeyUsageStats
  }
  message: string
  timestamp: string
}

