<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
  >
    <div class="w-full max-w-md bg-white rounded-lg border shadow-sm">
      <div class="p-6 text-center">
        <div v-if="isProcessing" class="space-y-4">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
          ></div>
          <h2 class="text-xl font-semibold">Verifying your email...</h2>
          <p class="text-gray-600">Please wait while we confirm your member account.</p>
        </div>

        <div v-else-if="showErrorMessage" class="space-y-4">
          <div
            class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FontAwesomeIcon icon="exclamation-circle" class="w-6 h-6 text-red-600" />
          </div>
          <h2 class="text-xl font-semibold text-red-600">Verification Failed</h2>
          <div class="text-center">
            <p class="text-gray-600 mb-2">{{ currentErrorMessage }}</p>
            <small class="text-xs text-red-500">
              This message will disappear in {{ errorCountdown }} seconds
            </small>
          </div>
          <div class="space-y-2">
            <button
              @click="redirectToLogin"
              class="w-full h-10 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Back to Login
            </button>
            <button
              @click="retryVerification"
              v-if="canRetry"
              class="w-full h-10 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>

        <div v-else-if="success" class="space-y-4">
          <div
            class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FontAwesomeIcon icon="check-circle" class="w-6 h-6 text-green-600" />
          </div>
          <h2 class="text-xl font-semibold text-green-600">Email Verified!</h2>
          <p class="text-gray-600">
            Your member account has been successfully verified. You're being redirected to browse
            plans...
          </p>
          <div class="mt-4">
            <button
              @click="redirectToBrowse"
              class="w-full h-10 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Browse Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import { memberApi } from '../../../api/member'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Component state
const isProcessing = ref(true)
const success = ref(false)
const canRetry = ref(false)

// Error display state
const showErrorMessage = ref(false)
const currentErrorMessage = ref('')
const errorCountdown = ref(15)

// Timer management
let errorTimer: NodeJS.Timeout | null = null
let errorCountdownTimer: NodeJS.Timeout | null = null

// Robust error display function that GUARANTEES 15 seconds
const displayError = (message: string) => {
  console.log('Member Auth Callback Error - Displaying for 15 seconds:', message)

  // Clear any existing error timers first
  clearErrorTimers()

  // Set error message and show it
  currentErrorMessage.value = message
  showErrorMessage.value = true
  canRetry.value = true
  errorCountdown.value = 15

  // Start countdown timer (updates every second)
  errorCountdownTimer = setInterval(() => {
    errorCountdown.value--
    console.log('Member Auth Error countdown:', errorCountdown.value)

    if (errorCountdown.value <= 0) {
      clearErrorTimers()
    }
  }, 1000)

  // Main timer to clear error after exactly 15 seconds
  errorTimer = setTimeout(() => {
    console.log('Clearing member auth error after 15 seconds')
    clearErrorTimers()
  }, 15000)

  // Force Vue to update the DOM
  nextTick(() => {
    console.log('DOM updated with member auth error message')
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
  canRetry.value = false
  errorCountdown.value = 15
}

const processAuthCallback = async () => {
  try {
    console.log('Starting member auth callback processing')
    console.log('Current URL:', window.location.href)
    console.log('Route query:', route.query)

    // Check if we have URL parameters for auth
    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get('access_token')
    const refreshToken = urlParams.get('refresh_token')
    const type = urlParams.get('type')

    console.log('Member URL tokens found:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      type,
    })

    if (accessToken && refreshToken) {
      // This is a URL-based callback (email verification link)
      console.log('Processing member email verification callback')

      try {
        console.log('Calling member backend auth callback...')
        const response = await memberApi.handleAuthCallback(accessToken, refreshToken)

        console.log('Member backend callback successful:', response)

        if (response.success && response.token && response.user) {
          // Store auth data
          authStore.setAuth(response.token, response.user)
          success.value = true

          // Redirect to browse plans after a short delay
          setTimeout(() => {
            redirectToBrowse()
          }, 2000)
        } else {
          throw new Error('Backend did not return member authentication data')
        }
      } catch (backendError) {
        console.error('Member backend callback failed:', backendError)
        throw new Error('Member email verification failed on backend')
      }
    } else {
      throw new Error('No valid member authentication session found. Please try logging in again.')
    }
  } catch (err) {
    console.error('Member auth callback error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Member authentication failed'
    displayError(errorMessage)
  } finally {
    isProcessing.value = false
  }
}

const redirectToLogin = () => {
  router.push('/login')
}

const redirectToBrowse = () => {
  router.push('/browse')
}

const retryVerification = () => {
  isProcessing.value = true
  success.value = false

  // Clear error timers when retrying
  clearErrorTimers()

  processAuthCallback()
}

onMounted(() => {
  // Add a small delay to let the URL parameters settle
  setTimeout(() => {
    processAuthCallback()
  }, 500)
})

onUnmounted(() => {
  console.log('Cleaning up member auth callback timers')
  clearErrorTimers()
})
</script>
