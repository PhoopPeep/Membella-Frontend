<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/20 p-4 relative"
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
        <h2 class="text-3xl font-bold text-primary-700 mb-2">Email Verification</h2>
        <p class="text-primary-600">Confirming your email address and activating your account</p>
      </div>

      <div class="p-8">
        <div v-if="isProcessing" class="text-center py-8">
          <div class="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FontAwesomeIcon icon="spinner" class="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 class="text-xl font-bold text-primary-700 mb-3">Verifying Your Email</h3>
          <p class="text-primary-600 mb-6 leading-relaxed">
            Please wait while we confirm your email address and activate your account.
          </p>
          <div class="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4 border border-primary-200">
            <div class="flex items-center justify-center space-x-3 text-primary-700">
              <FontAwesomeIcon icon="envelope" class="w-5 h-5" />
              <span class="text-sm font-semibold">Processing email verification...</span>
            </div>
          </div>
        </div>

        <div v-else-if="showErrorMessage" class="text-center py-8">
          <div class="w-20 h-20 bg-gradient-to-r from-error-500 to-error-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FontAwesomeIcon icon="exclamation-triangle" class="w-10 h-10 text-white" />
          </div>
          <h3 class="text-3xl font-bold text-error-700 mb-4">Email Verification Failed</h3>
          <p class="text-error-600 mb-6 leading-relaxed text-lg">{{ currentErrorMessage }}</p>

          <div class="bg-gradient-to-r from-error-50 to-error-100 rounded-xl p-6 mb-8 border-2 border-error-200">
            <div class="flex items-center justify-center space-x-3 text-error-700">
              <FontAwesomeIcon icon="times-circle" class="w-6 h-6" />
              <span class="text-lg font-semibold">Account Status: Not Verified</span>
            </div>
          </div>

          <div class="space-y-4">
            <button
              @click="retryVerification"
              v-if="canRetry"
              class="w-full px-6 py-3 bg-white border-2 border-primary-200 text-primary-700 rounded-xl font-semibold text-base hover:bg-primary-50 hover:border-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all duration-200 flex items-center justify-center"
            >
              <FontAwesomeIcon icon="refresh" class="w-5 h-5 mr-2" />
              Try Again
            </button>
          </div>
        </div>

        <div v-else-if="success" class="text-center py-8">
          <div class="w-16 h-16 bg-gradient-to-r from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FontAwesomeIcon icon="check-circle" class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-2xl font-bold text-success-700 mb-3">Email Verified Successfully!</h3>
          <p class="text-success-600 mb-6 leading-relaxed">
            Your email has been confirmed and your account is now active. You can now access all features of Membella.
          </p>

          <div class="bg-gradient-to-r from-success-50 to-success-100 rounded-xl p-4 mb-8 border border-success-200">
            <div class="flex items-center justify-center space-x-3 text-success-700">
              <FontAwesomeIcon icon="check" class="w-5 h-5" />
              <span class="text-sm font-semibold">Account Status: Active</span>
            </div>
          </div>

          <div class="space-y-4">
            <div class="text-center">
              <p class="text-success-600 font-semibold mb-4">
                Your account is now ready to use!
              </p>
              <p class="text-gray-600 text-sm mb-6">
                Please log in to access your dashboard and start using Membella.
              </p>
            </div>

            <button
              @click="goToLogin"
              class="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold text-base hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-200 transition-all duration-200 flex items-center justify-center shadow-lg"
            >
              <FontAwesomeIcon icon="sign-in-alt" class="w-5 h-5 mr-2" />
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth'
import api from '../../router/api'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

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

// Error display function
const displayError = (message: string) => {
  console.log('Auth Callback Error:', message)

  // Set error message and show it
  currentErrorMessage.value = message
  showErrorMessage.value = true
  canRetry.value = true
}

// Clear error state
const clearErrorState = () => {
  showErrorMessage.value = false
  currentErrorMessage.value = ''
  canRetry.value = false
}

// Extract tokens from URL
interface AuthTokens {
  accessToken: string | null
  refreshToken: string | null
  type: string | null
}

const extractTokensFromURL = (): AuthTokens => {
  const urlParams = new URLSearchParams(globalThis.location.search)
  const hashParams = new URLSearchParams(globalThis.location.hash.substring(1))

  return {
    accessToken: urlParams.get('access_token') || hashParams.get('access_token'),
    refreshToken: urlParams.get('refresh_token') || hashParams.get('refresh_token'),
    type: urlParams.get('type') || hashParams.get('type')
  }
}

// Set session in Supabase
const setSupabaseSession = async (accessToken: string, refreshToken: string) => {
  const { data: { session }, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (error) {
    console.error('Failed to set session:', error)
    throw new Error('Failed to verify email: ' + error.message)
  }

  if (!session?.user) {
    console.error('No valid session created from email verification')
    throw new Error('No valid session created from email verification')
  }

  console.log('Session set successfully:', session.user.id)
  return session
}

// Call backend auth callback
const callBackendAuth = async (accessToken: string, refreshToken: string, type: string) => {
  console.log('Calling backend auth callback...')

  const response = await api.post('/api/auth/callback', {
    access_token: accessToken,
    refresh_token: refreshToken,
    type: type || 'signup',
  })

  console.log('Backend callback successful:', response.data)
  return response.data
}

// Validate backend response
const validateBackendResponse = (responseData: any): boolean => {
  if (!responseData.success || !responseData.token || !responseData.user) {
    console.error('Backend response missing required data:', responseData)
    return false
  }
  return true
}

// Handle URL-based callback
const handleURLBasedCallback = async (tokens: AuthTokens) => {
  const { accessToken, refreshToken, type } = tokens

  if (!accessToken || !refreshToken) {
    return false
  }

  console.log('Processing email verification callback')

  // Set the session in Supabase
  await setSupabaseSession(accessToken, refreshToken)

  try {
    // Call backend
    const responseData = await callBackendAuth(accessToken, refreshToken, type || 'signup')

    if (!validateBackendResponse(responseData)) {
      displayError('Backend did not return authentication data')
      return true
    }

    // Store auth data and mark success
    authStore.setAuth(responseData.token, responseData.user)
    success.value = true
    console.log('Email verification successful!')
    return true

  } catch (backendError: any) {
    console.error('Backend callback failed:', backendError)
    displayError('Email verification failed. Please try logging in again.')
    return true
  }
}

// Handle existing session check
const handleExistingSession = async () => {
  console.log('Checking for existing session...')

  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Session error:', error)
    displayError('Session error: ' + error.message)
    return
  }

  if (!session?.user) {
    displayError('No valid authentication session found. Please try logging in again.')
    return
  }

  // Check if already verified and authenticated
  if (session.user.email_confirmed_at && authStore.isAuthenticated) {
    console.log('User is already verified and authenticated')
    success.value = true
    return
  }

  console.log('User session found but not verified or not authenticated')
  displayError('No verification tokens found. Please use the verification link from your email.')
}

// Main processing function
const processAuthCallback = async () => {
  try {
    console.log('Starting auth callback processing')
    console.log('Current URL:', globalThis.location.href)

    // Extract tokens from URL
    const tokens = extractTokensFromURL()

    console.log('URL tokens found:', {
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
      type: tokens.type
    })

    // Try URL-based callback first
    const handled = await handleURLBasedCallback(tokens)

    if (!handled) {
      // If no URL tokens, check for existing session
      await handleExistingSession()
    }

  } catch (err) {
    console.error('Auth callback error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
    displayError(errorMessage)
  } finally {
    isProcessing.value = false
  }
}

// handleDirectAuth function removed - we only use backend callback now

// Redirect functions removed - user will stay on this page

const retryVerification = () => {
  isProcessing.value = true
  success.value = false

  // Clear error state when retrying
  clearErrorState()

  processAuthCallback()
}

const goToLogin = () => {
  console.log('Redirecting to login page...')
  router.push('/login')
}

onMounted(() => {
  // Add a small delay to let the URL parameters settle
  setTimeout(() => {
    processAuthCallback()
  }, 500)
})

onUnmounted(() => {
  console.log('Cleaning up auth callback')
  clearErrorState()
})
</script>
