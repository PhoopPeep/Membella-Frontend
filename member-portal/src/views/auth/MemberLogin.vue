<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
  >
    <div class="w-full max-w-md bg-white rounded-lg border shadow-sm">
      <div class="p-6 space-y-1">
        <h2 class="text-2xl font-bold text-center">Member Login</h2>
        <p class="text-center text-gray-600">Access your subscription and benefits</p>
      </div>
      <div class="p-6 pt-0">
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

        <!-- Email Verification Required -->
        <div
          v-if="showVerificationRequired"
          class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md"
        >
          <div class="flex items-start">
            <FontAwesomeIcon
              icon="envelope"
              class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
            />
            <div class="flex-1">
              <h3 class="text-sm font-medium text-blue-800">Email Verification Required</h3>
              <p class="text-sm text-blue-600 mt-1">
                Please verify your email address before signing in. Check your inbox for a
                verification link.
              </p>
              <div class="mt-2 text-xs text-blue-600 space-y-1">
                <p>
                  • Check your <strong>spam/junk folder</strong> if you don't see it in your inbox
                </p>
                <p>• Look for an email from <code>noreply@mail.supabase.io</code></p>
                <p>• The email may take a few minutes to arrive</p>
                <p>• Click the verification link to activate your account</p>
              </div>
            </div>
          </div>
          <div class="mt-3 flex flex-col sm:flex-row gap-2">
            <button
              @click="handleResendVerification"
              :disabled="isResending || resendCooldown > 0"
              class="text-sm text-blue-600 hover:text-blue-700 underline disabled:opacity-50 disabled:no-underline"
            >
              {{
                isResending
                  ? 'Sending...'
                  : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend verification email'
              }}
            </button>
          </div>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium leading-none">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              v-model="email"
              required
              :disabled="isLoading"
              autocomplete="email"
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div class="space-y-2">
            <label for="password" class="text-sm font-medium leading-none">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              v-model="password"
              required
              :disabled="isLoading"
              autocomplete="current-password"
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full h-10 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>

        <div class="mt-4 text-center text-sm">
          Don't have an account?
          <router-link to="/register" class="text-blue-600 hover:underline ml-1">
            Create account
          </router-link>
        </div>

        <!-- Browse as Guest -->
        <div class="mt-4 text-center">
          <router-link to="/browse" class="text-sm text-gray-500 hover:text-gray-700 underline">
            Browse plans as guest
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { memberApi } from '../../api/member'

const router = useRouter()
const authStore = useAuthStore()

// Form state
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const isResending = ref(false)
const resendCooldown = ref(0)

// Message display state
const showErrorMessage = ref(false)
const showSuccessMessage = ref(false)
const showRateLimited = ref(false)
const showVerificationRequired = ref(false)

// Message content
const currentErrorMessage = ref('')
const currentSuccessMessage = ref('')

// Timer state - using number instead of NodeJS.Timeout for browser compatibility
const errorCountdown = ref(15)
let errorTimer: number | null = null
let errorCountdownTimer: number | null = null
let successTimer: number | null = null
let resendTimer: number | null = null

// Login handler
const handleLogin = async () => {
  if (isLoading.value) {
    return
  }

  try {
    isLoading.value = true

    // Clear any existing messages first
    clearErrorTimers()
    showSuccessMessage.value = false

    if (!email.value.trim() || !password.value.trim()) {
      displayError('Please enter both email and password')
      return
    }

    console.log('Attempting member login for:', email.value)

    const result = await memberApi.login(email.value.trim(), password.value)

    console.log('Member login response:', result)

    if (result.requiresVerification) {
      showVerificationRequired.value = true
      displayError(result.message)
      startResendCooldown()
    } else if (result.rateLimited) {
      showRateLimited.value = true
      displayError(result.message)
    } else if (result.success) {
      displaySuccess(result.message || 'Login successful!')

      // Store auth data if login includes token and user
      if (result.token && result.user) {
        authStore.setAuth(result.token, result.user)

        // Redirect to browse plans after a short delay
        setTimeout(() => {
          router.push('/browse')
        }, 1000)
      } else {
        displayError('Login response missing authentication data')
      }
    } else {
      displayError(result.message)
    }
  } catch (error) {
    console.error('Member login error:', error)
    if (error instanceof Error) {
      if (error.message.includes('verify') || error.message.includes('verification')) {
        showVerificationRequired.value = true
      } else if (error.message.includes('rate limit') || error.message.includes('Too many')) {
        showRateLimited.value = true
      }
      displayError(error.message)
    } else {
      displayError('An unknown error occurred during login.')
    }
  } finally {
    isLoading.value = false
  }
}

// Error display function (15 seconds)
const displayError = (message: string) => {
  clearErrorTimers()
  currentErrorMessage.value = message
  showErrorMessage.value = true
  errorCountdown.value = 15

  errorCountdownTimer = window.setInterval(() => {
    errorCountdown.value--
    if (errorCountdown.value <= 0) {
      clearErrorTimers()
    }
  }, 1000)

  errorTimer = window.setTimeout(() => {
    clearErrorTimers()
  }, 15000)

  nextTick(() => {
    console.log('DOM updated with error message')
  })
}

// Clear all error timers and reset error state
const clearErrorTimers = () => {
  if (errorTimer) {
    window.clearTimeout(errorTimer)
    errorTimer = null
  }
  if (errorCountdownTimer) {
    window.clearInterval(errorCountdownTimer)
    errorCountdownTimer = null
  }

  showErrorMessage.value = false
  currentErrorMessage.value = ''
  showRateLimited.value = false
  showVerificationRequired.value = false
  errorCountdown.value = 15
}

// Success message display
const displaySuccess = (message: string) => {
  if (successTimer) {
    window.clearTimeout(successTimer)
  }

  currentSuccessMessage.value = message
  showSuccessMessage.value = true

  successTimer = window.setTimeout(() => {
    showSuccessMessage.value = false
    currentSuccessMessage.value = ''
  }, 5000)
}

const handleResendVerification = async () => {
  try {
    isResending.value = true
    clearErrorTimers()

    if (!email.value.trim()) {
      displayError('Please enter your email address first')
      return
    }

    console.log('Resending member verification to:', email.value)

    const result = await memberApi.resendVerification(email.value.trim())

    if (result.rateLimited) {
      showRateLimited.value = true
      displayError(result.message)
    } else {
      displaySuccess(result.message)
      startResendCooldown()
    }
  } catch (error) {
    console.error('Resend verification error:', error)
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('Too many')) {
        showRateLimited.value = true
      }
      displayError(error.message)
    } else {
      displayError('Failed to resend verification email')
    }
  } finally {
    isResending.value = false
  }
}

const startResendCooldown = () => {
  resendCooldown.value = 60
  resendTimer = window.setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      if (resendTimer) {
        window.clearInterval(resendTimer)
        resendTimer = null
      }
    }
  }, 1000)
}

onUnmounted(() => {
  clearErrorTimers()
  if (successTimer) {
    window.clearTimeout(successTimer)
  }
  if (resendTimer) {
    window.clearInterval(resendTimer)
  }
})
</script>
