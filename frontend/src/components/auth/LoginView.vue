<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
  >
    <div class="w-full max-w-md bg-white rounded-lg border shadow-sm">
      <div class="p-6 space-y-1">
        <h2 class="text-2xl font-bold text-center">Welcome Back</h2>
        <p class="text-center text-gray-600">Enter your credentials to access your account</p>
      </div>
      <div class="p-6 pt-0">
        <!-- Error Message - Will stay for exactly 15 seconds -->
        <div v-if="showErrorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ currentErrorMessage }}</p>
          <div class="mt-2">
            <small class="text-xs text-red-500">
              This message will disappear in {{ errorCountdown }} seconds
            </small>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="showSuccessMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p class="text-sm text-green-600">{{ currentSuccessMessage }}</p>
        </div>

        <!-- Rate Limited Message -->
        <div v-if="showRateLimited" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div class="flex items-center">
            <Clock class="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <h3 class="text-sm font-medium text-yellow-800">Too Many Attempts</h3>
              <p class="text-sm text-yellow-600 mt-1">
                Please wait before trying again.
              </p>
            </div>
          </div>
        </div>

        <!-- Email Verification Required -->
        <div v-if="showVerificationRequired" class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div class="flex items-center">
            <Mail class="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <h3 class="text-sm font-medium text-blue-800">Email Verification Required</h3>
              <p class="text-sm text-blue-600 mt-1">
                Please verify your email address before signing in. Check your inbox for a verification link.
              </p>
              <div class="mt-2 text-xs text-blue-600">
                <p>• Check your spam/junk folder if needed</p>
                <p>• Look for email from <code>noreply@mail.supabase.io</code></p>
              </div>
            </div>
          </div>
          <div class="mt-3">
            <button
              @click="handleResendVerification"
              :disabled="isResending || resendCooldown > 0"
              class="text-sm text-blue-600 hover:text-blue-700 underline disabled:opacity-50"
            >
              {{ isResending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email' }}
            </button>
          </div>
        </div>

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
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            class="w-full h-10 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="isLoading"
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Clock } from 'lucide-vue-next'
import { login, resendVerification } from '../../service/authService'
import { useAuthStore } from '../../stores/auth'

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

// Timer state
const errorCountdown = ref(15)
let errorTimer: NodeJS.Timeout | null = null
let errorCountdownTimer: NodeJS.Timeout | null = null
let successTimer: NodeJS.Timeout | null = null
let resendTimer: NodeJS.Timeout | null = null

// Robust error display function that GUARANTEES 15 seconds
const displayError = (message: string) => {
  console.log('🚨 Displaying error for 15 seconds:', message)

  // Clear any existing error timers first
  clearErrorTimers()

  // Set error message and show it
  currentErrorMessage.value = message
  showErrorMessage.value = true
  errorCountdown.value = 15

  // Start countdown timer (updates every second)
  errorCountdownTimer = setInterval(() => {
    errorCountdown.value--
    console.log('⏰ Error countdown:', errorCountdown.value)

    if (errorCountdown.value <= 0) {
      clearErrorTimers()
    }
  }, 1000)

  // Main timer to clear error after exactly 15 seconds
  errorTimer = setTimeout(() => {
    console.log('✅ Clearing error after 15 seconds')
    clearErrorTimers()
  }, 15000)

  // Force Vue to update the DOM
  nextTick(() => {
    console.log('🔄 DOM updated with error message')
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
  showVerificationRequired.value = false
  errorCountdown.value = 15
}

// Success message display (shorter duration)
const displaySuccess = (message: string) => {
  console.log('✅ Displaying success message:', message)

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

const handleLogin = async () => {
  try {
    isLoading.value = true

    // Clear any existing messages first
    clearErrorTimers()
    showSuccessMessage.value = false

    if (!email.value.trim() || !password.value.trim()) {
      displayError('Please enter both email and password')
      return
    }

    console.log('🔐 Attempting login for:', email.value)

    const result = await login({
      email: email.value.trim().toLowerCase(),
      password: password.value,
    })

    console.log('✅ Login response:', result)

    if (result.requiresVerification) {
      showVerificationRequired.value = true
      displayError(result.message)
      startResendCooldown()
    } else if (result.rateLimited) {
      showRateLimited.value = true
      displayError(result.message)
    } else {
      displaySuccess(result.message || 'Login successful!')

      // Store auth data if login includes token and user
      if (result.token && result.user) {
        authStore.setAuth(result.token, result.user)

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        displayError('Login response missing authentication data')
      }
    }
  } catch (error) {
    console.error('❌ Login error:', error)
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

const handleResendVerification = async () => {
  try {
    isResending.value = true

    // Clear existing error messages
    clearErrorTimers()

    if (!email.value.trim()) {
      displayError('Please enter your email address first')
      return
    }

    console.log('📧 Resending verification to:', email.value)

    const result = await resendVerification(email.value.trim().toLowerCase())

    if (result.rateLimited) {
      showRateLimited.value = true
      displayError(result.message)
    } else {
      displaySuccess(result.message)
      startResendCooldown()
    }
  } catch (error) {
    console.error('❌ Resend verification error:', error)
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
  console.log('🧹 Cleaning up all timers on component unmount')
  clearErrorTimers()

  if (successTimer) {
    clearTimeout(successTimer)
  }
  if (resendTimer) {
    clearInterval(resendTimer)
  }
})
</script>