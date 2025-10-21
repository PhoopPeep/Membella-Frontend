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
import { useRouter } from 'vue-router'
import { useAuthStore, type MemberUser } from '../../stores/auth'
import { memberApi } from '../../api/member'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const router = useRouter()
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

// Extract tokens from URL
interface MemberAuthTokens {
  accessToken: string | null
  refreshToken: string | null
  type: string | null
}

const extractMemberTokensFromURL = (): MemberAuthTokens => {
  const urlParams = new URLSearchParams(globalThis.location.search)
  const hashParams = new URLSearchParams(globalThis.location.hash.substring(1))

  return {
    accessToken: urlParams.get('access_token') || hashParams.get('access_token'),
    refreshToken: urlParams.get('refresh_token') || hashParams.get('refresh_token'),
    type: urlParams.get('type') || hashParams.get('type')
  }
}

// Call member backend auth
const callMemberBackendAuth = async (
  accessToken: string,
  refreshToken: string
): Promise<MemberAuthResponse> => {
  console.log('Calling member backend auth callback...')

  const response = await memberApi.handleAuthCallback(accessToken, refreshToken)
  console.log('Member backend callback successful:', response)

  return response as MemberAuthResponse
}

// Member backend auth response interface
interface MemberAuthResponse {
  success: boolean
  token: string
  user: MemberUser
}

// Validate member backend response
const validateMemberResponse = (response: MemberAuthResponse): boolean => {
  if (!response.success || !response.token || !response.user) {
    console.error('Member backend response missing required data:', response)
    return false
  }
  return true
}

// Handle member URL-based callback
const handleMemberURLCallback = async (tokens: MemberAuthTokens) => {
  const { accessToken, refreshToken } = tokens

  if (!accessToken || !refreshToken) {
    return false
  }

  console.log('Processing member email verification callback')

  try {
    const response = await callMemberBackendAuth(accessToken, refreshToken)

    if (!validateMemberResponse(response)) {
      displayError('Backend did not return member authentication data')
      return true
    }

    // Store auth data and mark success
    authStore.setAuth(response.token, response.user)
    success.value = true
    console.log('Member email verification successful!')
    return true

  } catch (backendError) {
    console.error('Member backend callback failed:', backendError)
    displayError('Member email verification failed on backend')
    return true
  }
}

// Handle member already authenticated
const handleMemberAlreadyAuth = () => {
  console.log('No tokens found in URL parameters - checking if user is already verified')

  if (authStore.isAuthenticated) {
    console.log('Member is already verified and authenticated')
    success.value = true
    return
  }

  console.log('No tokens found in URL parameters')
  displayError(
    'Email verification link is invalid or expired. Please try registering again or contact support.'
  )
}

// Main member auth callback processing
const processAuthCallback = async () => {
  try {
    console.log('Starting member auth callback processing')
    console.log('Current URL:', globalThis.location.href)

    // Extract tokens from URL
    const tokens = extractMemberTokensFromURL()

    console.log('Member URL tokens found:', {
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
      type: tokens.type
    })

    // Try URL-based callback first
    const handled = await handleMemberURLCallback(tokens)

    if (!handled) {
      // If no URL tokens, check if already authenticated
      handleMemberAlreadyAuth()
    }

  } catch (err) {
    console.error('Member auth callback error:', err)
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
