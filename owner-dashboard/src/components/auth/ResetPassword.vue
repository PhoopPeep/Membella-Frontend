<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
  >
    <div class="w-full max-w-md bg-white rounded-lg border shadow-sm">
      <div class="p-6 space-y-1">
        <h2 class="text-2xl font-bold text-center">Reset Password</h2>
        <p class="text-center text-gray-600" v-if="userInfo.email">
          Reset password for <strong>{{ userInfo.email }}</strong>
        </p>
      </div>
      <div class="p-6 pt-0">
        <!-- Loading State -->
        <div v-if="isVerifying" class="text-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
          ></div>
          <p class="text-gray-600">Verifying reset link...</p>
        </div>

        <!-- Invalid Token State -->
        <div v-else-if="!isValidToken" class="text-center py-8">
          <div
            class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FontAwesomeIcon icon="exclamation-circle" class="w-6 h-6 text-red-600" />
          </div>
          <h3 class="text-lg font-medium text-red-600 mb-2">Invalid Reset Link</h3>
          <p class="text-gray-600 mb-4">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <router-link
            to="/forgot-password"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
          >
            Request New Reset Link
          </router-link>
        </div>

        <!-- Reset Form -->
        <div v-else-if="isValidToken && !passwordReset">
          <!-- Error Message -->
          <div v-if="showErrorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-600">{{ currentErrorMessage }}</p>
            <div class="mt-2">
              <small class="text-xs text-red-500">
                This message will disappear in {{ errorCountdown }} seconds
              </small>
            </div>
          </div>

          <!-- Success Message -->
          <div
            v-if="showSuccessMessage"
            class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md"
          >
            <p class="text-sm text-green-600">{{ currentSuccessMessage }}</p>
          </div>

          <form @submit.prevent="handleResetPassword" class="space-y-4">
            <div class="space-y-2">
              <label for="password" class="text-sm font-medium leading-none">New Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your new password (min. 8 characters)"
                v-model="password"
                required
                :disabled="isLoading"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div class="space-y-2">
              <label for="confirmPassword" class="text-sm font-medium leading-none"
                >Confirm New Password</label
              >
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                v-model="confirmPassword"
                required
                :disabled="isLoading"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <!-- Password Requirements -->
            <div class="text-xs text-gray-500 space-y-1">
              <p>Password requirements:</p>
              <ul class="list-disc list-inside space-y-1 ml-2">
                <li :class="{ 'text-green-600': password.length >= 8 }">At least 8 characters</li>
                <li
                  :class="{ 'text-green-600': password === confirmPassword && password.length > 0 }"
                >
                  Passwords match
                </li>
              </ul>
            </div>

            <button
              type="submit"
              :disabled="isLoading || !isFormValid"
              class="w-full h-10 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isLoading ? 'Resetting...' : 'Reset Password' }}
            </button>
          </form>
        </div>

        <!-- Success State -->
        <div v-else-if="passwordReset" class="text-center py-8">
          <div
            class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FontAwesomeIcon icon="check-circle" class="w-6 h-6 text-green-600" />
          </div>
          <h3 class="text-lg font-medium text-green-600 mb-2">Password Reset Successfully!</h3>
          <p class="text-gray-600 mb-4">
            Your password has been reset. You can now login with your new password.
          </p>
          <router-link
            to="/login"
            class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
          >
            Back to Login
          </router-link>
        </div>

        <!-- Back to Login -->
        <div v-if="!passwordReset" class="mt-4 text-center text-sm">
          Remember your password?
          <router-link to="/login" class="text-blue-600 hover:underline ml-1">
            Back to login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { verifyResetToken, resetPassword } from '../../service/authService'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// State
const isVerifying = ref(true)
const isValidToken = ref(false)
const isLoading = ref(false)
const passwordReset = ref(false)

// Form data
const password = ref('')
const confirmPassword = ref('')

// User info from token verification
const userInfo = ref({
  email: '',
  org_name: '',
})

// Message display state
const showErrorMessage = ref(false)
const showSuccessMessage = ref(false)

// Message content
const currentErrorMessage = ref('')
const currentSuccessMessage = ref('')

// Timer state
const errorCountdown = ref(15)
let errorTimer: NodeJS.Timeout | null = null
let errorCountdownTimer: NodeJS.Timeout | null = null
let successTimer: NodeJS.Timeout | null = null

// Token from URL
const accessToken = ref('')

// Computed
const isFormValid = computed(() => {
  return password.value.length >= 8 && password.value === confirmPassword.value && !isLoading.value
})

// Error display function (15 seconds)
const displayError = (message: string) => {
  console.log('Displaying error for 15 seconds:', message)

  // Clear any existing error timers first
  clearErrorTimers()

  // Set error message and show it
  currentErrorMessage.value = message
  showErrorMessage.value = true
  errorCountdown.value = 15

  // Start countdown timer (updates every second)
  errorCountdownTimer = setInterval(() => {
    errorCountdown.value--
    console.log('Error countdown:', errorCountdown.value)

    if (errorCountdown.value <= 0) {
      clearErrorTimers()
    }
  }, 1000)

  // Main timer to clear error after exactly 15 seconds
  errorTimer = setTimeout(() => {
    console.log('Clearing error after 15 seconds')
    clearErrorTimers()
  }, 15000)

  // Force Vue to update the DOM
  nextTick(() => {
    console.log('DOM updated with error message')
  })
}

// Clear all error timers and reset error state
const clearErrorTimers = () => {
  if (errorTimer) {
    clearTimeout(errorTimer)
    errorTimer = null
  }
  if (errorCountdownTimer) {
    clearInterval(errorCountdownTimer)
    errorCountdownTimer = null
  }

  showErrorMessage.value = false
  currentErrorMessage.value = ''
  errorCountdown.value = 15
}

// Success message display (shorter duration)
const displaySuccess = (message: string) => {
  console.log('Displaying success message:', message)

  // Clear existing success timer
  if (successTimer) {
    clearTimeout(successTimer)
  }

  currentSuccessMessage.value = message
  showSuccessMessage.value = true

  successTimer = setTimeout(() => {
    showSuccessMessage.value = false
    currentSuccessMessage.value = ''
  }, 5000) // 5 seconds for success messages
}

// Methods
const extractTokenFromUrl = () => {
  // Get token from URL fragments (Supabase format)
  const urlParams = new URLSearchParams(window.location.hash.substring(1))
  const tokenFromHash = urlParams.get('access_token')

  // Also check query parameters
  const queryParams = new URLSearchParams(window.location.search)
  const tokenFromQuery = queryParams.get('access_token')

  return tokenFromHash || tokenFromQuery || ''
}

const verifyToken = async () => {
  try {
    console.log('Verifying reset token...')

    if (!accessToken.value) {
      throw new Error('No reset token found in URL')
    }

    const result = await verifyResetToken(accessToken.value)

    if (result.success && result.user) {
      isValidToken.value = true
      userInfo.value = result.user
      console.log('Token verified successfully for:', result.user.email)
    } else {
      isValidToken.value = false
      console.error('Token verification failed:', result.message)
    }
  } catch (error) {
    console.error('Token verification error:', error)
    isValidToken.value = false
  } finally {
    isVerifying.value = false
  }
}

const handleResetPassword = async () => {
  try {
    isLoading.value = true

    // Clear any existing messages first
    clearErrorTimers()
    showSuccessMessage.value = false

    // Validation
    if (password.value.length < 8) {
      displayError('Password must be at least 8 characters long')
      return
    }

    if (password.value !== confirmPassword.value) {
      displayError('Passwords do not match')
      return
    }

    console.log('Attempting to reset password...')

    const result = await resetPassword(accessToken.value, password.value)

    console.log('Reset password response:', result)

    if (result.success) {
      passwordReset.value = true
      displaySuccess(result.message || 'Password reset successfully!')
    } else {
      displayError(result.message)
    }
  } catch (error) {
    console.error('Reset password error:', error)
    if (error instanceof Error) {
      displayError(error.message)
    } else {
      displayError('An unknown error occurred.')
    }
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  console.log('Reset password component mounted')
  console.log('Current URL:', window.location.href)

  // Extract token from URL
  accessToken.value = extractTokenFromUrl()
  console.log('Extracted token:', accessToken.value ? 'Present' : 'Missing')

  if (!accessToken.value) {
    console.error('No access token found in URL')
    isValidToken.value = false
    isVerifying.value = false
    return
  }

  // Verify the token
  await verifyToken()
})

onUnmounted(() => {
  console.log('Cleaning up all timers on component unmount')
  clearErrorTimers()

  if (successTimer) {
    clearTimeout(successTimer)
  }
})
</script>
