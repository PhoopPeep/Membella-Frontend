import { ref, computed } from 'vue'

export interface ErrorState {
  hasError: boolean
  message: string
  type: 'validation' | 'network' | 'auth' | 'server' | 'unknown'
  code?: string | number
  field?: string
  retryable: boolean
  timestamp: Date
}

export interface ValidationError {
  field: string
  message: string
}

export const useErrorHandler = () => {
  const errors = ref<ErrorState[]>([])
  const isLoading = ref(false)

  // Computed properties
  const hasErrors = computed(() => errors.value.length > 0)
  const latestError = computed(() => errors.value[errors.value.length - 1] || null)
  const validationErrors = computed(() => errors.value.filter((err) => err.type === 'validation'))
  const networkErrors = computed(() => errors.value.filter((err) => err.type === 'network'))

  // Error classification
  const classifyError = (error: any): ErrorState => {
    const now = new Date()

    // Network errors
    if (error.code === 'ERR_NETWORK' || error.message?.includes('network')) {
      return {
        hasError: true,
        message: 'Network connection error. Please check your internet connection.',
        type: 'network',
        code: error.code,
        retryable: true,
        timestamp: now,
      }
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        hasError: true,
        message: 'Request timeout. Please try again.',
        type: 'network',
        code: error.code,
        retryable: true,
        timestamp: now,
      }
    }

    // Authentication errors
    if (
      error.message?.includes('Authentication') ||
      error.message?.includes('login') ||
      error.message?.includes('unauthorized')
    ) {
      return {
        hasError: true,
        message: error.message,
        type: 'auth',
        code: 401,
        retryable: false,
        timestamp: now,
      }
    }

    // Validation errors
    if (
      error.message?.includes('required') ||
      error.message?.includes('invalid') ||
      error.message?.includes('must be') ||
      error.message?.includes('characters')
    ) {
      return {
        hasError: true,
        message: error.message,
        type: 'validation',
        code: 400,
        retryable: false,
        timestamp: now,
      }
    }

    // Rate limiting
    if (error.message?.includes('rate limit') || error.message?.includes('Too many')) {
      return {
        hasError: true,
        message: error.message,
        type: 'server',
        code: 429,
        retryable: true,
        timestamp: now,
      }
    }

    // Server errors
    if (error.message?.includes('Server error') || error.message?.includes('Internal server')) {
      return {
        hasError: true,
        message: 'Server error. Please try again later.',
        type: 'server',
        code: 500,
        retryable: true,
        timestamp: now,
      }
    }

    // Default unknown error
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred',
      type: 'unknown',
      retryable: true,
      timestamp: now,
    }
  }

  // Methods
  const handleError = (error: any, context?: string) => {
    console.error(`Error in ${context || 'unknown context'}:`, error)

    const errorState = classifyError(error)

    // Add context to message if provided
    if (context) {
      errorState.message = `${context}: ${errorState.message}`
    }

    errors.value.push(errorState)

    // Auto-clear validation errors after 10 seconds
    if (errorState.type === 'validation') {
      setTimeout(() => {
        removeError(errorState)
      }, 10000)
    }

    // Auto-clear network errors after 15 seconds
    if (errorState.type === 'network') {
      setTimeout(() => {
        removeError(errorState)
      }, 15000)
    }

    return errorState
  }

  const removeError = (errorToRemove: ErrorState) => {
    const index = errors.value.findIndex((err) => err.timestamp === errorToRemove.timestamp)
    if (index > -1) {
      errors.value.splice(index, 1)
    }
  }

  const clearAllErrors = () => {
    errors.value = []
  }

  const clearErrorsByType = (type: ErrorState['type']) => {
    errors.value = errors.value.filter((err) => err.type !== type)
  }

  const clearErrorsByField = (field: string) => {
    errors.value = errors.value.filter((err) => err.field !== field)
  }

  // Async wrapper with error handling
  const withErrorHandling = async <T>(
    asyncFn: () => Promise<T>,
    context?: string,
    options?: {
      showLoading?: boolean
      clearPreviousErrors?: boolean
      retryCount?: number
    },
  ): Promise<T | null> => {
    const { showLoading = true, clearPreviousErrors = true, retryCount = 0 } = options || {}

    if (clearPreviousErrors) {
      clearAllErrors()
    }

    if (showLoading) {
      isLoading.value = true
    }

    let lastError: any = null

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const result = await asyncFn()
        if (showLoading) {
          isLoading.value = false
        }
        return result
      } catch (error) {
        lastError = error

        const errorState = classifyError(error)

        // Only retry if error is retryable and we have attempts left
        if (errorState.retryable && attempt < retryCount) {
          console.log(`Retrying operation (attempt ${attempt + 2}/${retryCount + 1})`)
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
          continue
        }

        // Handle the error if no more retries
        handleError(error, context)
        break
      }
    }

    if (showLoading) {
      isLoading.value = false
    }

    return null
  }

  // Validation helpers
  const validateRequired = (value: any, fieldName: string): boolean => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      handleError(new Error(`${fieldName} is required`))
      return false
    }
    return true
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      handleError(new Error('Please enter a valid email address'))
      return false
    }
    return true
  }

  const validateMinLength = (value: string, minLength: number, fieldName: string): boolean => {
    if (value.length < minLength) {
      handleError(new Error(`${fieldName} must be at least ${minLength} characters long`))
      return false
    }
    return true
  }

  const validateMaxLength = (value: string, maxLength: number, fieldName: string): boolean => {
    if (value.length > maxLength) {
      handleError(new Error(`${fieldName} must be less than ${maxLength} characters`))
      return false
    }
    return true
  }

  // Error formatting helpers
  const getErrorMessage = (error: ErrorState): string => {
    return error.message
  }

  const getErrorsForField = (field: string): ErrorState[] => {
    return errors.value.filter((err) => err.field === field)
  }

  const hasErrorForField = (field: string): boolean => {
    return getErrorsForField(field).length > 0
  }

  return {
    // State
    errors,
    isLoading,

    // Computed
    hasErrors,
    latestError,
    validationErrors,
    networkErrors,

    // Methods
    handleError,
    removeError,
    clearAllErrors,
    clearErrorsByType,
    clearErrorsByField,
    withErrorHandling,

    // Validation helpers
    validateRequired,
    validateEmail,
    validateMinLength,
    validateMaxLength,

    // Error helpers
    getErrorMessage,
    getErrorsForField,
    hasErrorForField,
    classifyError,
  }
}
