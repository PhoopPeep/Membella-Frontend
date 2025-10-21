<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">API Keys</h1>
            <p class="mt-2 text-gray-600">
              Your generated API keys for external integrations. Share these keys with developers to access your features.
            </p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="generateApiKeyViaGateway"
              :disabled="loading || isGenerating"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div v-if="isGenerating" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <KeyIcon v-else class="h-5 w-5 mr-2" />
              {{ isGenerating ? 'Generating...' : 'Generate API Key' }}
            </button>
          </div>
        </div>
      </div>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <KeyIcon class="h-6 w-6 text-indigo-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Keys</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ apiKeys.length }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CheckCircleIcon class="h-6 w-6 text-green-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Active Keys</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ activeApiKeys.length }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Expired Keys</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ expiredApiKeys.length }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Generated Keys Display -->
      <div v-if="generatedKeys.length > 0" class="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0">
            <CheckCircleIcon class="h-8 w-8 text-green-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-green-800">API Keys Generated Successfully!</h3>
            <p class="text-sm text-green-700">
              Your API keys have been generated. Please copy them now as you won't be able to see them again.
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <div
            v-for="key in generatedKeys"
            :key="key.api_key_id"
            class="bg-white border border-green-300 rounded-md p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <div>
                <h4 class="text-sm font-medium text-gray-900">{{ key.name }}</h4>
                <p class="text-xs text-gray-500">{{ key.description }}</p>
              </div>
              <button
                @click="copyApiKey(key.key_value)"
                class="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {{ copiedKey === key.key_value ? 'Copied!' : 'Copy' }}
              </button>
            </div>
            <div class="bg-gray-100 border border-gray-300 rounded p-3 font-mono text-sm break-all">
              {{ key.key_value }}
            </div>
            <div class="mt-2 flex flex-wrap gap-1">
              <span
                v-for="permission in key.permissions"
                :key="permission"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {{ getPermissionLabel(permission) }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 class="text-sm font-medium text-blue-800 mb-2">How to use your API keys:</h4>
          <div class="text-sm text-blue-700 space-y-2">
            <p>Include the API key in your requests using the <code class="bg-blue-100 px-1 rounded">X-API-Key</code> header:</p>
            <div class="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
              <div>curl -H "X-API-Key: your-api-key-here" \</div>
              <div class="ml-4">https://your-api-gateway-url/list-features</div>
            </div>
          </div>
        </div>
      </div>

      <!-- API Keys List -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg leading-6 font-medium text-gray-900">API Keys</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Manage and monitor your API keys
          </p>
        </div>

        <div v-if="loading" class="p-8 text-center">
          <div class="inline-flex items-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span class="ml-3 text-gray-600">Loading API keys...</span>
          </div>
        </div>

        <div v-else-if="apiKeys.length === 0" class="p-8 text-center">
          <KeyIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No API keys</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new API key.</p>
          <div class="mt-6">
            <button
              @click="showCreateModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon class="h-5 w-5 mr-2" />
              Create API Key
            </button>
          </div>
        </div>

        <ul v-else class="divide-y divide-gray-200">
          <li v-for="apiKey in apiKeys" :key="apiKey.api_key_id" class="px-4 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center">
                  <h4 class="text-sm font-medium text-gray-900 truncate">
                    {{ apiKey.name }}
                  </h4>
                  <span :class="getStatusColor(apiKey)" class="ml-2 text-xs font-medium">
                    {{ getStatusText(apiKey) }}
                  </span>
                </div>
                <div class="mt-1 flex items-center text-sm text-gray-500 space-x-2">
                  <span class="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {{ visibleKeys.has(apiKey.api_key_id) ? apiKey.key_value : maskApiKey(apiKey.key_value) }}
                  </span>
                  <button
                    @click="toggleKeyVisibility(apiKey.api_key_id)"
                    class="text-indigo-600 hover:text-indigo-900 text-xs"
                    :title="visibleKeys.has(apiKey.api_key_id) ? 'Hide key' : 'Show key'"
                  >
                    <svg v-if="!visibleKeys.has(apiKey.api_key_id)" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                </div>
                <div v-if="apiKey.description" class="mt-1 text-sm text-gray-600">
                  {{ apiKey.description }}
                </div>

                <div class="mt-2 text-xs text-gray-500">
                  Created: {{ formatDate(apiKey.create_at) }}
                  <span v-if="apiKey.last_used_at" class="ml-4">
                    Last used: {{ formatDate(apiKey.last_used_at) }}
                  </span>
                  <span v-if="apiKey.expires_at" class="ml-4">
                    Expires: {{ formatDate(apiKey.expires_at) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="copyApiKey(apiKey.key_value)"
                  class="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  title="Copy full API key to clipboard"
                >
                  <span v-if="copiedKey === apiKey.key_value" class="text-green-600">✓ Copied!</span>
                  <span v-else>Copy</span>
                </button>
                <button
                  @click="toggleApiKeyStatusLocal(apiKey.api_key_id)"
                  :class="apiKey.is_active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'"
                  class="text-sm font-medium"
                  title="Toggle status in local list only (doesn't affect AWS)"
                >
                  {{ apiKey.is_active ? '⚠️ Deactivate' : '✓ Activate' }}
                </button>
                <button
                  @click="confirmDeleteApiKey(apiKey.api_key_id)"
                  class="text-red-600 hover:text-red-900 text-sm font-medium"
                  title="Remove from local list only (doesn't delete from AWS)"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Delete Confirmation Modal -->
      <ConfirmationModal
        :show="showDeleteConfirm"
        type="warning"
        title="Remove API Key from List?"
        message="This will remove the key from your local list only. The key will still be active in AWS DynamoDB and can continue to be used."
        confirmText="Remove from List"
        cancelText="Cancel"
        @confirm="deleteApiKeyLocal"
        @cancel="cancelDelete"
      />

      <!-- Create/Edit Modal -->
      <ApiKeyModal
        v-if="showCreateModal || showEditModal"
        :is-open="showCreateModal || showEditModal"
        :api-key="editingApiKey"
        @close="closeModal"
        @save="handleSaveApiKey"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useApiKeys } from '../composables/useApiKeys';
import { useNotification } from '../composables/useNotification';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Vue SFC has implicit default export
import ApiKeyModal from '../components/ApiKeyModal.vue';
import ConfirmationModal from '../components/common/ConfirmationModal.vue';
import {
  PlusIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline';
import {
  createApiKeyViaGateway,
  healthCheck,
  listFeaturesViaGateway,
  getUsageStatsViaGateway,
} from '../api/apiKeysApi';
import type { ApiKey, GeneratedApiKey } from '../types/apiKeys';

const authStore = useAuthStore();
const { showNotification } = useNotification();

const {
  apiKeys,
  loading,
  activeApiKeys,
  expiredApiKeys,
  createApiKey,
  updateApiKey,
  getPermissionLabel,
  formatDate,
  getStatusColor,
  getStatusText
} = useApiKeys();

// Local interface for ApiKeyModal props
interface ApiKeyModalData {
  name: string
  permissions: string[]
  expires_at?: string
}

const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingApiKey = ref<ApiKeyModalData | undefined>(undefined);
const editingApiKeyId = ref<string | null>(null); // Store API key ID for editing
const generatedKeys = ref<GeneratedApiKey[]>([]);
const copiedKey = ref('');
const isGenerating = ref(false);
const isCheckingHealth = ref(false);
const gatewayHealthStatus = ref<'healthy' | 'unhealthy' | 'unknown'>('unknown');
const visibleKeys = ref<Set<string>>(new Set());

// Confirmation modal state
const showDeleteConfirm = ref(false);
const deleteTargetKey = ref<string | null>(null);

// Computed owner ID
const ownerId = computed(() => {
  // User object has owner_id field
  const user = authStore.user as { owner_id?: string } | null;
  const id = user?.owner_id;
  console.log('Owner ID computed:', id);
  console.log('Auth user:', authStore.user);
  return id || '';
});

// Load API keys from localStorage
const loadApiKeysFromStorage = () => {
  try {
    const stored = localStorage.getItem(`api_keys_${ownerId.value}`);
    if (stored) {
      apiKeys.value = JSON.parse(stored);
      console.log('Loaded API keys from localStorage:', apiKeys.value.length);
    }
  } catch (error) {
    console.error('Failed to load API keys from localStorage:', error);
  }
};

// Save API keys to localStorage
const saveApiKeysToStorage = () => {
  try {
    localStorage.setItem(`api_keys_${ownerId.value}`, JSON.stringify(apiKeys.value));
    console.log('Saved API keys to localStorage');
  } catch (error) {
    console.error('Failed to save API keys to localStorage:', error);
  }
};

onMounted(() => {
  console.log('ApiKeysView mounted');
  console.log('Current user:', authStore.user);
  console.log('Owner ID:', ownerId.value);

  // Load API keys from localStorage instead of backend
  loadApiKeysFromStorage();

  checkGatewayHealth(); // Check gateway health on mount
});

/**
 * Generate API Key via Features API Gateway
 */
const generateApiKeyViaGateway = async () => {
  console.log('Generate API Key clicked');
  console.log('Owner ID:', ownerId.value);
  console.log('Auth user:', authStore.user);

  if (!ownerId.value) {
    showNotification('error', 'Please login again to generate API keys.', 'Owner ID Not Found');
    return;
  }

  try {
    isGenerating.value = true;

    const request = {
      ownerId: ownerId.value,
      permissions: ['features:read', 'features:write'],
      rateLimit: 10000,
      expiresInDays: 365
    };

    console.log('Creating API key via gateway:', request);
    const response = await createApiKeyViaGateway(request);
    console.log('API key created successfully:', response);

    // Show the generated key in the list
    const newApiKey = {
      api_key_id: response.data.owner_id + '_' + Date.now(),
      name: 'Features API Gateway Key',
      description: 'Generated via Features API Gateway',
      key_value: response.data.api_key,
      permissions: response.data.permissions,
      rate_limit: response.data.rate_limit,
      create_at: response.data.created_at,
      expires_at: response.data.expires_at,
      is_active: true,
      last_used_at: null
    };

    // Add to the list
    apiKeys.value.unshift(newApiKey);

    // Save to localStorage
    saveApiKeysToStorage();

    // Auto-show the new key temporarily (will be hidden after 30 seconds)
    visibleKeys.value.add(newApiKey.api_key_id);
    setTimeout(() => {
      visibleKeys.value.delete(newApiKey.api_key_id);
    }, 30000); // Hide after 30 seconds

    // Show success notification
    showNotification(
      'success',
      'Key created and visible below for 30 seconds. Copy it now!',
      '🎉 API Key Generated!',
      8000
    );

    console.log('API key added to list:', newApiKey);
  } catch (error: unknown) {
    console.error('Error generating API key:', error);
    showNotification(
      'error',
      error instanceof Error ? error.message : 'Failed to generate API key',
      'Generation Failed'
    );
  } finally {
    isGenerating.value = false;
  }
};

/**
 * Check API Gateway health status
 */
const checkGatewayHealth = async () => {
  try {
    isCheckingHealth.value = true;
    const response = await healthCheck();

    if (response.status === 'healthy') {
      gatewayHealthStatus.value = 'healthy';
      console.log('API Gateway is healthy:', response);
    } else {
      gatewayHealthStatus.value = 'unhealthy';
    }
  } catch (error) {
    console.error('Gateway health check failed:', error);
    gatewayHealthStatus.value = 'unhealthy';
  } finally {
    isCheckingHealth.value = false;
  }
};

/**
 * Test API Key and show stats
 */
const testApiKey = async (apiKeyValue: string) => {
  try {
    console.log('Testing API key...');
    const testResults: string[] = [];
    let hasError = false;

    // Test 1: Health Check
    try {
      const healthResponse = await healthCheck();
      console.log('✓ Health check passed:', healthResponse);
      testResults.push('✅ API Gateway: Healthy');
    } catch (error) {
      console.error('✗ Health check failed:', error);
      testResults.push('❌ API Gateway: Unavailable');
      hasError = true;
    }

    // Test 2: List Features
    try {
      const featuresResponse = await listFeaturesViaGateway(apiKeyValue);
      console.log('✓ List features passed:', featuresResponse);
      testResults.push(`✅ List Features: ${featuresResponse.data.count} features found`);
    } catch (error: unknown) {
      console.error('✗ List features failed:', error);
      const err = error as {
        response?: { status?: number; data?: { error?: { message?: string } } }
        message?: string
      };
      const errorMsg = err.response?.data?.error?.message || err.message || 'Unknown error';
      testResults.push(`❌ List Features: ${errorMsg}`);
      hasError = true;

      // If unauthorized, explain the issue
      if (err.response?.status === 401) {
        testResults.push('   ℹ️  This API key may have expired or been deleted from AWS DynamoDB.');
      }
    }

    // Test 3: Get Usage Stats (optional - may fail if endpoint not configured)
    try {
      const statsResponse = await getUsageStatsViaGateway(apiKeyValue, true);
      console.log('✓ Usage stats passed:', statsResponse);
      testResults.push(`✅ Usage Stats: ${statsResponse.data.api_key_info.usage_count} requests`);
    } catch (error: unknown) {
      console.warn('✗ Usage stats failed (optional):', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      testResults.push(`⚠️ Usage Stats: ${errorMsg}`);
      // Don't mark as error since this endpoint might not be configured yet
    }

    // Show results - combine into summary
    const summary = testResults.map(r => {
      if (r.includes('✅')) return '✅';
      if (r.includes('❌')) return '❌';
      if (r.includes('⚠️')) return '⚠️';
      return '';
    }).join(' ');

    if (hasError) {
      showNotification(
        'warning',
        'Some tests failed. Check console for details.',
        `Test Results: ${summary}`,
        5000
      );
    } else {
      showNotification(
        'success',
        'All tests passed successfully!',
        `✅ Test Results: ${summary}`,
        4000
      );
    }
  } catch (error: unknown) {
    console.error('API key test failed:', error);
    showNotification(
      'error',
      error instanceof Error ? error.message : 'Unknown error',
      '❌ API Key Test Failed'
    );
  }
};


/**
 * Mask API key for security
 * Shows only first 12 and last 4 characters
 */
const maskApiKey = (key: string) => {
  if (!key) return '';
  if (key.length <= 16) return '•'.repeat(key.length);

  const prefix = key.substring(0, 12); // "mb_sk_live_"
  const suffix = key.substring(key.length - 4);
  const maskedMiddle = '•'.repeat(key.length - 16);

  return `${prefix}${maskedMiddle}${suffix}`;
};

/**
 * Toggle API key visibility
 */
const toggleKeyVisibility = (keyId: string) => {
  if (visibleKeys.value.has(keyId)) {
    visibleKeys.value.delete(keyId);
  } else {
    visibleKeys.value.add(keyId);
  }
};

const copyApiKey = async (keyValue: string) => {
  try {
    await navigator.clipboard.writeText(keyValue);
    copiedKey.value = keyValue;
    setTimeout(() => {
      copiedKey.value = '';
    }, 2000);
  } catch (err) {
    console.error('Failed to copy API key:', err);
  }
};

/**
 * Show delete confirmation modal
 */
const confirmDeleteApiKey = (keyId: string) => {
  deleteTargetKey.value = keyId;
  showDeleteConfirm.value = true;
};

/**
 * Delete API key from localStorage
 * Note: This only removes from UI. The key still exists in AWS DynamoDB.
 */
const deleteApiKeyLocal = () => {
  if (!deleteTargetKey.value) return;

  try {
    const keyId = deleteTargetKey.value;

    // Remove from list
    apiKeys.value = apiKeys.value.filter((key: ApiKey) => key.api_key_id !== keyId);

    // Save to localStorage
    saveApiKeysToStorage();

    console.log('API key removed from local storage:', keyId);

    showNotification(
      'success',
      'Removed from local list. Still active in AWS.',
      '✅ Key Removed',
      4000
    );

    // Close modal
    showDeleteConfirm.value = false;
    deleteTargetKey.value = null;
  } catch (error) {
    console.error('Failed to delete API key:', error);
    showNotification('error', 'Failed to remove API key from local storage', 'Deletion Failed');
  }
};

/**
 * Cancel delete confirmation
 */
const cancelDelete = () => {
  showDeleteConfirm.value = false;
  deleteTargetKey.value = null;
};

/**
 * Toggle API key status in localStorage
 * Note: This only updates UI. The key status in AWS DynamoDB remains unchanged.
 */
const toggleApiKeyStatusLocal = (keyId: string) => {
  try {
    const keyIndex = apiKeys.value.findIndex((key: ApiKey) => key.api_key_id === keyId);
    if (keyIndex === -1) {
      console.error('API key not found:', keyId);
      showNotification('error', 'API key not found', 'Toggle Failed');
      return;
    }

    const currentKey = apiKeys.value[keyIndex];
    const newStatus = !currentKey.is_active;

    // Update status
    apiKeys.value[keyIndex] = {
      ...currentKey,
      is_active: newStatus
    };

    // Save to localStorage
    saveApiKeysToStorage();

    console.log('API key status toggled:', keyId, 'new status:', newStatus);

    showNotification(
      newStatus ? 'success' : 'warning',
      `${newStatus ? 'Activated' : 'Deactivated'} locally. AWS key unchanged.`,
      `${newStatus ? '✓' : '⚠️'} Key ${newStatus ? 'Activated' : 'Deactivated'}`,
      3000
    );
  } catch (error) {
    console.error('Failed to toggle API key status:', error);
    showNotification('error', 'Failed to toggle API key status', 'Toggle Failed');
  }
};


const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingApiKey.value = undefined;
  editingApiKeyId.value = null;
};

// SaveData interface matching ApiKeyModal emit type
interface SaveData {
  name: string
  permissions: string[]
  expiresAt: string | null
}

const handleSaveApiKey = async (data: SaveData) => {
  try {
    if (editingApiKeyId.value) {
      // Editing existing API key
      await updateApiKey(editingApiKeyId.value, data);
      closeModal();
    } else {
      // Creating new API key
      const newApiKey = await createApiKey(data);
      // Show the generated key in the modal
      const modal = document.querySelector('[data-modal]') as HTMLElement & {
        setGeneratedKey?: (key: string) => void
      };
      if (modal && modal.setGeneratedKey) {
        modal.setGeneratedKey(newApiKey.key_value);
      }
      // Don't close modal immediately for new keys so user can copy the key
    }
  } catch (error) {
    console.error('Failed to save API key:', error);
    showNotification(
      'error',
      error instanceof Error ? error.message : 'Failed to save API key',
      'Save Failed'
    );
  }
};
</script>
