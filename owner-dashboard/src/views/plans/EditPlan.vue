<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center space-x-2">
      <button
        @click="goBack"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-9 px-3 mr-2"
      >
        <FontAwesomeIcon icon="arrow-left" class="w-4 h-4 mr-1" />
        Back
      </button>
      <h1 class="text-3xl font-bold tracking-tight">Edit Plan</h1>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingPlan" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading plan...</p>
    </div>

    <!-- Plan Not Found -->
    <div
      v-else-if="!plan && !isLoadingPlan"
      class="bg-white rounded-lg border border-gray-200 shadow-sm max-w-2xl"
    >
      <div class="text-center py-12">
        <div
          class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4"
        >
          <FontAwesomeIcon icon="exclamation-circle" class="w-6 h-6 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Plan not found</h3>
        <p class="text-gray-500 mb-4">
          The plan you're looking for doesn't exist or has been deleted.
        </p>
        <button
          @click="goBack"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
        >
          Back to Plans
        </button>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-else-if="plan" class="max-w-2xl rounded-lg border bg-white shadow-sm">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold">Plan Details</h2>
        <p class="text-sm text-gray-500 mt-1">Update your plan information and features</p>
      </div>
      <div class="p-6">
        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div class="flex">
            <FontAwesomeIcon
              icon="exclamation-circle"
              class="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0"
            />
            <p class="text-sm text-red-600">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div class="flex">
            <FontAwesomeIcon
              icon="check-circle"
              class="w-5 h-5 text-green-400 mt-0.5 mr-2 flex-shrink-0"
            />
            <p class="text-sm text-green-600">{{ successMessage }}</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Plan Name -->
          <div class="space-y-2">
            <label for="name" class="text-sm font-medium leading-none text-gray-700">
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
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': nameError }"
            />
            <p v-if="nameError" class="text-xs text-red-600 flex items-center">
              <FontAwesomeIcon icon="exclamation-circle" class="w-3 h-3 mr-1" />
              {{ nameError }}
            </p>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <label for="description" class="text-sm font-medium leading-none text-gray-700">
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
              class="flex min-h-20 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-vertical"
              :class="{
                'border-red-300 focus:ring-red-500 focus:border-red-500': descriptionError,
              }"
            />
            <p v-if="descriptionError" class="text-xs text-red-600 flex items-center">
              <FontAwesomeIcon icon="exclamation-circle" class="w-3 h-3 mr-1" />
              {{ descriptionError }}
            </p>
          </div>

          <!-- Price and Duration -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Price -->
            <div class="space-y-2">
              <label for="price" class="text-sm font-medium leading-none text-gray-700">
                Price (USD) *
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">$</span>
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
                  class="flex h-10 w-full rounded-md border border-gray-300 bg-white pl-7 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': priceError }"
                />
              </div>
              <p v-if="priceError" class="text-xs text-red-600 flex items-center">
                <FontAwesomeIcon icon="exclamation-circle" class="w-3 h-3 mr-1" />
                {{ priceError }}
              </p>
            </div>

            <!-- Duration -->
            <div class="space-y-2">
              <label for="duration" class="text-sm font-medium leading-none text-gray-700">
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
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': durationError }"
              />
              <p v-if="durationError" class="text-xs text-red-600 flex items-center">
                <FontAwesomeIcon icon="exclamation-circle" class="w-3 h-3 mr-1" />
                {{ durationError }}
              </p>
            </div>
          </div>

          <!-- Features Selection -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium leading-none text-gray-700">
                Features *
                <span class="text-xs text-gray-500 font-normal">(Select at least one)</span>
              </label>
              <span class="text-xs text-gray-500"> {{ selectedFeatures.length }} selected </span>
            </div>

            <div
              v-if="features.length > 0"
              class="space-y-3 max-h-64 overflow-y-auto border rounded-md p-4 bg-gray-50"
              :class="{ 'border-red-300 bg-red-50': featuresError }"
            >
              <div
                v-for="feature in features"
                :key="feature.feature_id"
                class="flex items-start space-x-3 p-3 bg-white rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <input
                  :id="feature.feature_id"
                  v-model="selectedFeatures"
                  :value="feature.feature_id"
                  type="checkbox"
                  @change="validateFeatures"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                />
                <label :for="feature.feature_id" class="flex-1 cursor-pointer">
                  <div>
                    <p class="font-medium text-gray-900">{{ feature.name }}</p>
                    <p class="text-sm text-gray-600 mt-1">{{ feature.description }}</p>
                  </div>
                </label>
              </div>
            </div>

            <div v-else class="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
              <div
                class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4"
              >
                <FontAwesomeIcon icon="cog" class="w-6 h-6 text-gray-400" />
              </div>
              <p class="text-sm text-gray-500 mb-2">No features available</p>
              <p class="text-xs text-gray-400">Create features first to assign them to plans</p>
            </div>

            <p v-if="featuresError" class="text-xs text-red-600 flex items-center">
              <FontAwesomeIcon icon="exclamation-circle" class="w-3 h-3 mr-1" />
              {{ featuresError }}
            </p>
          </div>

          <!-- Form Actions -->
          <div
            class="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200"
          >
            <button
              type="button"
              @click="goBack"
              :disabled="isLoading"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-10 px-4 py-2 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isLoading || hasValidationErrors || !hasChanges"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 order-1 sm:order-2"
            >
              <div v-if="isLoading" class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </div>
              <span v-else>Update Plan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { plansService, type Plan, type UpdatePlanData } from '../../service/plansService'
import { featuresService, type Feature } from '../../service/featuresService'

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
  if (price === null || price === undefined || isNaN(price)) {
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
  if (duration === null || duration === undefined || isNaN(duration)) {
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
    JSON.stringify(selectedFeatures.value.sort()) !==
      JSON.stringify(originalData.value.features?.sort() || [])
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
  } catch (error: any) {
    console.error('Error loading plan:', error)
    errorMessage.value = error.message || 'Failed to load plan'
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
  } catch (error: any) {
    console.error('Update plan error:', error)
    errorMessage.value = error.message || 'Failed to update plan. Please try again.'
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
