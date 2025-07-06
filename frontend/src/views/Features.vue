<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <h1 class="text-3xl font-bold tracking-tight">Feature Management</h1>
      </div>
      <button
        @click="navigateToCreate"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
      >
        <Plus class="w-4 h-4 mr-2" />
        Add Feature
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-red-600">{{ error }}</p>
      <button @click="loadFeatures" class="mt-2 text-sm text-red-700 hover:text-red-900 underline">
        Try again
      </button>
    </div>

    <!-- Features Table -->
    <div v-else-if="features.length > 0" class="rounded-lg border bg-white shadow-sm">
      <div class="p-6">
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
                class="border-b border-gray-100 hover:bg-gray-50"
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
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-8 px-3"
                    >
                      <Eye class="w-3 h-3 mr-1" />
                      View
                    </button>
                    <button
                      @click="navigateToEdit(feature.feature_id)"
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-8 px-3"
                    >
                      <Edit class="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      @click="confirmDeleteFeature(feature)"
                      :disabled="deleting === feature.feature_id"
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-3"
                    >
                      <Trash2 class="w-3 h-3" />
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
    <div v-else class="rounded-lg border bg-white shadow-sm">
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
      :loading="deleting !== null"
      @confirm="handleDeleteFeature"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Eye, Edit, Trash2, Settings } from 'lucide-vue-next'
import { featuresService, type Feature } from '../service/featuresService'
import ConfirmationModal from '../components/ConfirmationModal.vue'

const router = useRouter()

const features = ref<Feature[]>([])
const loading = ref(false)
const error = ref('')
const deleting = ref<string | null>(null)

// Modal state
const showDeleteModal = ref(false)
const featureToDelete = ref<Feature | null>(null)

const loadFeatures = async () => {
  try {
    loading.value = true
    error.value = ''
    features.value = await featuresService.getFeatures()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load features'
  } finally {
    loading.value = false
  }
}

const confirmDeleteFeature = (feature: Feature) => {
  featureToDelete.value = feature
  showDeleteModal.value = true
}

const handleDeleteFeature = async () => {
  if (!featureToDelete.value) return

  try {
    deleting.value = featureToDelete.value.feature_id
    await featuresService.deleteFeature(featureToDelete.value.feature_id)

    // Remove from local state
    features.value = features.value.filter(
      (f) => f.feature_id !== featureToDelete.value!.feature_id,
    )

    // Close modal and reset state
    showDeleteModal.value = false
    featureToDelete.value = null

    console.log('Feature deleted successfully')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete feature'
  } finally {
    deleting.value = null
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  featureToDelete.value = null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
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

onMounted(() => {
  loadFeatures()
})
</script>
