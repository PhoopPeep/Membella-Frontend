<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center space-x-2">
      <button
        @click="goBack"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-9 px-3"
      >
        <ArrowLeft class="w-4 h-4 mr-1" />
        Back
      </button>
      <h1 class="text-3xl font-bold tracking-tight">Edit Feature</h1>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingFeature" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading feature...</p>
    </div>

    <!-- Feature Not Found -->
    <div
      v-else-if="!feature && !isLoadingFeature"
      class="bg-white rounded-lg border border-gray-200 shadow-sm max-w-2xl"
    >
      <div class="text-center py-12">
        <p class="text-gray-500">Feature not found</p>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-else-if="feature" class="bg-white rounded-lg border border-gray-200 shadow-sm max-w-2xl">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Feature Details</h2>
      </div>

      <div class="p-6">
        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p class="text-sm text-green-600">{{ successMessage }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <label for="name" class="block text-sm font-medium text-gray-700">
              Feature Name *
            </label>
            <input
              id="name"
              v-model="name"
              type="text"
              placeholder="Enter feature name"
              required
              :disabled="isLoading"
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div class="space-y-2">
            <label for="description" class="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              v-model="description"
              placeholder="Enter feature description"
              rows="4"
              required
              :disabled="isLoading"
              class="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-vertical"
            />
          </div>

          <div class="flex space-x-2 pt-4">
            <button
              type="submit"
              :disabled="isLoading"
              class="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isLoading ? 'Updating...' : 'Update Feature' }}
            </button>
            <button
              type="button"
              @click="goBack"
              :disabled="isLoading"
              class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
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
