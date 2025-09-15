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
            Create New Plan ✨
          </h1>
          <p class="text-lg text-white/90 font-medium max-w-2xl mx-auto">
            Design your perfect subscription plan
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
            title="Back to Plans"
          >
            <FontAwesomeIcon icon="arrow-left" class="w-5 h-5" />
          </button>
          <div>
            <h2 class="text-xl font-bold text-primary-700">Plan Details</h2>
            <p class="text-primary-600 text-sm">Fill in the information for your new plan</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-primary-200 shadow-soft overflow-hidden">
        <div
          class="p-8 border-b border-primary-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50"
        >
          <h3 class="text-lg font-bold text-primary-700 flex items-center">
            <FontAwesomeIcon icon="credit-card" class="w-5 h-5 mr-3 text-secondary-500" />
            Plan Information
          </h3>
          <p class="text-primary-600 mt-1 text-sm">Configure your subscription plan details</p>
        </div>
        <div class="p-8">
          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl">
            <div class="flex items-center">
              <FontAwesomeIcon icon="exclamation-triangle" class="w-5 h-5 text-error-500 mr-3" />
              <p class="text-sm text-error-600 font-medium">{{ errorMessage }}</p>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-8">
            <!-- Plan Name -->
            <div class="space-y-3">
              <label for="name" class="text-sm font-semibold text-primary-700 flex items-center">
                <FontAwesomeIcon icon="tag" class="w-4 h-4 mr-2 text-secondary-500" />
                Plan Name *
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                placeholder="e.g., Premium Membership, Basic Plan, Pro Package"
                required
                :disabled="isLoading"
                class="w-full h-12 px-4 py-3 text-primary-700 placeholder-primary-400 bg-white border-2 border-primary-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p class="text-xs text-primary-500">Choose a clear, descriptive name for your plan</p>
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
                v-model="formData.description"
                placeholder="Describe what this plan includes and who it's for..."
                rows="4"
                required
                :disabled="isLoading"
                class="w-full px-4 py-3 text-primary-700 placeholder-primary-400 bg-white border-2 border-primary-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 resize-vertical disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p class="text-xs text-primary-500">
                Help customers understand what they'll get with this plan
              </p>
            </div>

            <!-- Price and Duration -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Price -->
              <div class="space-y-3">
                <label for="price" class="text-sm font-semibold text-primary-700 flex items-center">
                  <FontAwesomeIcon icon="dollar-sign" class="w-4 h-4 mr-2 text-secondary-500" />
                  Price (฿) *
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span class="text-primary-500 font-medium">฿</span>
                  </div>
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
                    class="w-full h-12 pl-8 pr-4 py-3 text-primary-700 placeholder-primary-400 bg-white border-2 border-primary-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="{
                      'border-error-300 focus:border-error-500 focus:ring-error-100': priceError,
                    }"
                  />
                </div>
                <p v-if="priceError" class="text-xs text-error-600 flex items-center">
                  <FontAwesomeIcon icon="exclamation-circle" class="w-3 h-3 mr-1" />
                  {{ priceError }}
                </p>
                <p v-else class="text-xs text-primary-500">
                  Set the price for this subscription plan
                </p>
              </div>

              <!-- Duration -->
              <div class="space-y-3">
                <label
                  for="duration"
                  class="text-sm font-semibold text-primary-700 flex items-center"
                >
                  <FontAwesomeIcon icon="calendar" class="w-4 h-4 mr-2 text-secondary-500" />
                  Duration (days) *
                </label>
                <input
                  id="duration"
                  v-model.number="formData.duration"
                  type="number"
                  min="1"
                  placeholder="30"
                  required
                  :disabled="isLoading"
                  @input="validateDuration"
                  class="w-full h-12 px-4 py-3 text-primary-700 placeholder-primary-400 bg-white border-2 border-primary-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="{
                    'border-error-300 focus:border-error-500 focus:ring-error-100': durationError,
                  }"
                />
                <p v-if="durationError" class="text-xs text-error-600 flex items-center">
                  <FontAwesomeIcon icon="exclamation-circle" class="w-3 h-3 mr-1" />
                  {{ durationError }}
                </p>
                <p v-else class="text-xs text-primary-500">How long does this subscription last?</p>
              </div>
            </div>

            <!-- Features Selection -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="text-sm font-semibold text-primary-700 flex items-center">
                  <FontAwesomeIcon icon="star" class="w-4 h-4 mr-2 text-secondary-500" />
                  Features *
                  <span class="text-xs text-primary-500 font-normal ml-2"
                    >(Select at least one)</span
                  >
                </div>
                <span class="text-xs text-primary-500 font-medium">
                  {{ selectedFeatures.length }} selected
                </span>
              </div>

              <div
                v-if="features.length > 0"
                class="space-y-3 max-h-64 overflow-y-auto border-2 border-primary-200 rounded-xl p-4 bg-primary-50/30"
                :class="{ 'border-error-300 bg-error-50/30': featuresError }"
              >
                <div
                  v-for="feature in features"
                  :key="feature.feature_id"
                  class="flex items-start space-x-3 p-3 bg-white rounded-xl border border-primary-100 hover:border-primary-300 transition-all duration-200"
                >
                  <input
                    :id="feature.feature_id"
                    v-model="selectedFeatures"
                    :value="feature.feature_id"
                    type="checkbox"
                    @change="validateFeatures"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-primary-300 rounded mt-1"
                  />
                  <label :for="feature.feature_id" class="flex-1 cursor-pointer">
                    <div>
                      <p class="font-semibold text-primary-700">{{ feature.name }}</p>
                      <p class="text-sm text-primary-600 mt-1">{{ feature.description }}</p>
                    </div>
                  </label>
                </div>
              </div>

              <div
                v-else
                class="text-center py-8 bg-primary-50 rounded-xl border-2 border-primary-200"
              >
                <div
                  class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <FontAwesomeIcon icon="cog" class="w-8 h-8 text-primary-500" />
                </div>
                <p class="text-primary-600 font-medium mb-2">No features available</p>
                <p class="text-sm text-primary-500 mb-4">
                  Create features first to assign them to plans
                </p>
                <button
                  type="button"
                  @click="navigateToCreateFeature"
                  class="inline-flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition-all duration-200"
                >
                  <FontAwesomeIcon icon="plus" class="w-4 h-4 mr-2" />
                  Create Features
                </button>
              </div>

              <p v-if="featuresError" class="text-xs text-error-600 flex items-center">
                <FontAwesomeIcon icon="exclamation-circle" class="w-3 h-3 mr-1" />
                {{ featuresError }}
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
                :disabled="isLoading || hasValidationErrors"
                class="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold text-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div v-if="isLoading" class="flex items-center">
                  <div
                    class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"
                  ></div>
                  Creating Plan...
                </div>
                <div v-else class="flex items-center">
                  <FontAwesomeIcon icon="plus" class="w-5 h-5 mr-2" />
                  Create Plan
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { plansService, type CreatePlanData } from '../../service/plansService'
import { featuresService, type Feature } from '../../service/featuresService'

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
