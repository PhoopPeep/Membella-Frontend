import { apiClient } from './client'
import type {
  GenerateKeysResponse,
  GenerateAdditionalKeyRequest,
  GenerateAdditionalKeyResponse,
  StatsResponse,
} from '@/types/apiKeys'

export const autoKeyGenerationApi = {
  // Auto-generate API keys for owner
  generateKeysForOwner: async (): Promise<GenerateKeysResponse> => {
    return await apiClient.post<GenerateKeysResponse>('/auto-generate-keys')
  },

  // Generate additional API key
  generateAdditionalKey: async (
    data: GenerateAdditionalKeyRequest,
  ): Promise<GenerateAdditionalKeyResponse> => {
    return await apiClient.post<GenerateAdditionalKeyResponse>(
      '/auto-generate-keys/additional',
      data,
    )
  },

  // Get API key usage statistics
  getKeyUsageStats: async (): Promise<StatsResponse> => {
    return await apiClient.get<StatsResponse>('/auto-generate-keys/stats')
  },
}


