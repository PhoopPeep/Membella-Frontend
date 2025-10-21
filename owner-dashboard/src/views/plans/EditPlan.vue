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
            Edit Plan ✏️
          </h1>
          <p class="text-lg text-white/90 font-medium max-w-2xl mx-auto">
            Update your subscription plan information
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
            <h2 class="text-xl font-bold text-primary-700 mb-2">Edit Plan</h2>
            <p class="text-primary-600 text-sm">Update your plan information</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingPlan" class="flex flex-col items-center justify-center py-16">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin"></div>
          <div
            class="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"
          ></div>
        </div>
        <h3 class="text-lg font-bold text-primary-700 mt-4">Loading Plan</h3>
        <p class="text-primary-600 text-sm">Fetching plan details...</p>
      </div>

      <!-- Plan Not Found -->
      <div
        v-else-if="!plan && !isLoadingPlan"
        class="bg-white/80 backdrop-blur-sm rounded-3xl border border-error-200 shadow-xl p-12 max-w-2xl mx-auto"
      >
        <div class="text-center max-w-lg mx-auto">
          <div
            class="w-20 h-20 bg-gradient-to-r from-error-500 to-error-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <FontAwesomeIcon icon="exclamation-triangle" class="w-10 h-10 text-white" />
          </div>
          <h3 class="text-xl font-bold text-error-800 mb-3">Plan Not Found</h3>
          <p class="text-error-600 mb-6 font-medium text-sm">
            The plan you're looking for doesn't exist or has been deleted.
          </p>
          <button
            @click="goBack"
            class="inline-flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-semibold text-base hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FontAwesomeIcon icon="arrow-left" class="w-4 h-4 mr-2" />
            Back to Plans
          </button>
        </div>
      </div>

      <!-- Edit Form -->
      <div
        v-else-if="plan"
        class="bg-white rounded-2xl border border-primary-200 shadow-soft overflow-hidden"
      >
        <div
          class="p-8 border-b border-primary-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50"
        >
          <h2 class="text-xl font-bold text-primary-700 flex items-center">
            <FontAwesomeIcon icon="edit" class="w-6 h-6 mr-3 text-secondary-500" />
            Edit Plan
          </h2>
          <p class="text-primary-600 mt-1 text-sm">Update your plan information and features</p>
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

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Plan Name -->
            <div class="space-y-3">
              <label
                for="name"
                class="flex items-center text-sm font-semibold text-primary-700"
              >
                <FontAwesomeIcon icon="tag" class="w-4 h-4 mr-2 text-primary-600" />
                Plan Name *
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                placeholder="Enter plan name"
                required
                :disabled="isLoading"
                @blur="validateName"
                class="w-full h-12 px-4 py-3 text-primary-700 placeholder-primary-400 bg-white border-2 border-primary-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                :class="{
                  'border-error-300 focus:border-error-500 focus:ring-error-100': nameError,
                }"
              />
              <p v-if="nameError" class="text-xs text-error-600 flex items-center">
                <FontAwesomeIcon icon="exclamation-triangle" class="w-3 h-3 mr-1" />
                {{ nameError }}
              </p>
            </div>

            <!-- Description -->
            <div class="space-y-3">
              <label
                for="description"
                class="flex items-center text-sm font-semibold text-primary-700"
              >
                <FontAwesomeIcon icon="align-left" class="w-4 h-4 mr-2 text-primary-600" />
                Description *
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                placeholder="Enter plan description"
                rows="3"
                required
                :disabled="isLoading"
                @blur="validateDescription"
                class="w-full min-h-20 px-4 py-3 text-primary-700 placeholder-primary-400 bg-white border-2 border-primary-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 resize-vertical disabled:opacity-50 disabled:cursor-not-allowed"
                :class="{
                  'border-error-300 focus:border-error-500 focus:ring-error-100': descriptionError,
                }"
              />
              <p v-if="descriptionError" class="text-xs text-error-600 flex items-center">
                <FontAwesomeIcon icon="exclamation-triangle" class="w-3 h-3 mr-1" />
                {{ descriptionError }}
              </p>
            </div>

            <!-- Price and Duration -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Price -->
              <div class="space-y-3">
                <label
                  for="price"
                  class="flex items-center text-sm font-semibold text-primary-700"
                >
                  <FontAwesomeIcon icon="dollar-sign" class="w-4 h-4 mr-2 text-primary-600" />
                  Price (THB) *
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span class="text-primary-500 font-semibold">฿</span>
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
                    @blur="validatePrice"
                    class="w-full h-12 pl-8 pr-4 py-3 text-primary-700 placeholder-primary-400 bg-white border-2 border-primary-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="{
                      'border-error-300 focus:border-error-500 focus:ring-error-100': priceError,
                    }"
                  />
                </div>
                <p v-if="priceError" class="text-xs text-error-600 flex items-center">
                  <FontAwesomeIcon icon="exclamation-triangle" class="w-3 h-3 mr-1" />
                  {{ priceError }}
                </p>
              </div>

              <!-- Duration -->
              <div class="space-y-3">
                <label
                  for="duration"
                  class="flex items-center text-sm font-semibold text-primary-700"
                >
                  <FontAwesomeIcon icon="calendar" class="w-4 h-4 mr-2 text-primary-600" />
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
                  @blur="validateDuration"
                  class="w-full h-12 px-4 py-3 text-primary-700 placeholder-primary-400 bg-white border-2 border-primary-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="{
                    'border-error-300 focus:border-error-500 focus:ring-error-100': durationError,
                  }"
                />
                <p v-if="durationError" class="text-xs text-error-600 flex items-center">
                  <FontAwesomeIcon icon="exclamation-triangle" class="w-3 h-3 mr-1" />
                  {{ durationError }}
                </p>
              </div>
            </div>

            <!-- Features Selection -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="flex items-center text-sm font-semibold text-primary-700">
                  <FontAwesomeIcon icon="star" class="w-4 h-4 mr-2 text-primary-600" />
                  Features *
                  <span class="text-xs text-primary-500 font-normal ml-2"
                    >(Select at least one)</span
                  >
                </span>
                <span
                  class="text-xs text-primary-600 font-semibold bg-primary-100 px-2 py-1 rounded-full"
                >
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
                  class="flex items-start space-x-3 p-4 bg-white rounded-xl border border-primary-100 hover:border-primary-300 transition-all duration-200"
                >
                  <input
                    :id="feature.feature_id"
                    v-model="selectedFeatures"
                    :value="feature.feature_id"
                    type="checkbox"
                    @change="validateFeatures"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-primary-300 rounded mt-0.5"
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
                class="text-center py-12 bg-primary-50 rounded-xl border-2 border-primary-200"
              >
                <div
                  class="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <FontAwesomeIcon icon="star" class="w-8 h-8 text-white" />
                </div>
                <h3 class="text-lg font-bold text-primary-700 mb-2">No Features Available</h3>
                <p class="text-sm text-primary-600 mb-4">
                  Create features first to assign them to plans
                </p>
                <router-link
                  to="/features/create"
                  class="inline-flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FontAwesomeIcon icon="plus" class="w-4 h-4 mr-2" />
                  Create Features
                </router-link>
              </div>

              <p v-if="featuresError" class="text-xs text-error-600 flex items-center">
                <FontAwesomeIcon icon="exclamation-triangle" class="w-3 h-3 mr-1" />
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
                class="px-6 py-3 text-primary-600 bg-white border-2 border-primary-200 rounded-xl font-semibold hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon="arrow-left" class="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isLoading || hasValidationErrors || !hasChanges"
                class="px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold text-base hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div v-if="isLoading" class="flex items-center">
                  <div
                    class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"
                  ></div>
                  Updating...
                </div>
                <div v-else class="flex items-center">
                  <FontAwesomeIcon icon="save" class="w-4 h-4 mr-2" />
                  Update Plan
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { plansService } from '../../service/plansService'
import { featuresService } from '../../service/featuresService'
import type { Plan, UpdatePlanData } from '../../types/plans'
import type { Feature } from '../../types/features'

const router = useRouter()
const route = useRoute()

// Reactive state
const plan = ref<Plan | null>(null)
const features = ref<Feature[]>([])
const isLoadingPlan = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Form data
const formData = ref<UpdatePlanData>({
  name: '',
  description: '',
  price: 0,
  duration: 30,
  features: [],
})

const selectedFeatures = ref<string[]>([])
const planId = route.params.id as string

// Original data for change detection
const originalData = ref<UpdatePlanData | null>(null)

// Validation errors
const nameError = ref('')
const descriptionError = ref('')
const priceError = ref('')
const durationError = ref('')
const featuresError = ref('')

// Validation methods
const validateName = () => {
  nameError.value = ''
  const name = formData.value.name?.trim()
  if (!name) {
    nameError.value = 'Plan name is required'
  } else if (name.length < 2) {
    nameError.value = 'Plan name must be at least 2 characters'
  } else if (name.length > 100) {
    nameError.value = 'Plan name must be less than 100 characters'
  }
}

const validateDescription = () => {
  descriptionError.value = ''
  const description = formData.value.description?.trim()
  if (!description) {
    descriptionError.value = 'Description is required'
  } else if (description.length < 1) {
    descriptionError.value = 'Description must be at least 1 character'
  } else if (description.length > 500) {
    descriptionError.value = 'Description must be less than 500 characters'
  }
}

const validatePrice = () => {
  priceError.value = ''
  const price = formData.value.price
  if (price === null || price === undefined || Number.isNaN(price)) {
    priceError.value = 'Price is required'
  } else if (price < 0) {
    priceError.value = 'Price cannot be negative'
    formData.value.price = 0
  } else if (price > 999999) {
    priceError.value = 'Price cannot exceed $999,999'
  }
}

const validateDuration = () => {
  durationError.value = ''
  const duration = formData.value.duration
  if (duration === null || duration === undefined || Number.isNaN(duration)) {
    durationError.value = 'Duration is required'
  } else if (duration < 1) {
    durationError.value = 'Duration must be at least 1 day'
    formData.value.duration = 1
  } else if (duration > 3650) {
    durationError.value = 'Duration cannot exceed 10 years (3650 days)'
  }
}

const validateFeatures = () => {
  featuresError.value = ''
  if (selectedFeatures.value.length === 0) {
    featuresError.value = 'Please select at least one feature'
  }
}

const validateAllFields = () => {
  validateName()
  validateDescription()
  validatePrice()
  validateDuration()
  validateFeatures()
}

// Computed properties
const hasValidationErrors = computed(() => {
  return !!(
    nameError.value ||
    descriptionError.value ||
    priceError.value ||
    durationError.value ||
    featuresError.value
  )
})

const hasChanges = computed(() => {
  if (!originalData.value) return false

  return (
    formData.value.name !== originalData.value.name ||
    formData.value.description !== originalData.value.description ||
    formData.value.price !== originalData.value.price ||
    formData.value.duration !== originalData.value.duration ||
    JSON.stringify([...selectedFeatures.value].sort()) !==
      JSON.stringify([...(originalData.value.features || [])].sort())
  )
})

// Methods
const loadPlan = async () => {
  if (!planId) return

  try {
    isLoadingPlan.value = true
    errorMessage.value = ''

    const [planData, featuresData] = await Promise.all([
      plansService.getPlanById(planId),
      featuresService.getFeatures(),
    ])

    plan.value = planData
    features.value = featuresData

    // Populate form data
    formData.value = {
      name: planData.name,
      description: planData.description,
      price: planData.price,
      duration: planData.duration,
      features: planData.features,
    }

    selectedFeatures.value = [...planData.features]

    // Store original data for change detection
    originalData.value = { ...formData.value, features: [...planData.features] }
  } catch (error: unknown) {
    console.error('Error loading plan:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load plan'
  } finally {
    isLoadingPlan.value = false
  }
}

const handleSubmit = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // Validate all fields
    validateAllFields()

    // Don't submit if there are validation errors
    if (hasValidationErrors.value) {
      throw new Error('Please fix the validation errors before submitting')
    }

    // Don't submit if no changes were made
    if (!hasChanges.value) {
      throw new Error('No changes were made')
    }

    await plansService.updatePlan(planId, {
      name: formData.value.name.trim(),
      description: formData.value.description.trim(),
      price: formData.value.price,
      duration: formData.value.duration,
      features: selectedFeatures.value,
    })

    successMessage.value = 'Plan updated successfully!'

    // Update original data to reflect changes
    originalData.value = { ...formData.value, features: [...selectedFeatures.value] }

    // Redirect after a short delay
    setTimeout(() => {
      router.push(`/plans/${planId}`)
    }, 1500)
  } catch (error: unknown) {
    console.error('Update plan error:', error)
    errorMessage.value =
      error instanceof Error ? error.message : 'Failed to update plan. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  if (hasChanges.value) {
    if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
      router.push(`/plans/${planId}`)
    }
  } else {
    router.push(`/plans/${planId}`)
  }
}

// Watch for route changes to clear messages
watch(
  () => route.params.id,
  () => {
    errorMessage.value = ''
    successMessage.value = ''
  },
)

// Lifecycle
onMounted(() => {
  loadPlan()
})
</script>
