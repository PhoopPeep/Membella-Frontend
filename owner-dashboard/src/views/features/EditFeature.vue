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
            Edit Feature ⚙️
          </h1>
          <p class="text-lg text-white/90 font-medium max-w-2xl mx-auto">
            Update your feature information
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
            <h2 class="text-2xl font-bold text-primary-700">Feature Details</h2>
            <p class="text-primary-600">Update your feature information</p>
          </div>
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

      <!-- Edit Form -->
      <div
        v-else-if="feature"
        class="bg-white rounded-2xl border border-primary-200 shadow-soft overflow-hidden"
      >
        <div
          class="p-8 border-b border-primary-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50"
        >
          <h3 class="text-xl font-bold text-primary-700 flex items-center">
            <FontAwesomeIcon icon="cog" class="w-6 h-6 mr-3 text-secondary-500" />
            Feature Information
          </h3>
          <p class="text-primary-600 mt-2">Update your feature details</p>
        </div>

        <div class="p-8">
          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl">
            <div class="flex items-center">
              <FontAwesomeIcon icon="exclamation-triangle" class="w-5 h-5 text-error-500 mr-3" />
              <p class="text-sm text-error-600 font-medium">{{ errorMessage }}</p>
            </div>
          </div>

          <!-- Success Message -->
          <div
            v-if="successMessage"
            class="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl"
          >
            <div class="flex items-center">
              <FontAwesomeIcon icon="check-circle" class="w-5 h-5 text-success-500 mr-3" />
              <p class="text-sm text-success-600 font-medium">{{ successMessage }}</p>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-8">
            <!-- Feature Name -->
            <div class="space-y-3">
              <label for="name" class="text-sm font-semibold text-primary-700 flex items-center">
                <FontAwesomeIcon icon="tag" class="w-4 h-4 mr-2 text-secondary-500" />
                Feature Name *
              </label>
              <input
                id="name"
                v-model="name"
                type="text"
                placeholder="e.g., 24/7 Gym Access, Personal Training, Pool Access"
                required
                :disabled="isLoading"
                class="w-full h-12 px-4 py-3 text-primary-700 placeholder-primary-400 bg-white border-2 border-primary-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p class="text-xs text-primary-500">
                Choose a clear, descriptive name for your feature
              </p>
            </div>

            <!-- Description -->
            <div class="space-y-3">
              <label
                for="description"
                class="text-sm font-semibold text-primary-700 flex items-center"
              >
                <FontAwesomeIcon icon="align-left" class="w-4 h-4 mr-2 text-secondary-500" />
                Description *
              </label>
              <textarea
                id="description"
                v-model="description"
                placeholder="Describe what this feature includes and how it benefits users..."
                rows="4"
                required
                :disabled="isLoading"
                class="w-full px-4 py-3 text-primary-700 placeholder-primary-400 bg-white border-2 border-primary-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 resize-vertical disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p class="text-xs text-primary-500">
                Help users understand what this feature provides
              </p>
            </div>

            <!-- Form Actions -->
            <div
              class="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t border-primary-100"
            >
              <button
                type="button"
                @click="goBack"
                :disabled="isLoading"
                class="inline-flex items-center justify-center px-6 py-3 text-primary-600 bg-white border-2 border-primary-200 rounded-xl font-semibold hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon="arrow-left" class="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isLoading"
                class="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold text-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div v-if="isLoading" class="flex items-center">
                  <div
                    class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"
                  ></div>
                  Updating Feature...
                </div>
                <div v-else class="flex items-center">
                  <FontAwesomeIcon icon="save" class="w-5 h-5 mr-2" />
                  Update Feature
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { featuresService } from '../../service/featuresService'

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
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const name = ref('')
const description = ref('')

const featureId = route.params.id as string

const loadFeature = async () => {
  if (!featureId) {
    return
  }

  try {
    isLoadingFeature.value = true
    const data = await featuresService.getFeatureById(featureId)
    feature.value = data
    name.value = data.name
    description.value = data.description
  } catch (error) {
    errorMessage.value = 'Failed to load feature'
    console.error('Error loading feature:', error)
  } finally {
    isLoadingFeature.value = false
  }
}

const goBack = () => {
  // Navigate back to features list, not feature details
  router.push('/features')
}

const handleSubmit = async () => {
  if (!name.value.trim() || !description.value.trim()) {
    errorMessage.value = 'Please fill in all required fields'
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    await featuresService.updateFeature(featureId, {
      name: name.value.trim(),
      description: description.value.trim(),
    })

    successMessage.value = 'Feature updated successfully!'

    // Redirect to features list after a short delay
    setTimeout(() => {
      router.push('/features')
    }, 1000)
  } catch (error: any) {
    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to update feature. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadFeature()
})
</script>
