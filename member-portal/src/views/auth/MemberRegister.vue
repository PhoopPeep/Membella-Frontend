<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
  >
    <div class="w-full max-w-md bg-white rounded-lg border shadow-sm">
      <div class="p-6 space-y-1">
        <h2 class="text-2xl font-bold text-center">Create Member Account</h2>
        <p class="text-center text-gray-600">Join us to access exclusive plans and benefits</p>
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
        <div v-if="rateLimited" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div class="flex items-center">
            <FontAwesomeIcon icon="clock" class="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <h3 class="text-sm font-medium text-yellow-800">Email Rate Limit Reached</h3>
              <p class="text-sm text-yellow-600 mt-1">
                Supabase development mode allows only 2-3 emails per hour. Please wait and try again
                later.
              </p>
              <p class="text-xs text-yellow-600 mt-2">
                <strong>For production:</strong> Set up custom SMTP (SendGrid, Resend, etc.) to
                increase limits.
              </p>
            </div>
          </div>
        </div>

        <!-- Email Verification Required -->
        <div
          v-if="requiresVerification"
          class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md"
        >
          <div class="flex items-start">
            <FontAwesomeIcon
              icon="envelope"
              class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
            />
            <div class="flex-1">
              <h3 class="text-sm font-medium text-blue-800">Check Your Email</h3>
              <p class="text-sm text-blue-600 mt-1">
                We've sent a verification link to <strong>{{ userEmail }}</strong>
              </p>
              <div class="mt-2 text-xs text-blue-600 space-y-1">
                <p>
                  • Check your <strong>spam/junk folder</strong> if you don't see it in your inbox
                </p>
                <p>• Look for an email from <code>noreply@mail.supabase.io</code></p>
                <p>• The email may take a few minutes to arrive</p>
                <p>• Click the verification link to activate your account</p>
                <p>
                  • <strong>Note:</strong> Development version has a limit of 2-3 emails per hour
                </p>
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
            <button
              @click="tryDifferentEmail"
              class="text-sm text-gray-600 hover:text-gray-700 underline"
            >
              Try different email
            </button>
          </div>
        </div>

        <form v-if="!requiresVerification" @submit.prevent="handleRegister" class="space-y-4">
          <div class="space-y-2">
            <label for="fullName" class="text-sm font-medium leading-none">Full Name *</label>
            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              v-model="fullName"
              required
              :disabled="isLoading"
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium leading-none">Email *</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              v-model="email"
              required
              :disabled="isLoading"
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p class="text-xs text-gray-500">We'll send a verification link to this email</p>
          </div>
          <div class="space-y-2">
            <label for="phone" class="text-sm font-medium leading-none">Phone (Optional)</label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              v-model="phone"
              :disabled="isLoading"
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div class="space-y-2">
            <label for="password" class="text-sm font-medium leading-none">Password *</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password (min. 8 characters)"
              v-model="password"
              required
              :disabled="isLoading"
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div class="space-y-2">
            <label for="confirmPassword" class="text-sm font-medium leading-none"
              >Confirm Password *</label
            >
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              v-model="confirmPassword"
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
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <div class="mt-4 text-center text-sm">
          Already have an account?
          <router-link to="/login" class="text-blue-600 hover:underline ml-1">
            Sign in
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { memberApi } from '../../api/member'

const router = useRouter()

const isLoading = ref(false)
const isResending = ref(false)
const fullName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const requiresVerification = ref(false)
const rateLimited = ref(false)
const userEmail = ref('')
const resendCooldown = ref(0)

// Message display state
const showErrorMessage = ref(false)
const showSuccessMessage = ref(false)

// Message content
const currentErrorMessage = ref('')
const currentSuccessMessage = ref('')

// Timer state - using number instead of NodeJS.Timeout for browser compatibility
const errorCountdown = ref(15)
let errorTimer: number | null = null
let errorCountdownTimer: number | null = null
let successTimer: number | null = null
let resendTimer: number | null = null

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
  errorCountdownTimer = window.setInterval(() => {
    errorCountdown.value--
    console.log('Error countdown:', errorCountdown.value)

    if (errorCountdown.value <= 0) {
      clearErrorTimers()
    }
  }, 1000)

  // Main timer to clear error after exactly 15 seconds
  errorTimer = window.setTimeout(() => {
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
    window.clearTimeout(errorTimer)
    errorTimer = null
  }
  if (errorCountdownTimer) {
    window.clearInterval(errorCountdownTimer)
    errorCountdownTimer = null
  }

  showErrorMessage.value = false
  currentErrorMessage.value = ''
  rateLimited.value = false
  errorCountdown.value = 15
}

// Success message display (shorter duration)
const displaySuccess = (message: string) => {
  console.log('Displaying success message:', message)

  // Clear existing success timer
  if (successTimer) {
    window.clearTimeout(successTimer)
  }

  currentSuccessMessage.value = message
  showSuccessMessage.value = true

  successTimer = window.setTimeout(() => {
    showSuccessMessage.value = false
    currentSuccessMessage.value = ''
  }, 5000) // 5 seconds for success messages
}

const handleRegister = async () => {
  try {
    isLoading.value = true
    clearErrorTimers()
    showSuccessMessage.value = false
    rateLimited.value = false

    // Validation
    if (!fullName.value.trim()) {
      displayError('Full name is required')
      return
    }

    if (!email.value.trim()) {
      displayError('Email is required')
      return
    }

    if (password.value.length < 8) {
      displayError('Password must be at least 8 characters long')
      return
    }

    if (password.value !== confirmPassword.value) {
      displayError('Passwords do not match')
      return
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      displayError('Please enter a valid email address')
      return
    }

    console.log('Attempting member registration for:', email.value)

    const result = await memberApi.register({
      fullName: fullName.value.trim(),
      email: email.value.trim().toLowerCase(),
      password: password.value,
      phone: phone.value.trim() || undefined,
    })

    console.log('Member registration response:', result)

    if (result.rateLimited) {
      rateLimited.value = true
      displayError(result.message)
    } else if (result.requiresVerification) {
      requiresVerification.value = true
      userEmail.value = email.value.trim().toLowerCase()
      displaySuccess(result.message)
      startResendCooldown()
    } else if (result.success) {
      displaySuccess(result.message)
      // If no verification required, redirect to login
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      displayError(result.message)
    }
  } catch (error) {
    console.error('Member registration error:', error)
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('Too many')) {
        rateLimited.value = true
      }
      displayError(error.message)
    } else if (typeof error === 'string') {
      displayError(error)
    } else {
      displayError('An error occurred during registration')
    }
  } finally {
    isLoading.value = false
  }
}

const handleResendVerification = async () => {
  try {
    isResending.value = true
    clearErrorTimers()
    rateLimited.value = false

    console.log('Resending member verification to:', userEmail.value)

    const result = await memberApi.resendVerification(userEmail.value)

    if (result.rateLimited) {
      rateLimited.value = true
      displayError(result.message)
    } else {
      displaySuccess(result.message)
      startResendCooldown()
    }
  } catch (error) {
    console.error('Resend error:', error)
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('Too many')) {
        rateLimited.value = true
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

const tryDifferentEmail = () => {
  requiresVerification.value = false
  showSuccessMessage.value = false
  clearErrorTimers()
  rateLimited.value = false
  email.value = ''
  userEmail.value = ''
  if (resendTimer) {
    window.clearInterval(resendTimer)
    resendTimer = null
    resendCooldown.value = 0
  }
}

onUnmounted(() => {
  console.log('Cleaning up all timers on component unmount')
  clearErrorTimers()

  if (successTimer) {
    window.clearTimeout(successTimer)
  }
  if (resendTimer) {
    window.clearInterval(resendTimer)
  }
})
</script>
