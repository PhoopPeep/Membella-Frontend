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

          <!-- Rate Limited Message -->
          <div
            v-if="showRateLimited"
            class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md"
          >
            <div class="flex items-center">
              <FontAwesomeIcon icon="clock" class="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <h3 class="text-sm font-medium text-yellow-800">Too Many Attempts</h3>
                <p class="text-sm text-yellow-600 mt-1">Please wait before trying again.</p>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleResetPassword" class="space-y-4">
            <div class="space-y-2">
              <label for="password" class="text-sm font-medium leading-none">New Password</label>
              <div class="relative">
                <input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your new password"
                  v-model="password"
                  required
                  :disabled="isLoading"
                  class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  :disabled="isLoading"
                >
                  <FontAwesomeIcon :icon="showPassword ? 'eye-slash' : 'eye'" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <label for="confirmPassword" class="text-sm font-medium leading-none">Confirm New Password</label>
              <div class="relative">
                <input
                  id="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm your new password"
                  v-model="confirmPassword"
                  required
                  :disabled="isLoading"
                  class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                  :class="{ 'border-red-300': confirmPassword && !passwordsMatch }"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  :disabled="isLoading"
                >
                  <FontAwesomeIcon :icon="showConfirmPassword ? 'eye-slash' : 'eye'" class="w-4 h-4" />
                </button>
              </div>
              <div v-if="confirmPassword && !passwordsMatch" class="text-xs text-red-600">
                Passwords do not match
              </div>
            </div>

            <!-- Password Requirements -->
            <div class="text-xs text-gray-500 space-y-1">
              <p>Password must:</p>
              <ul class="ml-4 space-y-0.5">
                <li :class="passwordRequirements.length ? 'text-green-600' : 'text-gray-500'">
                  <FontAwesomeIcon :icon="passwordRequirements.length ? 'check' : 'times'" class="w-3 h-3 mr-1" />
                  Be at least 8 characters long
                </li>
              </ul>
            </div>

            <button
              type="submit"
              class="w-full h-10 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :disabled="isLoading || !isFormValid"
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
import { memberApi } from '../../api/member'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// State
const isVerifying = ref(true)
const isValidToken = ref(false)
const isLoading = ref(false)
const passwordReset = ref(false)

// Form data
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// User info from token verification
const userInfo = ref({
  email: '',
  fullName: '',
})

// Message display state
const showErrorMessage = ref(false)
const showSuccessMessage = ref(false)
const showRateLimited = ref(false)

// Message content
const currentErrorMessage = ref('')
const currentSuccessMessage = ref('')

// Timer state
const errorCountdown = ref(15)
let errorTimer: NodeJS.Timeout | null = null
let errorCountdownTimer: NodeJS.Timeout | null = null
let successTimer: NodeJS.Timeout | null = null

// Access token from URL
const accessToken = ref('')

// Computed properties
const passwordRequirements = computed(() => ({
  length: password.value.length >= 8
}))

const passwordsMatch = computed(() => {
  return password.value === confirmPassword.value
})

const isFormValid = computed(() => {
  return password.value &&
         confirmPassword.value &&
         passwordRequirements.value.length &&
         passwordsMatch.value
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
  showRateLimited.value = false
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

// Extract token from URL
const extractTokenFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('access_token') || urlParams.get('token')
}

// Verify token
const verifyToken = async () => {
  try {
    console.log('Verifying member reset token...')

    const result = await memberApi.verifyResetToken(accessToken.value)

    console.log('Token verification result:', result)

    if (result.success) {
      isValidToken.value = true
      userInfo.value = result.user || { email: '', fullName: '' }
    } else {
      isValidToken.value = false
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

    console.log('Attempting to reset member password...')

    const result = await memberApi.resetPassword(accessToken.value, password.value)

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
  console.log('Member reset password component mounted')
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
