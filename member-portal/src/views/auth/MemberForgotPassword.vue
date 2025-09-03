<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
  >
    <div class="w-full max-w-md bg-white rounded-lg border shadow-sm">
      <div class="p-6 space-y-1">
        <h2 class="text-2xl font-bold text-center">Forgot Password</h2>
        <p class="text-center text-gray-600">
          Enter your email address and we'll send you a link to reset your password
        </p>
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

        <!-- Reset Form -->
        <form v-if="!emailSent" @submit.prevent="handleForgotPassword" class="space-y-4">
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium leading-none">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              v-model="email"
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
            {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </form>

        <!-- Success State -->
        <div v-if="emailSent" class="text-center space-y-4">
          <div
            class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FontAwesomeIcon icon="check-circle" class="w-6 h-6 text-green-600" />
          </div>
          <h3 class="text-lg font-medium text-green-600">Check Your Email</h3>
          <p class="text-sm text-gray-600">
            If an account with this email exists, you will receive a password reset link at
            <strong>{{ email }}</strong>
          </p>
          <div class="text-xs text-gray-500 space-y-1">
            <p>• Check your spam/junk folder if needed</p>
            <p>• Look for email from <code>noreply@mail.supabase.io</code></p>
            <p>• The email may take a few minutes to arrive</p>
            <p>• The reset link will expire in 1 hour</p>
          </div>
          <button
            @click="tryAgain"
            class="w-full h-10 px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Try Different Email
          </button>
        </div>

        <!-- Back to Login -->
        <div class="mt-4 text-center text-sm">
          Remember your password?
          <router-link to="/login" class="text-blue-600 hover:underline ml-1">
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
