<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <h1 class="text-3xl font-bold tracking-tight">Feature Management</h1>
      </div>
      <button
        @click="navigateToCreate"
        :disabled="isLoading"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
      >
        <Plus class="w-4 h-4 mr-2" />
        Add Feature
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
    <LoadingSpinner
      v-if="isLoading && features.length === 0"
      text="Loading features..."
      subtitle="Please wait while we fetch your features"
      color="blue"
    />

    <!-- Features Table -->
    <div v-else-if="features.length > 0" class="rounded-lg border bg-white shadow-sm">
      <div class="p-6">
        <!-- Loading overlay for operations -->
        <div v-if="isLoading" class="relative">
          <div
            class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10"
          >
            <LoadingSpinner size="sm" text="Processing..." color="blue" />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 font-medium text-gray-900">Feature Name</th>
                <th class="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                <th class="text-left py-3 px-4 font-medium text-gray-900">Created Date</th>
                <th class="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="feature in features"
                :key="feature.feature_id"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                :class="{
                  'opacity-50 pointer-events-none': deletingIds.includes(feature.feature_id),
                }"
              >
                <td class="py-4 px-4">
                  <div class="flex items-center">
                    <Settings class="w-4 h-4 text-blue-600 mr-2" />
                    <span class="font-medium text-gray-900">{{ feature.name }}</span>
                  </div>
                </td>
                <td class="py-4 px-4">
                  <div class="max-w-md text-gray-600">
                    <span class="line-clamp-2">{{ feature.description }}</span>
                  </div>
                </td>
                <td class="py-4 px-4">
                  <span class="text-sm text-gray-500">{{ formatDate(feature.create_at) }}</span>
                </td>
                <td class="py-4 px-4">
                  <div class="flex space-x-2 justify-end">
                    <button
                      @click="navigateToDetails(feature.feature_id)"
                      :disabled="isLoading"
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-8 px-3"
                    >
                      <Eye class="w-3 h-3 mr-1" />
                      View
                    </button>
                    <button
                      @click="navigateToEdit(feature.feature_id)"
                      :disabled="isLoading"
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-8 px-3"
                    >
                      <Edit class="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      @click="confirmDeleteFeature(feature)"
                      :disabled="isLoading || deletingIds.includes(feature.feature_id)"
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-3"
                    >
                      <Trash2 v-if="!deletingIds.includes(feature.feature_id)" class="w-3 h-3" />
                      <LoadingSpinner v-else size="sm" color="red" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading" class="rounded-lg border bg-white shadow-sm">
      <div class="text-center py-12">
        <div
          class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4"
        >
          <Settings class="w-6 h-6 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No features yet</h3>
        <p class="text-gray-500 mb-4">Create your first feature to assign to plans.</p>
        <button
          @click="navigateToCreate"
          :disabled="isLoading"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
        >
          <Plus class="w-4 h-4 mr-2" />
          Add Feature
        </button>
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
import { Plus, Eye, Edit, Trash2, Settings } from 'lucide-vue-next'
import { featuresService, type Feature } from '../../service/featuresService'
import { useErrorHandler } from '../../composables/useErrorHandler'
import ConfirmationModal from '../../components/common/ConfirmationModal.vue'
import ErrorToast from '../../components/common/ErrorToast.vue'
import LoadingSpinner from '../../components/common/LoadingSpinner.vue'

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

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid Date'
  }
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
