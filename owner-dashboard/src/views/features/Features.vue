<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/20">
    <!-- Hero Header Section -->
    <div
      class="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 px-6 py-12 md:px-8"
    >
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-secondary-400/20 rounded-full -translate-y-48 translate-x-48"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-64 h-64 bg-primary-300/20 rounded-full translate-y-32 -translate-x-32"
      ></div>

      <div class="relative max-w-7xl mx-auto">
        <div class="text-center">
          <h1 class="text-3xl md:text-4xl font-black text-white mb-4 drop-shadow-lg">
            Feature Management ⚙️
          </h1>
          <p class="text-lg text-white/90 font-medium max-w-2xl mx-auto">
            Create and manage features for your subscription plans
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 md:px-8 -mt-4 relative z-10">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 mt-8">
        <div class="mb-4 sm:mb-0">
          <h2 class="text-xl font-bold text-primary-700 mb-2">Your Features</h2>
          <p class="text-primary-600 text-sm">Features synced from your application via API Gateway</p>
        </div>
        <div class="flex space-x-3">
          <router-link
            to="/api-keys"
            class="inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-xl font-semibold text-base hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-green-800"
            title="Manage API Keys"
          >
            <FontAwesomeIcon icon="key" class="w-5 h-5 mr-2" />
            Manage API Keys
          </router-link>
          <button
            @click="showApiGatewayInfo = !showApiGatewayInfo"
            class="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-base hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-blue-800"
            title="View Integration Guide"
          >
            <FontAwesomeIcon icon="info-circle" class="w-5 h-5 mr-2" />
            How to Sync
          </button>
        </div>
      </div>

      <!-- API Gateway Info Banner -->
      <div
        v-if="showApiGatewayInfo"
        class="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6 shadow-md"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center mb-3">
              <FontAwesomeIcon icon="info-circle" class="w-6 h-6 text-blue-600 mr-3" />
              <h3 class="text-lg font-bold text-blue-900">Features API Gateway Integration</h3>
            </div>
            <div class="space-y-2 text-sm text-blue-800">
              <p><strong>✨ API-First Features:</strong> All features are synced from your application via API Gateway</p>
              <p><strong>📡 Quick Start Guide:</strong></p>
              <ol class="list-decimal ml-6 space-y-1">
                <li>Click <strong>"Manage API Keys"</strong> button above to generate an API key</li>
                <li>Copy your API key from the dashboard</li>
                <li>Use our API to sync features from your application (POST /features/sync)</li>
                <li>Features will appear here automatically within seconds</li>
                <li>Assign synced features to your subscription plans</li>
              </ol>
              <div class="mt-4 bg-blue-100 rounded-lg p-4">
                <p class="font-semibold mb-2">📚 Integration Resources:</p>
                <ul class="list-disc ml-6 space-y-1">
                  <li><code class="bg-white px-2 py-1 rounded text-xs">features-api-gateway/OWNER_GUIDE.md</code> - Complete integration guide</li>
                  <li><code class="bg-white px-2 py-1 rounded text-xs">features-api-gateway/QUICK_START.md</code> - Quick start examples</li>
                  <li>API Endpoint: <code class="bg-white px-2 py-1 rounded text-xs">https://kvts7dvmtb.execute-api.ap-southeast-1.amazonaws.com/dev</code></li>
                </ul>
              </div>
            </div>
          </div>
          <button
            @click="showApiGatewayInfo = false"
            class="ml-4 text-blue-600 hover:text-blue-800"
          >
            <FontAwesomeIcon icon="times" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Error Toast -->
      <ErrorToast
        :show="hasErrors"
        :type="
          latestError?.type === 'network'
            ? 'error'
            : latestError?.type === 'validation'
              ? 'warning'
              : 'error'
        "
        :title="getErrorTitle(latestError?.type)"
        :message="latestError?.message"
        :duration="latestError?.type === 'validation' ? 10 : 15"
        @dismiss="clearAllErrors"
      />

      <!-- Success Toast -->
      <ErrorToast
        :show="showSuccessToast"
        type="success"
        :title="successMessage.title"
        :message="successMessage.text"
        :duration="5"
        @dismiss="showSuccessToast = false"
      />

      <!-- Loading State -->
      <div
        v-if="isLoading && features.length === 0"
        class="flex flex-col items-center justify-center py-16"
      >
        <div class="relative">
          <div class="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin"></div>
          <div
            class="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"
          ></div>
        </div>
        <h3 class="text-xl font-bold text-primary-700 mt-4">Loading Features</h3>
        <p class="text-primary-600">Please wait while we fetch your features...</p>
      </div>

      <!-- Features Table -->
      <div
        v-else-if="features.length > 0"
        class="bg-white rounded-2xl border border-primary-200 shadow-soft overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-primary-50 to-secondary-50">
              <tr>
                <th class="text-left py-4 px-6 font-semibold text-primary-700">
                  <div class="flex items-center">
                    <FontAwesomeIcon icon="cog" class="w-4 h-4 mr-2 text-secondary-500" />
                    Feature Details
                  </div>
                </th>
                <th class="text-left py-4 px-6 font-semibold text-primary-700">
                  <div class="flex items-center">
                    <FontAwesomeIcon icon="align-left" class="w-4 h-4 mr-2 text-secondary-500" />
                    Description
                  </div>
                </th>
                <th class="text-left py-4 px-6 font-semibold text-primary-700">
                  <div class="flex items-center">
                    <FontAwesomeIcon icon="clock" class="w-4 h-4 mr-2 text-secondary-500" />
                    Created
                  </div>
                </th>
                <th class="text-right py-4 px-6 font-semibold text-primary-700">
                  <div class="flex items-center justify-end">
                    <FontAwesomeIcon icon="cog" class="w-4 h-4 mr-2 text-secondary-500" />
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-100">
              <tr
                v-for="feature in features"
                :key="feature.feature_id"
                class="hover:bg-primary-50/50 transition-colors duration-200"
                :class="{ 'opacity-50': deletingIds.includes(feature.feature_id) }"
              >
                <!-- Feature Details -->
                <td class="py-6 px-6">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-r from-green-500 to-emerald-500">
                      <FontAwesomeIcon icon="cloud" class="w-6 h-6 text-white" />
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-1">
                        <h3 class="text-lg font-bold text-primary-700">{{ feature.name }}</h3>
                        <!-- Sync Status Badge -->
                        <span
                          :class="[
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
                            feature.metadata?.syncStatus === 'synced'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : feature.metadata?.syncStatus === 'pending_sync'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          ]"
                          :title="getSyncStatusTitle(feature.metadata?.syncStatus)"
                        >
                          <FontAwesomeIcon
                            :icon="getSyncStatusIcon(feature.metadata?.syncStatus)"
                            class="w-3 h-3 mr-1"
                          />
                          {{ getSyncStatusText(feature.metadata?.syncStatus) }}
                        </span>
                      </div>
                      <div class="text-xs text-primary-500 font-medium">
                        ID: {{ feature.feature_id }}
                        <span v-if="feature.externalId" class="ml-2 text-green-600">
                          • External: {{ feature.externalId }}
                        </span>
                        <span v-if="feature.metadata?.syncedAt" class="ml-2 text-gray-500">
                          • Last synced: {{ formatRelativeTime(feature.metadata.syncedAt) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Description -->
                <td class="py-6 px-6">
                  <div class="max-w-md">
                    <p class="text-primary-600 line-clamp-2">{{ feature.description }}</p>
                  </div>
                </td>

                <!-- Created Date -->
                <td class="py-6 px-6">
                  <div class="text-sm text-primary-600">
                    {{ formatDate(feature.create_at) }}
                  </div>
                </td>

                <!-- Actions -->
                <td class="py-6 px-6">
                  <div class="flex space-x-2 justify-end">
                    <button
                      @click="navigateToDetails(feature.feature_id)"
                      class="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-100 rounded-lg transition-all duration-200"
                      title="View Details"
                      :disabled="isLoading || deletingIds.includes(feature.feature_id)"
                    >
                      <FontAwesomeIcon icon="eye" class="w-4 h-4" />
                    </button>
                    <button
                      @click="confirmDeleteFeature(feature)"
                      class="p-2 text-error-600 hover:text-error-700 hover:bg-error-100 rounded-lg transition-all duration-200"
                      title="Delete Feature"
                      :disabled="isLoading || deletingIds.includes(feature.feature_id)"
                    >
                      <FontAwesomeIcon
                        :icon="deletingIds.includes(feature.feature_id) ? 'spinner' : 'trash'"
                        class="w-4 h-4"
                        :class="{ 'animate-spin': deletingIds.includes(feature.feature_id) }"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!isLoading"
        class="bg-white rounded-2xl border border-primary-200 shadow-soft p-12"
      >
        <div class="text-center max-w-3xl mx-auto">
          <!-- Icon -->
          <div class="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FontAwesomeIcon icon="cloud" class="w-12 h-12 text-white" />
          </div>

          <h3 class="text-3xl font-black text-primary-700 mb-4">No Features Synced Yet! ☁️</h3>
          <p class="text-lg text-primary-600 mb-8 font-medium">
            Sync features from your application using our API Gateway
          </p>

          <!-- Quick Start Steps -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 text-left">
            <h4 class="text-xl font-bold text-blue-900 mb-4 flex items-center">
              <FontAwesomeIcon icon="rocket" class="w-6 h-6 mr-2" />
              Quick Start Guide
            </h4>
            <ol class="space-y-4 text-blue-800">
              <li class="flex items-start">
                <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">1</span>
                <div>
                  <p class="font-semibold">Generate API Key</p>
                  <p class="text-sm">Click "Manage API Keys" button to create your authentication key</p>
                </div>
              </li>
              <li class="flex items-start">
                <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">2</span>
                <div>
                  <p class="font-semibold">Sync Your Features</p>
                  <p class="text-sm">Use POST /features/sync endpoint with your application's features</p>
                </div>
              </li>
              <li class="flex items-start">
                <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">3</span>
                <div>
                  <p class="font-semibold">Features Appear Automatically</p>
                  <p class="text-sm">Synced features will show up here within seconds</p>
                </div>
              </li>
              <li class="flex items-start">
                <span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">4</span>
                <div>
                  <p class="font-semibold">Assign to Plans</p>
                  <p class="text-sm">Add features to your subscription plans for members</p>
                </div>
              </li>
            </ol>
          </div>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/api-keys"
              class="inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FontAwesomeIcon icon="key" class="w-5 h-5 mr-3" />
              Get Started - Manage API Keys
            </router-link>
            <button
              @click="showApiGatewayInfo = true"
              class="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg border-2 border-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FontAwesomeIcon icon="book" class="w-5 h-5 mr-3" />
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteModal"
      type="danger"
      title="Delete Feature"
      message="Are you sure you want to delete this feature? This action cannot be undone and will remove the feature from all plans that currently include it."
      :item-name="featureToDelete?.name"
      confirm-text="Delete Feature"
      cancel-text="Cancel"
      loading-text="Deleting..."
      :loading="isDeleting"
      @confirm="handleDeleteFeature"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { featuresService } from '../../service/featuresService'
import type { Feature } from '../../types/features'
import { useErrorHandler } from '../../composables/useErrorHandler'

// Import reusable components
import ConfirmationModal from '../../components/common/ConfirmationModal.vue'
import ErrorToast from '../../components/common/ErrorToast.vue'

const router = useRouter()

// Error handling
const { hasErrors, latestError, clearAllErrors, withErrorHandling, isLoading } = useErrorHandler()

// Data
const features = ref<Feature[]>([])
const deletingIds = ref<string[]>([])
const isDeleting = ref(false)

// Modal state
const showDeleteModal = ref(false)
const featureToDelete = ref<Feature | null>(null)

// Success state
const showSuccessToast = ref(false)
const successMessage = ref({ title: '', text: '' })

// API Gateway Info state
const showApiGatewayInfo = ref(false)

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / 60000)
  const diffInHours = Math.floor(diffInMs / 3600000)
  const diffInDays = Math.floor(diffInMs / 86400000)

  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`
  return formatDate(dateString)
}

const getSyncStatusText = (status?: string) => {
  switch (status) {
    case 'synced':
      return 'Synced'
    case 'pending_sync':
      return 'Pending'
    case 'sync_failed':
      return 'Failed'
    default:
      return 'Active'
  }
}

const getSyncStatusIcon = (status?: string) => {
  switch (status) {
    case 'synced':
      return 'check-circle'
    case 'pending_sync':
      return 'clock'
    case 'sync_failed':
      return 'exclamation-circle'
    default:
      return 'cloud'
  }
}

const getSyncStatusTitle = (status?: string) => {
  switch (status) {
    case 'synced':
      return 'Successfully synced to Membella'
    case 'pending_sync':
      return 'Waiting to be synced'
    case 'sync_failed':
      return 'Sync failed - will retry'
    default:
      return 'Synced from API Gateway'
  }
}

// Computed
const getErrorTitle = (type?: string) => {
  switch (type) {
    case 'network':
      return 'Connection Error'
    case 'validation':
      return 'Validation Error'
    case 'auth':
      return 'Authentication Error'
    case 'server':
      return 'Server Error'
    default:
      return 'Error'
  }
}

// Methods

const loadFeatures = async () => {
  const result = await withErrorHandling(() => featuresService.getFeatures(), 'Loading features', {
    showLoading: true,
    clearPreviousErrors: true,
  })

  if (result) {
    features.value = result
  }
}

const confirmDeleteFeature = (feature: Feature) => {
  featureToDelete.value = feature
  showDeleteModal.value = true
}

const handleDeleteFeature = async () => {
  if (!featureToDelete.value) return

  const featureId = featureToDelete.value.feature_id
  const featureName = featureToDelete.value.name

  // Add to deleting list
  deletingIds.value.push(featureId)
  isDeleting.value = true

  const result = await withErrorHandling(
    () => featuresService.deleteFeature(featureId),
    'Deleting feature',
    { showLoading: false, clearPreviousErrors: false },
  )

  if (result) {
    // Remove from local state
    features.value = features.value.filter((f) => f.feature_id !== featureId)

    // Show success message
    showSuccess('Feature Deleted', `"${featureName}" has been successfully deleted.`)

    // Close modal
    showDeleteModal.value = false
    featureToDelete.value = null
  }

  // Remove from deleting list
  deletingIds.value = deletingIds.value.filter((id) => id !== featureId)
  isDeleting.value = false
}

const cancelDelete = () => {
  showDeleteModal.value = false
  featureToDelete.value = null
}

const showSuccess = (title: string, text: string) => {
  successMessage.value = { title, text }
  showSuccessToast.value = true
}

const navigateToCreate = () => {
  router.push('/features/create')
}

const navigateToDetails = (id: string) => {
  router.push(`/features/${id}`)
}

const navigateToEdit = (id: string) => {
  router.push(`/features/${id}/edit`)
}

// Lifecycle
onMounted(() => {
  loadFeatures()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
