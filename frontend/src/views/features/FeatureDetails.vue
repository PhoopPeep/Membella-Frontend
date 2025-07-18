<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <button
          @click="goBack"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-9 px-3"
        >
          <ArrowLeft class="w-4 h-4 mr-1" />
          Back
        </button>
        <h1 class="text-3xl font-bold tracking-tight">Feature Details</h1>
      </div>
      <div v-if="feature" class="flex space-x-2">
        <button
          @click="navigateToEdit"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
        >
          <Edit class="w-4 h-4 mr-2" />
          Edit Feature
        </button>
        <button
          @click="confirmDeleteFeature"
          :disabled="isDeleting"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2"
        >
          <Trash2 class="w-4 h-4 mr-2" />
          Delete
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingFeature" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading feature...</p>
    </div>

    <!-- Feature Not Found -->
    <div
      v-else-if="!feature && !isLoadingFeature"
      class="bg-white rounded-lg border border-gray-200 shadow-sm"
    >
      <div class="text-center py-12">
        <div
          class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4"
        >
          <AlertCircle class="w-6 h-6 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Feature not found</h3>
        <p class="text-gray-500 mb-4">
          The feature you're looking for doesn't exist or has been deleted.
        </p>
        <button
          @click="goBack"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
        >
          Back to Features
        </button>
      </div>
    </div>

    <!-- Feature Details -->
    <div v-else-if="feature" class="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">{{ feature.name }}</h2>
          <span class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
            Feature
          </span>
        </div>
      </div>

      <div class="p-6 space-y-4">
        <div>
          <h4 class="font-medium text-gray-900 mb-2">Description</h4>
          <p class="text-gray-600">{{ feature.description }}</p>
        </div>

        <div class="flex items-center space-x-2">
          <Calendar class="w-4 h-4 text-gray-500" />
          <div>
            <p class="text-sm text-gray-500">Created</p>
            <p class="font-medium">
              {{ formatDate(feature.create_at) }}
            </p>
          </div>
        </div>

        <div v-if="feature.update_at !== feature.create_at" class="flex items-center space-x-2">
          <Clock class="w-4 h-4 text-gray-500" />
          <div>
            <p class="text-sm text-gray-500">Last Updated</p>
            <p class="font-medium">
              {{ formatDate(feature.update_at) }}
            </p>
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
      :item-name="feature?.name"
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
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Edit, Trash2, Calendar, Clock, AlertCircle } from 'lucide-vue-next'
import { featuresService } from '../../service/featuresService'
import ConfirmationModal from '../../components/common/ConfirmationModal.vue'

interface Feature {
  feature_id: string
  name: string
  description: string
  create_at: string
  update_at: string
}

const router = useRouter()
const route = useRoute()
const feature = ref<Feature | null>(null)
const isLoadingFeature = ref(false)
const isDeleting = ref(false)

// Modal state
const showDeleteModal = ref(false)

const featureId = route.params.id as string

const loadFeature = async () => {
  if (!featureId) {
    return
  }

  try {
    isLoadingFeature.value = true
    const data = await featuresService.getFeatureById(featureId)
    feature.value = data
  } catch (error) {
    console.error('Error loading feature:', error)
  } finally {
    isLoadingFeature.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const confirmDeleteFeature = () => {
  showDeleteModal.value = true
}

const handleDeleteFeature = async () => {
  if (!feature.value) return

  try {
    isDeleting.value = true
    await featuresService.deleteFeature(feature.value.feature_id)

    // Close modal and navigate back
    showDeleteModal.value = false
    router.push('/features')
  } catch (error) {
    console.error('Error deleting feature:', error)
    // You could show an error message here
  } finally {
    isDeleting.value = false
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
}

const goBack = () => {
  router.push('/features')
}

const navigateToEdit = () => {
  router.push(`/features/${featureId}/edit`)
}

onMounted(() => {
  loadFeature()
})
</script>
