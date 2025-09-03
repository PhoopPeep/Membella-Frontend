<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <!-- Page Header -->
    <PageHeader title="Add Feature" show-back-button @back="goBack" />

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

    <!-- Form Card -->
    <Card title="Feature Details" card-class="max-w-2xl">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Feature Name -->
        <FormInput
          v-model="formData.name"
          label="Feature Name"
          placeholder="Enter feature name"
          required
          :disabled="isLoading"
          :error-message="hasErrorForField('name') ? getErrorsForField('name')[0]?.message : ''"
          @blur="validateName"
          @input="clearFieldErrors('name')"
        />

        <!-- Description -->
        <FormInput
          v-model="formData.description"
          type="textarea"
          label="Description"
          placeholder="Enter feature description (at least 1 character)"
          :rows="4"
          required
          :disabled="isLoading"
          :error-message="
            hasErrorForField('description') ? getErrorsForField('description')[0]?.message : ''
          "
          :show-char-count="true"
          :max-length="1000"
          @blur="validateDescription"
          @input="clearFieldErrors('description')"
        />

        <!-- Form Actions -->
        <div class="flex space-x-2 pt-4 border-t border-gray-200">
          <ActionButtons :actions="formActions" @action="handleFormAction" />
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { featuresService, type CreateFeatureData } from '../../service/featuresService'
import { useErrorHandler } from '../../composables/useErrorHandler'

// Import reusable components
const PageHeader = defineAsyncComponent(() => import('../../components/common/PageHeader.vue'))
const Card = defineAsyncComponent(() => import('../../components/common/Card.vue'))
const FormInput = defineAsyncComponent(() => import('../../components/common/FormInput.vue'))
const ActionButtons = defineAsyncComponent(() => import('../../components/common/ActionButtons.vue'))
import type { ActionButton } from '../../components/common/ActionButtons.vue'
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

const formActions = computed((): ActionButton[] => [
  {
    key: 'submit',
    text: 'Add Feature',
    variant: 'primary',
    disabled: isLoading.value || !isFormValid.value,
    loading: isLoading.value,
    loadingText: 'Creating...',
  },
  {
    key: 'cancel',
    text: 'Cancel',
    variant: 'secondary',
    disabled: isLoading.value,
  },
])

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

const handleFormAction = (action: ActionButton) => {
  switch (action.key) {
    case 'submit':
      handleSubmit()
      break
    case 'cancel':
      goBack()
      break
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
