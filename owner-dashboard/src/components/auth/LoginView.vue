<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 flex items-center justify-center p-4 relative overflow-hidden"
  >
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
    <div
      class="absolute top-0 right-0 w-96 h-96 bg-secondary-400/20 rounded-full -translate-y-48 translate-x-48"
    ></div>
    <div
      class="absolute bottom-0 left-0 w-64 h-64 bg-primary-300/20 rounded-full translate-y-32 -translate-x-32"
    ></div>
    <div class="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full"></div>

    <div class="relative z-10 w-full max-w-lg">
      <div
        class="bg-white/95 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
      >
        <!-- Header Section -->
        <div
          class="bg-gradient-to-r from-primary-500 to-secondary-500 px-8 py-10 text-center relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div class="relative z-10">
            <div
              class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <span class="text-white font-black text-3xl">M</span>
            </div>
            <h1 class="text-4xl font-black text-white mb-3 drop-shadow-lg">Welcome Back! 👋</h1>
            <p class="text-white/90 font-semibold text-lg">Access your Owner Dashboard</p>
          </div>
        </div>

        <div class="p-8 space-y-6">
          <!-- Error Message -->
          <div
            v-if="showErrorMessage"
            class="p-5 bg-gradient-to-r from-error-50 to-error-100 border border-error-200 rounded-2xl shadow-lg"
          >
            <div class="flex items-start">
              <div
                class="w-10 h-10 bg-gradient-to-r from-error-500 to-error-600 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0 shadow-md"
              >
                <FontAwesomeIcon icon="exclamation-triangle" class="w-5 h-5 text-white" />
              </div>
              <div class="flex-1">
                <p class="text-base font-bold text-error-800">{{ currentErrorMessage }}</p>
                <div class="mt-3">
                  <small
                    class="text-sm text-error-600 font-semibold bg-error-200/50 px-3 py-1 rounded-lg"
                  >
                    Disappears in {{ errorCountdown }}s
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div
            v-if="showSuccessMessage"
            class="p-5 bg-gradient-to-r from-success-50 to-success-100 border border-success-200 rounded-2xl shadow-lg"
          >
            <div class="flex items-center">
              <div
                class="w-10 h-10 bg-gradient-to-r from-success-500 to-success-600 rounded-2xl flex items-center justify-center mr-4 shadow-md"
              >
                <FontAwesomeIcon icon="check-circle" class="w-5 h-5 text-white" />
              </div>
              <p class="text-base font-bold text-success-800">{{ currentSuccessMessage }}</p>
            </div>
          </div>

          <!-- Rate Limited Message -->
          <div
            v-if="showRateLimited"
            class="p-5 bg-gradient-to-r from-warning-50 to-warning-100 border border-warning-200 rounded-2xl shadow-lg"
          >
            <div class="flex items-center">
              <div
                class="w-10 h-10 bg-gradient-to-r from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center mr-4 shadow-md"
              >
                <FontAwesomeIcon icon="clock" class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-base font-bold text-warning-800">Too Many Attempts</h3>
                <p class="text-sm text-warning-700 mt-1 font-semibold">
                  Please wait before trying again.
                </p>
              </div>
            </div>
          </div>

          <!-- Email Verification Required -->
          <div
            v-if="showVerificationRequired"
            class="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-xl"
          >
            <div class="flex items-start">
              <div
                class="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center mr-3 mt-0.5 flex-shrink-0"
              >
                <FontAwesomeIcon icon="envelope" class="w-4 h-4 text-primary-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-primary-800">Email Verification Required</h3>
                <p class="text-sm text-primary-700 mt-1 font-medium">
                  Please verify your email address before signing in. Check your inbox for a
                  verification link.
                </p>
                <div class="mt-3 text-xs text-primary-600 space-y-1 font-medium">
                  <p>
                    • Check your <strong>spam/junk folder</strong> if you don't see it in your inbox
                  </p>
                  <p>
                    • Look for an email from
                    <code class="bg-primary-100 px-1 rounded">noreply@mail.supabase.io</code>
                  </p>
                  <p>• The email may take a few minutes to arrive</p>
                  <p>• Click the verification link to activate your account</p>
                </div>
              </div>
            </div>
            <div class="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                @click="handleResendVerification"
                :disabled="isResending || resendCooldown > 0"
                class="text-sm text-primary-600 hover:text-primary-700 font-semibold underline disabled:opacity-50 disabled:no-underline transition-colors"
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
          <form
            ref="loginFormRef"
            @submit.prevent="handleLogin"
            @keydown.enter.prevent="handleLogin"
            method="post"
            action="#"
            class="space-y-6"
          >
            <div class="space-y-4">
              <div>
                <label for="email" class="block text-base font-bold text-neutral-700 mb-3"
                  >📧 Email Address</label
                >
                <div class="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    v-model="email"
                    required
                    :disabled="isLoading"
                    autocomplete="email"
                    class="w-full h-14 px-5 py-4 text-base bg-white/90 border-2 border-primary-200 rounded-2xl placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-4">
                    <FontAwesomeIcon icon="envelope" class="w-5 h-5 text-neutral-400" />
                  </div>
                </div>
              </div>

              <div>
                <label for="password" class="block text-base font-bold text-neutral-700 mb-3"
                  >🔒 Password</label
                >
                <div class="relative">
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    v-model="password"
                    required
                    :disabled="isLoading"
                    autocomplete="current-password"
                    class="w-full h-14 px-5 py-4 text-base bg-white/90 border-2 border-primary-200 rounded-2xl placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-4">
                    <FontAwesomeIcon icon="lock" class="w-5 h-5 text-neutral-400" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Forgot Password Link -->
            <div class="text-center">
              <router-link
                to="/forgot-password"
                class="text-primary-600 hover:text-primary-700 font-bold text-base underline underline-offset-4 transition-all duration-300 hover:scale-105"
              >
                🔗 Forgot your password?
              </router-link>
            </div>

            <!-- Login Button -->
            <button
              type="button"
              @click.prevent="handleLogin"
              :disabled="isLoading"
              class="w-full h-16 px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-lg font-black rounded-2xl hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <div v-if="isLoading" class="flex items-center justify-center">
                <div
                  class="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent mr-3"
                ></div>
                <span class="text-lg">Logging In...</span>
              </div>
              <span v-else class="flex items-center justify-center">
                <FontAwesomeIcon icon="sign-in-alt" class="w-6 h-6 mr-3" />
                Sign In to Dashboard
              </span>
            </button>
          </form>

          <!-- Register Link -->
          <div class="text-center pt-6 border-t border-neutral-200">
            <p class="text-neutral-600 font-semibold text-base mb-3">New to Membella?</p>
            <router-link
              to="/register"
              class="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-primary-500 text-primary-600 font-bold rounded-2xl hover:bg-primary-50 hover:border-primary-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <FontAwesomeIcon icon="user-plus" class="w-5 h-5 mr-2" />
              Create New Account
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { login, resendVerification } from '../../service/authService'
import { useAuthStore } from '../../stores/auth'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const router = useRouter()
const authStore = useAuthStore()

// Form ref
const loginFormRef = ref<HTMLFormElement>()

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

// Timer state
const errorCountdown = ref(15)
let errorTimer: NodeJS.Timeout | null = null
let errorCountdownTimer: NodeJS.Timeout | null = null
let successTimer: NodeJS.Timeout | null = null
let resendTimer: NodeJS.Timeout | null = null

// Login handler
const handleLogin = async (event?: Event) => {
  // Prevent default form submission
  if (event) {
    event.preventDefault()
    event.stopPropagation()
    console.log('Event prevented:', event.type)
  }

  // Prevent duplicate requests
  if (isLoading.value) {
    console.log('Already loading, ignoring duplicate request')
    return
  }

  try {
    console.log('Starting login process...')
    isLoading.value = true

    // Clear any existing messages first
    clearErrorTimers()
    showSuccessMessage.value = false

    if (!email.value.trim() || !password.value.trim()) {
      displayError('Please enter both email and password')
      return
    }

    console.log('Attempting login for:', email.value)

    const result = await login({
      email: email.value.trim().toLowerCase(),
      password: password.value,
    })

    console.log('Login response:', result)

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

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          console.log('Redirecting to dashboard...')
          router.push('/dashboard')
        }, 1000)
      } else {
        displayError('Login response missing authentication data')
      }
    } else {
      displayError(result.message)
    }
  } catch (error) {
    console.error('Login error:', error)
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
    console.log('Login process completed')
  }
}

// Robust error display function that GUARANTEES 15 seconds
const displayError = (message: string) => {
  console.log('Displaying error for 15 seconds:', message)

  // Clear any existing error timers first
  clearErrorTimers()

  // Set error message and show it
  currentErrorMessage.value = message
  showErrorMessage.value = true
  errorCountdown.value = 15

  // Clear form fields when there's an error
  clearForm()

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

// Clear form fields
const clearForm = () => {
  email.value = ''
  password.value = ''
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
  showVerificationRequired.value = false
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

const handleResendVerification = async () => {
  try {
    isResending.value = true

    // Clear existing error messages
    clearErrorTimers()

    if (!email.value.trim()) {
      displayError('Please enter your email address first')
      return
    }

    console.log('Resending verification to:', email.value)

    const result = await resendVerification(email.value.trim().toLowerCase())

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
  resendCooldown.value = 60 // 60 seconds cooldown
  resendTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(resendTimer!)
      resendTimer = null
    }
  }, 1000)
}

onUnmounted(() => {
  console.log('Cleaning up all timers on component unmount')
  clearErrorTimers()

  if (successTimer) {
    clearTimeout(successTimer)
  }
  if (resendTimer) {
    clearInterval(resendTimer)
  }
})
</script>
