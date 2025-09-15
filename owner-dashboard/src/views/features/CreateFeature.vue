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
            Add New Feature ⚙️
          </h1>
          <p class="text-lg text-white/90 font-medium max-w-2xl mx-auto">
            Create a new feature for your subscription plans
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
            <p class="text-primary-600">Fill in the information for your new feature</p>
          </div>
        </div>
      </div>

      <!-- Error Toast -->
      <ErrorToast
        :show="hasErrors"
        :type="latestError?.type === 'validation' ? 'warning' : 'error'"
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

      <div class="bg-white rounded-2xl border border-primary-200 shadow-soft overflow-hidden">
        <div
          class="p-8 border-b border-primary-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50"
        >
          <h3 class="text-xl font-bold text-primary-700 flex items-center">
            <FontAwesomeIcon icon="cog" class="w-6 h-6 mr-3 text-secondary-500" />
            Feature Information
          </h3>
          <p class="text-primary-600 mt-2">Configure your feature details</p>
        </div>
        <div class="p-8">
          <!-- Error Message -->
          <div v-if="hasErrors" class="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl">
            <div class="flex items-center">
              <FontAwesomeIcon icon="exclamation-triangle" class="w-5 h-5 text-error-500 mr-3" />
              <p class="text-sm text-error-600 font-medium">{{ latestError?.message }}</p>
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
                v-model="formData.name"
                type="text"
                placeholder="e.g., 24/7 Gym Access, Personal Training, Pool Access"
                required
                :disabled="isLoading"
                class="w-full h-12 px-4 py-3 text-primary-700 placeholder-primary-400 bg-white border-2 border-primary-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                :class="{
                  'border-error-300 focus:border-error-500 focus:ring-error-100':
                    hasErrorForField('name'),
                }"
                @blur="validateName"
                @input="clearFieldErrors('name')"
              />
              <p v-if="hasErrorForField('name')" class="text-xs text-error-600 flex items-center">
                <FontAwesomeIcon icon="exclamation-circle" class="w-3 h-3 mr-1" />
                {{ getErrorsForField('name')[0]?.message }}
              </p>
              <p v-else class="text-xs text-primary-500">
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
                v-model="formData.description"
                placeholder="Describe what this feature includes and how it benefits users..."
                rows="4"
                required
                :disabled="isLoading"
                class="w-full px-4 py-3 text-primary-700 placeholder-primary-400 bg-white border-2 border-primary-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 resize-vertical disabled:opacity-50 disabled:cursor-not-allowed"
                :class="{
                  'border-error-300 focus:border-error-500 focus:ring-error-100':
                    hasErrorForField('description'),
                }"
                @blur="validateDescription"
                @input="clearFieldErrors('description')"
              />
              <div class="flex justify-between items-center">
                <p
                  v-if="hasErrorForField('description')"
                  class="text-xs text-error-600 flex items-center"
                >
                  <FontAwesomeIcon icon="exclamation-circle" class="w-3 h-3 mr-1" />
                  {{ getErrorsForField('description')[0]?.message }}
                </p>
                <p v-else class="text-xs text-primary-500">
                  Help users understand what this feature provides
                </p>
                <span class="text-xs text-primary-400">{{ formData.description.length }}/1000</span>
              </div>
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
                :disabled="isLoading || !isFormValid"
                class="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold text-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div v-if="isLoading" class="flex items-center">
                  <div
                    class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"
                  ></div>
                  Creating Feature...
                </div>
                <div v-else class="flex items-center">
                  <FontAwesomeIcon icon="plus" class="w-5 h-5 mr-2" />
                  Create Feature
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
import { ref, computed, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { featuresService, type CreateFeatureData } from '../../service/featuresService'
import { useErrorHandler } from '../../composables/useErrorHandler'

// Import reusable components
const ErrorToast = defineAsyncComponent(() => import('../../components/common/ErrorToast.vue'))

const router = useRouter()

// Error handling
const {
  hasErrors,
  latestError,
  clearAllErrors,
  withErrorHandling,
  isLoading,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  hasErrorForField,
  getErrorsForField,
  clearErrorsByField,
  handleError,
} = useErrorHandler()

// Form data
const formData = ref<CreateFeatureData>({
  name: '',
  description: '',
})

// Success state
const showSuccessToast = ref(false)
const successMessage = ref({ title: '', text: '' })

// Computed
const isFormValid = computed(() => {
  return (
    formData.value.name.trim().length >= 2 &&
    formData.value.description.trim().length >= 1 &&
    !hasErrors.value
  )
})

const getErrorTitle = (type?: string) => {
  switch (type) {
    case 'validation':
      return 'Validation Error'
    case 'network':
      return 'Connection Error'
    case 'server':
      return 'Server Error'
    default:
      return 'Error'
  }
}

// Methods
const validateName = () => {
  clearFieldErrors('name')
  const name = formData.value.name.trim()

  if (!validateRequired(name, 'Feature name')) return false
  if (!validateMinLength(name, 2, 'Feature name')) return false
  if (!validateMaxLength(name, 100, 'Feature name')) return false

  return true
}

const validateDescription = () => {
  clearFieldErrors('description')
  const description = formData.value.description.trim()

  if (!validateRequired(description, 'Description')) return false
  if (!validateMinLength(description, 1, 'Description')) return false
  if (!validateMaxLength(description, 1000, 'Description')) return false

  return true
}

const clearFieldErrors = (field: string) => {
  clearErrorsByField(field)
}

const validateForm = (): boolean => {
  clearAllErrors()

  const nameValid = validateName()
  const descriptionValid = validateDescription()

  return nameValid && descriptionValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  const result = await withErrorHandling(
    () =>
      featuresService.createFeature({
        name: formData.value.name.trim(),
        description: formData.value.description.trim(),
      }),
    'Creating feature',
    { showLoading: true, clearPreviousErrors: true },
  )

  if (result) {
    // Show success message
    showSuccess('Feature Created', `"${formData.value.name.trim()}" has been successfully created.`)

    // Wait a moment for the success message to show, then navigate
    setTimeout(() => {
      router.push('/features')
    }, 1500)
  }
}

const showSuccess = (title: string, text: string) => {
  successMessage.value = { title, text }
  showSuccessToast.value = true
}

const goBack = () => {
  if (formData.value.name.trim() || formData.value.description.trim()) {
    if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
      router.push('/features')
    }
  } else {
    router.push('/features')
  }
}
</script>
