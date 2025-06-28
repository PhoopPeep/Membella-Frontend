<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center space-x-2">
      <button
        @click="goBack"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-9 px-3 mr-2"
      >
        <ArrowLeft class="w-4 h-4 mr-1" />
        Back
      </button>
      <h1 class="text-3xl font-bold tracking-tight">Create Plan</h1>
    </div>

    <div class="max-w-2xl rounded-lg border bg-white shadow-sm">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold">Plan Details</h2>
      </div>
      <div class="p-6">
        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <label for="name" class="text-sm font-medium leading-none">Plan Name *</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Enter plan name"
              required
              :disabled="isLoading"
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div class="space-y-2">
            <label for="description" class="text-sm font-medium leading-none">Description *</label>
            <textarea
              id="description"
              v-model="formData.description"
              placeholder="Enter plan description"
              rows="3"
              required
              :disabled="isLoading"
              class="flex min-h-20 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label for="price" class="text-sm font-medium leading-none">Price ($) *</label>
              <input
                id="price"
                v-model.number="formData.price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                :disabled="isLoading"
                @input="validatePrice"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                :class="{ 'border-red-300 focus:ring-red-500': priceError }"
              />
              <p v-if="priceError" class="text-xs text-red-600">{{ priceError }}</p>
            </div>

            <div class="space-y-2">
              <label for="duration" class="text-sm font-medium leading-none">Duration (days) *</label>
              <input
                id="duration"
                v-model.number="formData.duration"
                type="number"
                min="1"
                placeholder="30"
                required
                :disabled="isLoading"
                @input="validateDuration"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                :class="{ 'border-red-300 focus:ring-red-500': durationError }"
              />
              <p v-if="durationError" class="text-xs text-red-600">{{ durationError }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <label class="text-sm font-medium leading-none">Features *</label>
            <div
              v-if="features.length > 0"
              class="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3"
              :class="{ 'border-red-300': featuresError }"
            >
              <div
                v-for="feature in features"
                :key="feature.feature_id"
                class="flex items-center space-x-2"
              >
                <input
                  :id="feature.feature_id"
                  v-model="selectedFeatures"
                  :value="feature.feature_id"
                  type="checkbox"
                  @change="validateFeatures"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label :for="feature.feature_id" class="text-sm font-normal cursor-pointer">
                  <div>
                    <p class="font-medium">{{ feature.name }}</p>
                    <p class="text-xs text-gray-500">{{ feature.description }}</p>
                  </div>
                </label>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 bg-gray-50 p-4 rounded-md">
              No features available. <br />
              <button
                type="button"
                @click="navigateToCreateFeature"
                class="text-blue-600 hover:text-blue-700 underline"
              >
                Create features first
              </button>
              to assign them to plans.
            </div>
            <p v-if="featuresError" class="text-xs text-red-600">{{ featuresError }}</p>
          </div>

          <div class="flex space-x-2 pt-4">
            <button
              type="submit"
              :disabled="isLoading || hasValidationErrors"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
            >
              {{ isLoading ? 'Creating...' : 'Create Plan' }}
            </button>
            <button
              type="button"
              @click="goBack"
              :disabled="isLoading"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-10 px-4 py-2"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { plansService, type CreatePlanData } from '../service/plansService'
import { featuresService, type Feature } from '../service/featuresService'

const router = useRouter()

const formData = ref<CreatePlanData>({
  name: '',
  description: '',
  price: 0,
  duration: 30,
  features: [],
})

const features = ref<Feature[]>([])
const selectedFeatures = ref<string[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

// Validation errors
const priceError = ref('')
const durationError = ref('')
const featuresError = ref('')

// Validation methods
const validatePrice = () => {
  priceError.value = ''
  if (formData.value.price < 0) {
    priceError.value = 'Price cannot be negative'
    formData.value.price = 0
  }
}

const validateDuration = () => {
  durationError.value = ''
  if (formData.value.duration < 1) {
    durationError.value = 'Duration must be at least 1 day'
    formData.value.duration = 1
  }
}

const validateFeatures = () => {
  featuresError.value = ''
  if (selectedFeatures.value.length === 0) {
    featuresError.value = 'Please select at least one feature'
  }
}

// Computed property to check if there are validation errors
const hasValidationErrors = computed(() => {
  return !!(priceError.value || durationError.value || featuresError.value)
})

const loadFeatures = async () => {
  try {
    features.value = await featuresService.getFeatures()
  } catch (error) {
    console.error('Failed to load features:', error)
  }
}

const handleSubmit = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    // Validate all fields
    validatePrice()
    validateDuration()
    validateFeatures()

    // Check if form is valid
    if (
      !formData.value.name.trim() ||
      !formData.value.description.trim() ||
      formData.value.price < 0 ||
      formData.value.duration < 1 ||
      selectedFeatures.value.length === 0
    ) {
      if (!formData.value.name.trim()) {
        throw new Error('Plan name is required')
      }
      if (!formData.value.description.trim()) {
        throw new Error('Plan description is required')
      }
      if (formData.value.price < 0) {
        throw new Error('Price cannot be negative')
      }
      if (formData.value.duration < 1) {
        throw new Error('Duration must be at least 1 day')
      }
      if (selectedFeatures.value.length === 0) {
        throw new Error('Please select at least one feature')
      }
    }

    await plansService.createPlan({
      name: formData.value.name.trim(),
      description: formData.value.description.trim(),
      price: formData.value.price,
      duration: formData.value.duration,
      features: selectedFeatures.value,
    })

    router.push('/plans')
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to create plan. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/plans')
}

const navigateToCreateFeature = () => {
  router.push('/features/create')
}

onMounted(() => {
  loadFeatures()
})
</script>