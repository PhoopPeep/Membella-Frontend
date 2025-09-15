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
          <h2 class="text-3xl font-bold text-neutral-800">Forgot Password</h2>
          <p class="text-neutral-600 font-medium mt-2">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        <div class="px-8 pb-8">
        <!-- Error Message -->
        <div
          v-if="showErrorMessage"
          class="mb-6 p-4 bg-gradient-to-r from-error-50 to-error-100 border border-error-200 rounded-xl"
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
          class="mb-6 p-4 bg-gradient-to-r from-success-50 to-success-100 border border-success-200 rounded-xl"
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
          class="mb-6 p-4 bg-gradient-to-r from-warning-50 to-warning-100 border border-warning-200 rounded-xl"
        >
          <div class="flex items-center">
            <div class="w-8 h-8 bg-warning-100 rounded-xl flex items-center justify-center mr-3">
              <FontAwesomeIcon icon="clock" class="w-4 h-4 text-warning-600" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-warning-800">Too Many Attempts</h3>
              <p class="text-sm text-warning-700 mt-1 font-medium">Please wait before trying again.</p>
            </div>
          </div>
        </div>

        <!-- Reset Form -->
        <form v-if="!emailSent" @submit.prevent="handleForgotPassword" class="space-y-6">
          <div class="space-y-3">
            <label for="email" class="text-sm font-semibold text-neutral-700 leading-none"
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
                class="w-full h-12 px-5 py-4 text-base bg-white/90 border-2 border-primary-200 rounded-2xl placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-4">
                <FontAwesomeIcon icon="envelope" class="w-5 h-5 text-neutral-400" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full h-12 px-6 py-3 bg-gradient-primary text-white text-sm font-semibold rounded-xl hover:bg-gradient-secondary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-medium hover:shadow-glow"
          >
            <div v-if="isLoading" class="flex items-center justify-center">
              <div
                class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"
              ></div>
              Sending...
            </div>
            <span v-else class="flex items-center justify-center">
              <FontAwesomeIcon icon="paper-plane" class="w-4 h-4 mr-2" />
              Send Reset Link
            </span>
          </button>
        </form>

        <!-- Success State -->
        <div v-if="emailSent" class="text-center space-y-6">
          <div
            class="w-20 h-20 bg-gradient-to-r from-success-100 to-success-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <FontAwesomeIcon icon="check-circle" class="w-10 h-10 text-success-600" />
          </div>
          <h3 class="text-2xl font-bold text-success-600 mb-2">Check Your Email</h3>
          <p class="text-base text-neutral-600 font-medium">
            If an account with this email exists, you will receive a password reset link at
            <strong class="text-primary-600">{{ email }}</strong>
          </p>
          <div class="bg-primary-50 border border-primary-200 rounded-xl p-4 text-sm text-primary-700 space-y-2">
            <p class="font-semibold">📧 What to do next:</p>
            <div class="space-y-1 text-left">
              <p>• Check your <strong>spam/junk folder</strong> if needed</p>
              <p>• Look for email from <code class="bg-primary-100 px-1 rounded">noreply@mail.supabase.io</code></p>
              <p>• The email may take a few minutes to arrive</p>
              <p>• The reset link will expire in 1 hour</p>
            </div>
          </div>
        </div>

        <!-- Back to Login -->
        <div class="mt-6 text-center text-sm">
          <span class="text-neutral-600 font-medium">Remember your password?</span>
          <router-link
            to="/login"
            class="text-primary-600 hover:text-primary-700 font-semibold underline ml-1 transition-colors"
          >
            Back to login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'
import { memberApi } from '../../api/member'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Form state
const email = ref('')
const isLoading = ref(false)
const emailSent = ref(false)

// Message display state
const showErrorMessage = ref(false)
const showSuccessMessage = ref(false)
const showRateLimited = ref(false)

// Message content
const currentErrorMessage = ref('')
const currentSuccessMessage = ref('')

// Timer state
const errorCountdown = ref(15)
let errorTimer: NodeJS.Timeout | null = null
let errorCountdownTimer: NodeJS.Timeout | null = null
let successTimer: NodeJS.Timeout | null = null

// Error display function (15 seconds)
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

const handleForgotPassword = async () => {
  try {
    isLoading.value = true

    // Clear any existing messages first
    clearErrorTimers()
    showSuccessMessage.value = false

    if (!email.value.trim()) {
      displayError('Please enter your email address')
      return
    }

    console.log('Attempting member forgot password for:', email.value)

    const result = await memberApi.forgotPassword(email.value.trim().toLowerCase())

    console.log('Member forgot password response:', result)

    if (result.rateLimited) {
      showRateLimited.value = true
      displayError(result.message)
    } else if (result.success) {
      emailSent.value = true
      displaySuccess(result.message || 'Password reset email sent successfully!')
    } else {
      displayError(result.message)
    }
  } catch (error) {
    console.error('Member forgot password error:', error)
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('Too many')) {
        showRateLimited.value = true
      }
      displayError(error.message)
    } else {
      displayError('An unknown error occurred.')
    }
  } finally {
    isLoading.value = false
  }
}

const tryAgain = () => {
  emailSent.value = false
  email.value = ''
  clearErrorTimers()
  showSuccessMessage.value = false
}

onUnmounted(() => {
  console.log('Cleaning up all timers on component unmount')
  clearErrorTimers()

  if (successTimer) {
    clearTimeout(successTimer)
  }
})
</script>
