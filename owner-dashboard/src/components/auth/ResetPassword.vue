<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/20 p-4"
  >
    <!-- Hero Header Section -->
    <div
      class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div
        class="absolute top-0 right-0 w-64 h-64 bg-secondary-400/20 rounded-full -translate-y-32 translate-x-32"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-48 h-48 bg-primary-300/20 rounded-full translate-y-24 -translate-x-24"
      ></div>
    </div>

    <div class="relative w-full max-w-md bg-white rounded-2xl border border-primary-200 shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-primary-50 to-secondary-50 p-8 text-center">
        <div class="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <FontAwesomeIcon icon="key" class="w-8 h-8 text-white" />
        </div>
        <h2 class="text-3xl font-bold text-primary-700 mb-2">Reset Password</h2>
        <p class="text-primary-600" v-if="userInfo.email">
          Reset password for <strong class="text-primary-900">{{ userInfo.email }}</strong>
        </p>
      </div>
      <div class="p-8">
        <!-- Loading State -->
        <div v-if="isVerifying" class="text-center py-12">
          <div class="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FontAwesomeIcon icon="spinner" class="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 class="text-xl font-bold text-primary-700 mb-2">Verifying Reset Link</h3>
          <p class="text-primary-600">Please wait while we verify your reset link...</p>
        </div>

        <!-- Invalid Token State -->
        <div v-else-if="!isValidToken" class="text-center py-12">
          <div class="w-16 h-16 bg-gradient-to-r from-error-500 to-error-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FontAwesomeIcon icon="exclamation-triangle" class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-xl font-bold text-error-700 mb-3">Invalid Reset Link</h3>
          <p class="text-error-600 mb-6 leading-relaxed">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <router-link
            to="/forgot-password"
            class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold text-base hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FontAwesomeIcon icon="arrow-left" class="w-5 h-5 mr-2" />
            Request New Reset Link
          </router-link>
        </div>

        <!-- Reset Form -->
        <div v-else-if="isValidToken && !passwordReset">
          <!-- Error Message -->
          <div v-if="showErrorMessage" class="mb-6 p-4 bg-gradient-to-r from-error-50 to-error-100 border border-error-200 rounded-xl">
            <div class="flex items-center space-x-3">
              <FontAwesomeIcon icon="exclamation-triangle" class="w-5 h-5 text-error-600" />
              <div class="flex-1">
                <p class="text-sm font-semibold text-error-700">{{ currentErrorMessage }}</p>
                <div class="mt-2">
                  <small class="text-xs text-error-500">
                    This message will disappear in {{ errorCountdown }} seconds
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div
            v-if="showSuccessMessage"
            class="mb-6 p-4 bg-gradient-to-r from-success-50 to-success-100 border border-success-200 rounded-xl"
          >
            <div class="flex items-center space-x-3">
              <FontAwesomeIcon icon="check-circle" class="w-5 h-5 text-success-600" />
              <p class="text-sm font-semibold text-success-700">{{ currentSuccessMessage }}</p>
            </div>
          </div>

          <form @submit.prevent="handleResetPassword" class="space-y-6">
            <div class="space-y-3">
              <label for="password" class="text-sm font-semibold text-primary-700 flex items-center">
                <FontAwesomeIcon icon="lock" class="w-4 h-4 mr-2 text-primary-500" />
                New Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your new password (min. 8 characters)"
                v-model="password"
                required
                :disabled="isLoading"
                class="w-full px-4 py-3 border border-primary-200 rounded-xl bg-white text-primary-700 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
              />
            </div>

            <div class="space-y-3">
              <label for="confirmPassword" class="text-sm font-semibold text-primary-700 flex items-center">
                <FontAwesomeIcon icon="shield-alt" class="w-4 h-4 mr-2 text-primary-500" />
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                v-model="confirmPassword"
                required
                :disabled="isLoading"
                class="w-full px-4 py-3 border border-primary-200 rounded-xl bg-white text-primary-700 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
              />
            </div>

            <!-- Password Requirements -->
            <div class="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4 border border-primary-200">
              <h4 class="text-sm font-semibold text-primary-700 mb-3 flex items-center">
                <FontAwesomeIcon icon="info-circle" class="w-4 h-4 mr-2 text-primary-500" />
                Password Requirements
              </h4>
              <div class="space-y-2">
                <div class="flex items-center space-x-2 text-sm" :class="{ 'text-success-600': password.length >= 8, 'text-primary-600': password.length < 8 }">
                  <FontAwesomeIcon :icon="password.length >= 8 ? 'check-circle' : 'circle'" class="w-4 h-4" />
                  <span>At least 8 characters</span>
                </div>
                <div class="flex items-center space-x-2 text-sm" :class="{ 'text-success-600': password === confirmPassword && password.length > 0, 'text-primary-600': password !== confirmPassword || password.length === 0 }">
                  <FontAwesomeIcon :icon="password === confirmPassword && password.length > 0 ? 'check-circle' : 'circle'" class="w-4 h-4" />
                  <span>Passwords match</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              :disabled="isLoading || !isFormValid"
              class="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold text-base hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center"
            >
              <FontAwesomeIcon v-if="isLoading" icon="spinner" class="w-5 h-5 mr-3 animate-spin" />
              <FontAwesomeIcon v-else icon="key" class="w-5 h-5 mr-3" />
              {{ isLoading ? 'Resetting...' : 'Reset Password' }}
            </button>
          </form>
        </div>

        <!-- Success State -->
        <div v-else-if="passwordReset" class="text-center py-12">
          <div class="w-16 h-16 bg-gradient-to-r from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FontAwesomeIcon icon="check-circle" class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-2xl font-bold text-success-700 mb-3">Password Reset Successfully!</h3>
          <p class="text-success-600 mb-8 leading-relaxed">
            Your password has been reset. You can now login with your new password.
          </p>
          <router-link
            to="/login"
            class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold text-base hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FontAwesomeIcon icon="sign-in-alt" class="w-5 h-5 mr-2" />
            Back to Login
          </router-link>
        </div>

        <!-- Back to Login -->
        <div v-if="!passwordReset" class="mt-8 text-center">
          <p class="text-primary-600 text-sm">
            Remember your password?
            <router-link to="/login" class="text-primary-700 font-semibold hover:text-primary-800 hover:underline ml-1 transition-colors duration-200">
              Back to login
            </router-link>
          </p>
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
  console.log('🔧 Extracting token from URL...')
  console.log('🔧 Full URL:', window.location.href)
  console.log('🔧 Current hash:', window.location.hash)
  console.log('🔧 Current search:', window.location.search)
  console.log('🔧 Current pathname:', window.location.pathname)

  // Check for Supabase errors first
  const hash = window.location.hash
  if (hash) {
    const hashParams = new URLSearchParams(hash.substring(1))
    const error = hashParams.get('error')
    const errorCode = hashParams.get('error_code')
    const errorDescription = hashParams.get('error_description')

    if (error) {
      console.log('🔧 Supabase Error detected:', {
        error,
        errorCode,
        errorDescription: errorDescription ? decodeURIComponent(errorDescription) : 'No description'
      })

      // Handle specific errors
      if (errorCode === 'otp_expired') {
        console.log('🔧 Email link has expired')
        return 'EXPIRED'
      } else if (error === 'access_denied') {
        console.log('🔧 Access denied - invalid link')
        return 'INVALID'
      }
    }
  }

  // Check URL hash first (Supabase sends tokens in hash for password reset)
  if (hash) {
    const hashParams = new URLSearchParams(hash.substring(1)) // Remove # from hash
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const type = hashParams.get('type')

    console.log('🔧 Hash params:', {
      access_token: accessToken ? 'Present' : 'Missing',
      refresh_token: refreshToken ? 'Present' : 'Missing',
      type: type || 'Missing'
    })

    if (accessToken) {
      console.log('🔧 Found access token in URL hash')
      return accessToken
    }
  }

  // Check URL search params as fallback
  const urlParams = new URLSearchParams(window.location.search)
  const accessToken = urlParams.get('access_token') || urlParams.get('token')
  if (accessToken) {
    console.log('🔧 Found access token in URL search params')
    return accessToken
  }

  console.log('❌ No access token found in URL')
  console.log('🔧 This means Supabase is not sending the token properly')
  console.log('🔧 Check Supabase Dashboard URL Configuration')
  return ''
}

const verifyToken = async () => {
  try {
    console.log('🔧 Verifying reset token...')

    if (!accessToken.value) {
      throw new Error('No reset token found in URL')
    }

    // Check if this is an email verification link (type=signup) or password reset link
    // Check both hash and search params for type
    let type = null

    // Check hash first (Supabase password reset uses hash)
    const hash = window.location.hash
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1))
      type = hashParams.get('type')
    }

    // Check search params as fallback
    if (!type) {
      const urlParams = new URLSearchParams(window.location.search)
      type = urlParams.get('type')
    }

    console.log('🔧 URL type parameter:', type)
    console.log('🔧 Hash params:', hash ? Object.fromEntries(new URLSearchParams(hash.substring(1)).entries()) : 'None')
    console.log('🔧 Search params:', Object.fromEntries(new URLSearchParams(window.location.search).entries()))

    // If this is an email verification link, redirect to auth callback
    if (type === 'signup') {
      console.log('🔧 This is an email verification link, redirecting to auth callback')
      window.location.href = `/auth/callback${window.location.search}${window.location.hash}`
      return
    }

    // This is a password reset link, verify the token
    console.log('🔧 This is a password reset link, verifying token...')
    const result = await verifyResetToken(accessToken.value)

    console.log('🔧 Token verification result:', result)

    if (result.success && result.user) {
      isValidToken.value = true
      userInfo.value = result.user
      console.log('✅ Token verified successfully for:', result.user.email)
    } else {
      isValidToken.value = false
      console.error('❌ Token verification failed:', result.message)
    }
  } catch (error) {
    console.error('❌ Token verification error:', error)
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
  console.log('🔧 Reset password component mounted')
  console.log('🔧 Current URL:', window.location.href)
  console.log('🔧 Current pathname:', window.location.pathname)
  console.log('🔧 Current search:', window.location.search)
  console.log('🔧 Current hash:', window.location.hash)

  // Extract token from URL
  accessToken.value = extractTokenFromUrl()
  console.log('🔧 Extracted token:', accessToken.value ? 'Present' : 'Missing')

  // Handle special error cases
  if (accessToken.value === 'EXPIRED') {
    console.log('🔧 Email link has expired')
    isValidToken.value = false
    isVerifying.value = false
    displayError('This password reset link has expired. Please request a new one.')
    return
  }

  if (accessToken.value === 'INVALID') {
    console.log('🔧 Invalid email link')
    isValidToken.value = false
    isVerifying.value = false
    displayError('This password reset link is invalid. Please request a new one.')
    return
  }

  if (!accessToken.value) {
    console.error('❌ No access token found in URL')
    console.log('🔧 This might be a direct access to reset-password page without token')
    console.log('🔧 User should access this page via email link')
    console.log('🔧 For testing, you can manually add token to URL like:')
    console.log('🔧 http://localhost:5173/reset-password#access_token=YOUR_TOKEN&type=recovery')
    isValidToken.value = false
    isVerifying.value = false
    return
  }

  // Verify the token
  console.log('🔧 Starting token verification...')
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
