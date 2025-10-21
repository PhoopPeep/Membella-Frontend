import { ref, computed } from 'vue';
import { apiKeysApi, type ApiKey, type CreateApiKeyRequest, type UpdateApiKeyRequest } from '../api/apiKeys';
import { autoKeyGenerationApi, type GeneratedApiKey } from '../api/autoKeyGeneration';
import { useNotification } from './useNotification';

export function useApiKeys() {
  const { showNotification } = useNotification();

  const apiKeys = ref<ApiKey[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed properties
  const activeApiKeys = computed(() =>
    apiKeys.value.filter(key => key.is_active)
  );

  const inactiveApiKeys = computed(() =>
    apiKeys.value.filter(key => !key.is_active)
  );

  const expiredApiKeys = computed(() =>
    apiKeys.value.filter(key =>
      key.expires_at && new Date(key.expires_at) < new Date()
    )
  );

  // Actions
  const fetchApiKeys = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiKeysApi.getApiKeys();
      apiKeys.value = response.data.api_keys || [];
    } catch (err: any) {
      // Silently fail for now - API keys are managed via Features API Gateway
      console.warn('Failed to fetch API keys from backend (this is expected):', err.message);
      apiKeys.value = [];
      error.value = null; // Don't show error to user
    } finally {
      loading.value = false;
    }
  };

  const createApiKey = async (data: CreateApiKeyRequest) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiKeysApi.createApiKey(data);
      apiKeys.value.unshift(response.data.api_key);
      showNotification('success', 'API key created successfully');
      return response.data.api_key;
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to create API key';
      showNotification('error', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateApiKey = async (id: string, data: UpdateApiKeyRequest) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiKeysApi.updateApiKey(id, data);
      const index = apiKeys.value.findIndex(key => key.api_key_id === id);
      if (index !== -1) {
        apiKeys.value[index] = response.data.api_key;
      }
      showNotification('success', 'API key updated successfully');
      return response.data.api_key;
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to update API key';
      showNotification('error', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;
      await apiKeysApi.deleteApiKey(id);
      apiKeys.value = apiKeys.value.filter(key => key.api_key_id !== id);
      showNotification('success', 'API key deleted successfully');
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to delete API key';
      showNotification('error', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const toggleApiKeyStatus = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiKeysApi.toggleApiKeyStatus(id);
      const index = apiKeys.value.findIndex(key => key.api_key_id === id);
      if (index !== -1) {
        apiKeys.value[index] = response.data.api_key;
      }
      const status = response.data.api_key.is_active ? 'activated' : 'deactivated';
      showNotification('success', `API key ${status} successfully`);
      return response.data.api_key;
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to toggle API key status';
      showNotification('error', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Utility functions
  const getPermissionLabel = (permission: string) => {
    const labels: Record<string, string> = {
      'features:read': 'Read Features',
      'features:write': 'Write Features',
      'features:delete': 'Delete Features',
      'plans:read': 'Read Plans',
      'plans:write': 'Write Plans',
      'members:read': 'Read Members'
    };
    return labels[permission] || permission;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getStatusColor = (apiKey: ApiKey) => {
    if (!apiKey.is_active) return 'text-gray-500';
    if (isExpired(apiKey.expires_at)) return 'text-red-500';
    return 'text-green-500';
  };

  const getStatusText = (apiKey: ApiKey) => {
    if (!apiKey.is_active) return 'Inactive';
    if (isExpired(apiKey.expires_at)) return 'Expired';
    return 'Active';
  };

  // Auto-generate functions
  const generateKeysForOwner = async (): Promise<GeneratedApiKey[]> => {
    try {
      loading.value = true;
      error.value = null;
      const response = await autoKeyGenerationApi.generateKeysForOwner();
      showNotification('success', 'API keys generated successfully');
      return response.data.keys;
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to generate API keys';
      showNotification('error', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const generateAdditionalKey = async (data: {
    name?: string;
    description?: string;
    permissions?: string[];
    expiresAt?: string;
  }): Promise<GeneratedApiKey> => {
    try {
      loading.value = true;
      error.value = null;
      const response = await autoKeyGenerationApi.generateAdditionalKey(data);
      showNotification('success', 'Additional API key generated successfully');
      return response.data.api_key;
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to generate additional API key';
      showNotification('error', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getKeyUsageStats = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await autoKeyGenerationApi.getKeyUsageStats();
      return response.data.stats;
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to get key usage statistics';
      showNotification('error', error.value);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    apiKeys,
    loading,
    error,

    // Computed
    activeApiKeys,
    inactiveApiKeys,
    expiredApiKeys,

    // Actions
    fetchApiKeys,
    createApiKey,
    updateApiKey,
    deleteApiKey,
    toggleApiKeyStatus,

    // Auto-generate functions
    generateKeysForOwner,
    generateAdditionalKey,
    getKeyUsageStats,

    // Utilities
    getPermissionLabel,
    formatDate,
    isExpired,
    getStatusColor,
    getStatusText
  };
}
