<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center space-x-2">
      <button
        @click="goBack"
        :disabled="isLoading"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-9 px-3 mr-2"
      >
        <ArrowLeft class="w-4 h-4 mr-1" />
        Back
      </button>
      <h1 class="text-3xl font-bold tracking-tight">Add Feature</h1>
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

    <div class="max-w-2xl rounded-lg border bg-white shadow-sm">
      <div class="p-6">
        <h2 class="text-lg font-semibold mb-6">Feature Details</h2>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <label for="name" class="text-sm font-medium leading-none"> Feature Name * </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Enter feature name"
              required
              :disabled="isLoading"
              @blur="validateName"
              @input="clearFieldErrors('name')"
              class="flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
              :class="{
                'border-red-300 focus:ring-red-500 focus:border-red-500': hasErrorForField('name'),
                'border-gray-300': !hasErrorForField('name'),
              }"
            />
            <div v-if="hasErrorForField('name')" class="text-xs text-red-600 flex items-center">
              <AlertCircle class="w-3 h-3 mr-1" />
              {{ getErrorsForField('name')[0]?.message }}
            </div>
          </div>

          <div class="space-y-2">
            <label for="description" class="text-sm font-medium leading-none">
              Description *
            </label>
            <textarea
              id="description"
              v-model="formData.description"
              placeholder="Enter feature description (at least 10 characters)"
              rows="4"
              required
              :disabled="isLoading"
              @blur="validateDescription"
              @input="clearFieldErrors('description')"
              class="flex min-h-20 w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-vertical"
              :class="{
                'border-red-300 focus:ring-red-500 focus:border-red-500':
                  hasErrorForField('description'),
                'border-gray-300': !hasErrorForField('description'),
              }"
            />
            <div class="flex justify-between items-center">
              <div
                v-if="hasErrorForField('description')"
                class="text-xs text-red-600 flex items-center"
              >
                <AlertCircle class="w-3 h-3 mr-1" />
                {{ getErrorsForField('description')[0]?.message }}
              </div>
              <div class="text-xs text-gray-500 ml-auto">
                {{ formData.description.length }}/1000 characters
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex space-x-2 pt-4 border-t border-gray-200">
            <button
              type="submit"
              :disabled="isLoading || !isFormValid"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
            >
              <div v-if="isLoading" class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
              <span v-else>Add Feature</span>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, AlertCircle } from 'lucide-vue-next'
import { featuresService, type CreateFeatureData } from '../../service/featuresService'
import { useErrorHandler } from '../../composables/useErrorHandler'
import ErrorToast from '../../components/common/ErrorToast.vue'

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
    formData.value.description.trim().length >= 10 &&
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
  if (!validateMinLength(description, 10, 'Description')) return false
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
