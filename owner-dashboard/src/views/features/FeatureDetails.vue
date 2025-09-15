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
            Feature Details ⚙️
          </h1>
          <p class="text-lg text-white/90 font-medium max-w-2xl mx-auto">
            View and manage your feature information
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-6 md:px-8 -mt-4 relative z-10">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-8 mt-8">
        <div class="flex items-center space-x-4">
          <button
            @click="goBack"
            class="p-3 text-primary-600 hover:text-primary-700 hover:bg-primary-100 rounded-xl transition-all duration-200"
            title="Back to Features"
          >
            <FontAwesomeIcon icon="arrow-left" class="w-5 h-5" />
          </button>
          <div>
            <h2 class="text-2xl font-bold text-primary-700 mb-2">Feature Information</h2>
            <p class="text-primary-600">View and manage your feature details</p>
          </div>
        </div>
        <div v-if="feature" class="flex space-x-3">
          <button
            @click="navigateToEdit"
            class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-xl font-bold hover:from-secondary-600 hover:to-secondary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FontAwesomeIcon icon="edit" class="w-4 h-4 mr-2" />
            Edit Feature
          </button>
          <button
            @click="confirmDeleteFeature"
            :disabled="isDeleting"
            class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-error-500 to-error-600 text-white rounded-xl font-bold hover:from-error-600 hover:to-error-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <FontAwesomeIcon icon="trash" class="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingFeature" class="flex flex-col items-center justify-center py-16">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin"></div>
          <div
            class="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"
          ></div>
        </div>
        <h3 class="text-xl font-bold text-primary-700 mt-4">Loading Feature</h3>
        <p class="text-primary-600">Please wait while we fetch your feature...</p>
      </div>

      <!-- Feature Not Found -->
      <div
        v-else-if="!feature && !isLoadingFeature"
        class="bg-white rounded-2xl border border-primary-200 shadow-soft p-12"
      >
        <div class="text-center">
          <div
            class="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FontAwesomeIcon icon="exclamation-triangle" class="w-8 h-8 text-error-500" />
          </div>
          <h3 class="text-xl font-bold text-error-700 mb-2">Feature Not Found</h3>
          <p class="text-error-600 mb-6">
            The feature you're looking for doesn't exist or has been deleted.
          </p>
          <button
            @click="goBack"
            class="inline-flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-bold hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FontAwesomeIcon icon="arrow-left" class="w-4 h-4 mr-2" />
            Back to Features
          </button>
        </div>
      </div>

      <!-- Feature Details -->
      <div
        v-else-if="feature"
        class="bg-white rounded-2xl border border-primary-200 shadow-soft overflow-hidden"
      >
        <div
          class="p-8 border-b border-primary-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div
                class="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <FontAwesomeIcon icon="cog" class="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 class="text-2xl font-bold text-primary-700">{{ feature.name }}</h2>
                <p class="text-primary-600">Feature Information</p>
              </div>
            </div>
            <span
              class="bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-bold px-4 py-2 rounded-full"
            >
              Feature
            </span>
          </div>
        </div>

        <div class="p-8 space-y-8">
          <div>
            <h4 class="text-lg font-bold text-primary-700 mb-4 flex items-center">
              <FontAwesomeIcon icon="align-left" class="w-5 h-5 mr-2 text-secondary-500" />
              Description
            </h4>
            <div class="bg-primary-50 rounded-xl p-6">
              <p class="text-primary-600 leading-relaxed text-lg">{{ feature.description }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-primary-50 rounded-xl p-6">
              <div class="flex items-center space-x-3 mb-3">
                <FontAwesomeIcon icon="calendar" class="w-5 h-5 text-primary-600" />
                <h5 class="font-bold text-primary-700">Created Date</h5>
              </div>
              <p class="text-primary-600 text-lg font-medium">
                {{ formatDate(feature.create_at) }}
              </p>
            </div>

            <div
              v-if="feature.update_at !== feature.create_at"
              class="bg-secondary-50 rounded-xl p-6"
            >
              <div class="flex items-center space-x-3 mb-3">
                <FontAwesomeIcon icon="clock" class="w-5 h-5 text-secondary-600" />
                <h5 class="font-bold text-secondary-700">Last Updated</h5>
              </div>
              <p class="text-secondary-600 text-lg font-medium">
                {{ formatDate(feature.update_at) }}
              </p>
            </div>
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
