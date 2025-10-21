import { apiClient } from './client'
import type {
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
  ApiKeyResponse,
  ApiKeysListResponse,
  ApiKeyDeleteResponse,
} from '@/types/apiKeys'

export const apiKeysApi = {
  // Create a new API key
  createApiKey: async (data: CreateApiKeyRequest): Promise<ApiKeyResponse> => {
    return await apiClient.post<ApiKeyResponse>('/api-keys', data)
  },

  // Get all API keys
  getApiKeys: async (): Promise<ApiKeysListResponse> => {
    return await apiClient.get<ApiKeysListResponse>('/api-keys')
  },

  // Get API key by ID
  getApiKeyById: async (id: string): Promise<ApiKeyResponse> => {
    return await apiClient.get<ApiKeyResponse>(`/api-keys/${id}`)
  },

  // Update API key
  updateApiKey: async (id: string, data: UpdateApiKeyRequest): Promise<ApiKeyResponse> => {
    return await apiClient.put<ApiKeyResponse>(`/api-keys/${id}`, data)
  },

  // Delete API key
  deleteApiKey: async (id: string): Promise<ApiKeyDeleteResponse> => {
    return await apiClient.delete<ApiKeyDeleteResponse>(`/api-keys/${id}`)
  },

  // Toggle API key status
  toggleApiKeyStatus: async (id: string): Promise<ApiKeyResponse> => {
    return await apiClient.patch<ApiKeyResponse>(`/api-keys/${id}/toggle`)
  },
}


