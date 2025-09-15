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
        <div v-else-if="success" class="space-y-4">
          <div
            class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FontAwesomeIcon icon="check-circle" class="w-6 h-6 text-green-600" />
          </div>
          <h2 class="text-xl font-semibold text-green-600">Email Verified!</h2>
          <p class="text-gray-600">
            Your member account has been successfully verified.
          </p>
          <div class="mt-4">
            <div class="text-center">
              <p class="text-green-600 font-semibold mb-4">
                Your account is now ready to use!
              </p>
              <p class="text-gray-600 text-sm mb-6">
                Please log in to access your member portal and start using Membella.
              </p>
            </div>

            <button
              @click="goToLogin"
              class="w-full h-10 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              <FontAwesomeIcon icon="sign-in-alt" class="w-4 h-4 mr-2" />
              Go to Login
            </button>
          </div>
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
          </div>
          <div class="space-y-2">
            <button
              @click="retryVerification"
              v-if="canRetry"
              class="w-full h-10 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Try Again
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
import { useAuthStore } from '../../stores/auth'
import { memberApi } from '../../api/member'
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
  console.log('Member Auth Callback Error:', message)

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

const processAuthCallback = async () => {
  try {
    console.log('Starting member auth callback processing')
    console.log('Current URL:', window.location.href)
    console.log('Route query:', route.query)
    console.log('Window location search:', window.location.search)
    console.log('Window location hash:', window.location.hash)
    console.log('Initial state:', {
      isProcessing: isProcessing.value,
      success: success.value,
      showErrorMessage: showErrorMessage.value
    })

    // Prevent any redirects during auth callback processing
    console.log('Member auth callback page - preventing redirects')

    // Check if we have URL parameters for auth (both query and hash)
    const urlParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))

    // Get tokens from query parameters first, then hash parameters
    const accessToken = urlParams.get('access_token') || hashParams.get('access_token')
    const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token')
    const type = urlParams.get('type') || hashParams.get('type')

    console.log('Member URL tokens found:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      type,
      fromQuery: !!urlParams.get('access_token'),
      fromHash: !!hashParams.get('access_token'),
      accessToken: accessToken ? accessToken.substring(0, 20) + '...' : null,
      refreshToken: refreshToken ? refreshToken.substring(0, 20) + '...' : null,
    })

    if (accessToken && refreshToken) {
      // This is a URL-based callback (email verification link)
      console.log('Processing member email verification callback')

      try {
        console.log('Calling member backend auth callback...')
        console.log('Request data:', {
          access_token: accessToken ? accessToken.substring(0, 20) + '...' : 'Missing',
          refresh_token: refreshToken ? refreshToken.substring(0, 20) + '...' : 'Missing',
          type: type || 'signup'
        })

        const response = await memberApi.handleAuthCallback(accessToken, refreshToken)

        console.log('Member backend callback successful:', response)

        if (response.success && response.token && response.user) {
          // Store auth data
          authStore.setAuth(response.token, response.user)
          success.value = true
          console.log('✅ Member email verification successful!')
          // ไม่ auto redirect ให้ user กดปุ่มเอง
        } else {
          console.error('Member backend response missing required data:', response)
          displayError('Backend did not return member authentication data')
          return
        }
      } catch (backendError) {
        console.error('Member backend callback failed:', backendError)
        displayError('Member email verification failed on backend')
        return
      }
    } else {
      // No tokens found in URL - check if user is already verified
      console.log('No tokens found in URL parameters - checking if user is already verified')

      // Check if user is already verified and authenticated
      if (authStore.isAuthenticated) {
        console.log('✅ Member is already verified and authenticated')
        success.value = true
        return
      }

      console.log('No tokens found in URL parameters')
      console.log('This usually means:')
      console.log('1. The email verification link is not properly formatted')
      console.log('2. Supabase redirect URL is not configured correctly')
      console.log('3. The verification link has expired or been used already')

      // Show more helpful error message
      displayError(
        'Email verification link is invalid or expired. Please try registering again or contact support.',
      )
      return
    }
  } catch (err) {
    console.error('Member auth callback error:', err)
    console.error('Error details:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      success: success.value,
      isProcessing: isProcessing.value
    })
    const errorMessage = err instanceof Error ? err.message : 'Member authentication failed'
    displayError(errorMessage)
  } finally {
    isProcessing.value = false
  }
}

// Redirect functions removed - user will stay on this page

const retryVerification = () => {
  isProcessing.value = true
  success.value = false

  // Clear error state when retrying
  clearErrorState()

  processAuthCallback()
}

const goToLogin = () => {
  console.log('Redirecting to member login page...')
  router.push('/login')
}

onMounted(() => {
  // Add a small delay to let the URL parameters settle
  setTimeout(() => {
    processAuthCallback()
  }, 500)
})

onUnmounted(() => {
  console.log('Cleaning up member auth callback')
  clearErrorState()
})
</script>
