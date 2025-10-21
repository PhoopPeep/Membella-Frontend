<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/20 p-4"
  >
    <div
      class="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl border border-primary-200 shadow-strong"
    >
      <div class="p-8 space-y-2">
        <div class="text-center mb-6">
          <div
            class="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medium"
          >
            <span class="text-white font-bold text-2xl">M</span>
          </div>
          <h2 class="text-3xl font-bold text-neutral-800">Member Login</h2>
          <p class="text-neutral-600 font-medium mt-2">Access your subscription and benefits</p>
        </div>
        <div class="px-8 pb-8">
          <!-- Error Message -->
          <div
            v-if="showErrorMessage"
            class="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl"
          >
            <div class="flex items-start">
              <div
                class="w-8 h-8 bg-error-100 rounded-xl flex items-center justify-center mr-3 flex-shrink-0"
              >
                <FontAwesomeIcon icon="exclamation-triangle" class="w-4 h-4 text-error-600" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-error-800">{{ currentErrorMessage }}</p>
                <div class="mt-2">
                  <small class="text-xs text-error-600 font-medium">
                    This message will disappear in {{ errorCountdown }} seconds
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div
            v-if="showSuccessMessage"
            class="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl"
          >
            <div class="flex items-center">
              <div class="w-8 h-8 bg-success-100 rounded-xl flex items-center justify-center mr-3">
                <FontAwesomeIcon icon="check-circle" class="w-4 h-4 text-success-600" />
              </div>
              <p class="text-sm font-semibold text-success-800">{{ currentSuccessMessage }}</p>
            </div>
          </div>

          <!-- Rate Limited Message -->
          <div
            v-if="showRateLimited"
            class="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-xl"
          >
            <div class="flex items-center">
              <div class="w-8 h-8 bg-warning-100 rounded-xl flex items-center justify-center mr-3">
                <FontAwesomeIcon icon="clock" class="w-4 h-4 text-warning-600" />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-warning-800">Too Many Attempts</h3>
                <p class="text-sm text-warning-700 mt-1 font-medium">
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
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div class="space-y-3">
              <label for="email" class="text-sm font-semibold text-neutral-700 leading-none"
                >Email</label
              >
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                v-model="email"
                required
                :disabled="isLoading"
                autocomplete="email"
                class="flex h-12 w-full rounded-xl border border-primary-200 bg-white/80 px-4 py-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
              />
            </div>
            <div class="space-y-3">
              <label for="password" class="text-sm font-semibold text-neutral-700 leading-none"
                >Password</label
              >
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                v-model="password"
                required
                :disabled="isLoading"
                autocomplete="current-password"
                class="flex h-12 w-full rounded-xl border border-primary-200 bg-white/80 px-4 py-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
              />
            </div>

            <!-- Login Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full h-12 px-6 py-3 bg-gradient-primary text-white text-sm font-semibold rounded-xl hover:bg-gradient-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-medium hover:shadow-glow"
            >
              <div v-if="isLoading" class="flex items-center justify-center">
                <div
                  class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"
                ></div>
                Logging In...
              </div>
              <span v-else>Log In</span>
            </button>
          </form>

          <!-- Forgot Password Link -->
          <div class="mt-6 text-center text-sm">
            <router-link
              to="/forgot-password"
              class="text-primary-600 hover:text-primary-700 font-semibold underline transition-colors"
            >
              Forgot your password?
            </router-link>
          </div>

          <div class="mt-4 text-center text-sm">
            <span class="text-neutral-600 font-medium">Don't have an account?</span>
            <router-link
              to="/register"
              class="text-primary-600 hover:text-primary-700 font-semibold underline ml-1 transition-colors"
            >
              Create account
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
import { useAuthStore } from '../../stores/auth'
import { memberApi } from '../../api/member'

const router = useRouter()
const authStore = useAuthStore()

// Types
interface MemberUser {
  id: string
  email: string
  fullName: string
  phone?: string
  role: 'member'
  createdAt?: string
  updatedAt?: string
}

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

// Helper: Validate login input
const validateLoginInput = (): boolean => {
  if (!email.value.trim() || !password.value.trim()) {
    displayError('Please enter both email and password')
    return false
  }
  return true
}

// Helper: Handle verification required response
const handleVerificationRequired = (message: string) => {
  showVerificationRequired.value = true
  displayError(message)
  startResendCooldown()
}

// Helper: Handle rate limited response
const handleRateLimitedResponse = (message: string) => {
  showRateLimited.value = true
  displayError(message)
}

// Helper: Handle successful login
const handleSuccessfulLogin = (result: { success: boolean; message?: string; token?: string; user?: MemberUser }) => {
  displaySuccess(result.message || 'Login successful!')

  if (!result.token || !result.user) {
    displayError('Login response missing authentication data')
    return
  }

  console.log('Storing authentication data:', {
    hasToken: !!result.token,
    hasUser: !!result.user,
    tokenPreview: result.token ? `${result.token.substring(0, 20)}...` : 'None',
    userData: result.user
  })

  authStore.setAuth(result.token, result.user)

  // Verify token was stored
  const storedToken = localStorage.getItem('member_token')
  const storedUser = localStorage.getItem('member_user')
  console.log('Token storage verification:', {
    stored: !!storedToken,
    userStored: !!storedUser
  })

  // Redirect to browse plans after a short delay
  setTimeout(() => {
    router.push('/browse')
  }, 1000)
}

// Helper: Handle login error
const handleLoginError = (error: unknown) => {
  console.error('Member login error:', error)

  if (!(error instanceof Error)) {
    displayError('An unknown error occurred during login.')
    return
  }

  const errorMsg = error.message
  if (errorMsg.includes('verify') || errorMsg.includes('verification')) {
    showVerificationRequired.value = true
  } else if (errorMsg.includes('rate limit') || errorMsg.includes('Too many')) {
    showRateLimited.value = true
  }
  displayError(errorMsg)
}

// Login handler
const handleLogin = async () => {
  if (isLoading.value) {
    return
  }

  try {
    isLoading.value = true
    clearErrorTimers()
    showSuccessMessage.value = false

    if (!validateLoginInput()) {
      return
    }

    console.log('Attempting member login for:', email.value)
    const result = await memberApi.login(email.value.trim(), password.value)
    console.log('Member login response:', result)

    if (result.requiresVerification) {
      handleVerificationRequired(result.message)
    } else if (result.rateLimited) {
      handleRateLimitedResponse(result.message)
    } else if (result.success) {
      handleSuccessfulLogin(result)
    } else {
      displayError(result.message)
    }
  } catch (error) {
    handleLoginError(error)
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

  // Clear form fields when there's an error
  clearForm()

  errorCountdownTimer = globalThis.window.setInterval(() => {
    errorCountdown.value--
    if (errorCountdown.value <= 0) {
      clearErrorTimers()
    }
  }, 1000)

  errorTimer = globalThis.window.setTimeout(() => {
    clearErrorTimers()
  }, 15000)

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
    globalThis.window.clearTimeout(errorTimer)
    errorTimer = null
  }
  if (errorCountdownTimer) {
    globalThis.window.clearInterval(errorCountdownTimer)
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
    globalThis.window.clearTimeout(successTimer)
  }

  currentSuccessMessage.value = message
  showSuccessMessage.value = true

  successTimer = globalThis.window.setTimeout(() => {
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
  resendTimer = globalThis.window.setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      if (resendTimer) {
        globalThis.window.clearInterval(resendTimer)
        resendTimer = null
      }
    }
  }, 1000)
}

onUnmounted(() => {
  clearErrorTimers()
  if (successTimer) {
    globalThis.window.clearTimeout(successTimer)
  }
  if (resendTimer) {
    globalThis.window.clearInterval(resendTimer)
  }
})
</script>
