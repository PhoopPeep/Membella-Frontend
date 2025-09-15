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
          <p class="text-primary-600 text-sm">Manage features that can be assigned to plans</p>
        </div>
        <button
          @click="navigateToCreate"
          :disabled="isLoading"
          class="inline-flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-xl font-semibold text-base hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-primary-800"
        >
          <FontAwesomeIcon icon="plus" class="w-5 h-5 mr-3" />
          Add New Feature
        </button>
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
                    <div
                      class="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-md"
                    >
                      <FontAwesomeIcon icon="cog" class="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 class="text-lg font-bold text-primary-700 mb-1">{{ feature.name }}</h3>
                      <div class="text-xs text-primary-500 font-medium">
                        ID: {{ feature.feature_id }}
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
        <div class="text-center">
          <h3 class="text-3xl font-black text-primary-700 mb-4">No Features Yet! ⚙️</h3>
          <p class="text-lg text-primary-600 mb-8 font-medium max-w-md mx-auto">
            Create your first feature to assign to subscription plans.
          </p>
          <button
            @click="navigateToCreate"
            class="inline-flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FontAwesomeIcon icon="plus" class="w-5 h-5 mr-3" />
            Create Your First Feature
          </button>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { featuresService, type Feature } from '../../service/featuresService'
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

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
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
