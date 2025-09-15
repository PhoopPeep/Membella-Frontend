<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/20 p-4"
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
        <div class="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <FontAwesomeIcon icon="building" class="w-8 h-8 text-white" />
        </div>
        <h2 class="text-3xl font-bold text-primary-700 mb-2">Create Account</h2>
        <p class="text-primary-600">
          Enter your details to create your organization account
        </p>
      </div>
      <div class="p-8">
        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-6 p-4 bg-gradient-to-r from-error-50 to-error-100 border border-error-200 rounded-xl">
          <div class="flex items-center space-x-3">
            <FontAwesomeIcon icon="exclamation-triangle" class="w-5 h-5 text-error-600" />
            <p class="text-sm font-semibold text-error-700">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mb-6 p-4 bg-gradient-to-r from-success-50 to-success-100 border border-success-200 rounded-xl">
          <div class="flex items-center space-x-3">
            <FontAwesomeIcon icon="check-circle" class="w-5 h-5 text-success-600" />
            <p class="text-sm font-semibold text-success-700">{{ successMessage }}</p>
          </div>
        </div>

        <!-- Rate Limited Message -->
        <div v-if="rateLimited" class="mb-6 p-4 bg-gradient-to-r from-warning-50 to-warning-100 border border-warning-200 rounded-xl">
          <div class="flex items-center space-x-3">
            <FontAwesomeIcon icon="clock" class="w-5 h-5 text-warning-600" />
            <div>
              <h3 class="text-sm font-semibold text-warning-800">Email Rate Limit Reached</h3>
            </div>
          </div>
        </div>

        <!-- Timeout Message -->
        <div
          v-if="timeoutMessage"
          class="mb-6 p-4 bg-gradient-to-r from-warning-50 to-warning-100 border border-warning-200 rounded-xl"
        >
          <div class="flex items-start space-x-3">
            <FontAwesomeIcon icon="exclamation-triangle" class="w-5 h-5 text-warning-600 mt-0.5" />
            <div>
              <h3 class="text-sm font-semibold text-warning-800">Request Timeout</h3>
              <p class="text-sm text-warning-700 mt-1">{{ timeoutMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Email Verification Required -->
        <div
          v-if="requiresVerification"
          class="mb-6 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl"
        >
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon="envelope" class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-primary-800 mb-2">Check Your Email</h3>
              <p class="text-primary-700 mb-4">
                We've sent a verification link to <strong class="text-primary-900">{{ userEmail }}</strong>
              </p>
              <div class="bg-white/60 rounded-lg p-4 space-y-2 text-sm text-primary-600">
                <div class="flex items-center space-x-2">
                  <FontAwesomeIcon icon="check-circle" class="w-4 h-4 text-primary-500" />
                  <span>Check your <strong>spam/junk folder</strong> if you don't see it in your inbox</span>
                </div>
                <div class="flex items-center space-x-2">
                  <FontAwesomeIcon icon="at" class="w-4 h-4 text-primary-500" />
                  <span>Look for an email from <code class="bg-primary-100 px-2 py-1 rounded text-xs">noreply@mail.supabase.io</code></span>
                </div>
                <div class="flex items-center space-x-2">
                  <FontAwesomeIcon icon="clock" class="w-4 h-4 text-primary-500" />
                  <span>The email may take a few minutes to arrive</span>
                </div>
                <div class="flex items-center space-x-2">
                  <FontAwesomeIcon icon="link" class="w-4 h-4 text-primary-500" />
                  <span>Click the verification link to activate your account</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              @click="handleResendVerification"
              :disabled="isResending || resendCooldown > 0"
              class="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-semibold text-sm hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              <FontAwesomeIcon v-if="isResending" icon="spinner" class="w-4 h-4 mr-2 animate-spin" />
              <FontAwesomeIcon v-else icon="paper-plane" class="w-4 h-4 mr-2" />
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

        <form v-if="!requiresVerification" @submit.prevent="handleRegister" class="space-y-6">
          <div class="space-y-3">
            <label for="org_name" class="text-sm font-semibold text-primary-700 flex items-center">
              <FontAwesomeIcon icon="building" class="w-4 h-4 mr-2 text-primary-500" />
              Organization Name *
            </label>
            <input
              id="org_name"
              type="text"
              placeholder="Enter your organization name"
              v-model="org_name"
              required
              :disabled="isLoading"
              class="w-full px-4 py-3 border border-primary-200 rounded-xl bg-white text-primary-700 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
            />
          </div>

          <div class="space-y-3">
            <label for="email" class="text-sm font-semibold text-primary-700 flex items-center">
              <FontAwesomeIcon icon="envelope" class="w-4 h-4 mr-2 text-primary-500" />
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              v-model="email"
              required
              :disabled="isLoading"
              class="w-full px-4 py-3 border border-primary-200 rounded-xl bg-white text-primary-700 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
            />
            <p class="text-xs text-primary-500 flex items-center">
              <FontAwesomeIcon icon="info-circle" class="w-3 h-3 mr-1" />
              We'll send a verification link to this email
            </p>
          </div>

          <div class="space-y-3">
            <label for="password" class="text-sm font-semibold text-primary-700 flex items-center">
              <FontAwesomeIcon icon="lock" class="w-4 h-4 mr-2 text-primary-500" />
              Password *
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password (min. 8 characters)"
              v-model="password"
              required
              :disabled="isLoading"
              class="w-full px-4 py-3 border border-primary-200 rounded-xl bg-white text-primary-700 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
            />
          </div>

          <div class="space-y-3">
            <label for="confirmPassword" class="text-sm font-semibold text-primary-700 flex items-center">
              <FontAwesomeIcon icon="shield-alt" class="w-4 h-4 mr-2 text-primary-500" />
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              v-model="confirmPassword"
              required
              :disabled="isLoading"
              class="w-full px-4 py-3 border border-primary-200 rounded-xl bg-white text-primary-700 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            class="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold text-base hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center"
            :disabled="isLoading"
          >
            <FontAwesomeIcon v-if="isLoading" icon="spinner" class="w-5 h-5 mr-3 animate-spin" />
            <FontAwesomeIcon v-else icon="user-plus" class="w-5 h-5 mr-3" />
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-primary-600 text-sm">
            Already have an account?
            <router-link to="/login" class="text-primary-700 font-semibold hover:text-primary-800 hover:underline ml-1 transition-colors duration-200">
              Log in
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser, resendVerification } from '../../service/authService'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const router = useRouter()

const isLoading = ref(false)
const isResending = ref(false)
const org_name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const description = ref('')
const contact_info = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const requiresVerification = ref(false)
const rateLimited = ref(false)
const timeoutMessage = ref('')
const userEmail = ref('')
const resendCooldown = ref(0)

let resendTimer: NodeJS.Timeout | null = null

// Clear form fields
const clearForm = () => {
  org_name.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  description.value = ''
  contact_info.value = ''
}

const handleRegister = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    rateLimited.value = false
    timeoutMessage.value = ''

    // Validate inputs
    if (!org_name.value.trim()) {
      throw new Error('Organization name is required')
    }

    if (password.value.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }

    if (password.value !== confirmPassword.value) {
      throw new Error('Passwords do not match')
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      throw new Error('Please enter a valid email address')
    }

    console.log('Attempting registration for:', email.value)

    const result = await registerUser({
      org_name: org_name.value.trim(),
      email: email.value.trim().toLowerCase(),
      password: password.value,
      description: description.value.trim() || undefined,
      contact_info: contact_info.value.trim() || undefined,
    })

    console.log('Registration response:', result)

    if (result.rateLimited) {
      rateLimited.value = true
      errorMessage.value = result.message
      // Clear form when rate limited
      clearForm()
    } else if (result.requiresVerification) {
      requiresVerification.value = true
      userEmail.value = email.value.trim().toLowerCase()
      successMessage.value = result.message
      startResendCooldown()
    } else {
      successMessage.value = result.message
      // If no verification required, redirect to login
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } catch (error) {
    console.error('Registration error:', error)
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('ECONNABORTED')) {
        timeoutMessage.value = error.message
        requiresVerification.value = true
        userEmail.value = email.value.trim().toLowerCase()
      } else if (error.message.includes('rate limit') || error.message.includes('Too many')) {
        rateLimited.value = true
        errorMessage.value = error.message
        // Clear form when rate limited
        clearForm()
      } else {
        errorMessage.value = error.message
        // Clear form for other errors
        clearForm()
      }
    } else if (typeof error === 'string') {
      errorMessage.value = error
      // Clear form for string errors
      clearForm()
    } else {
      errorMessage.value = 'An error occurred during registration'
      // Clear form for unknown errors
      clearForm()
    }
  } finally {
    isLoading.value = false
  }
}

const handleResendVerification = async () => {
  try {
    isResending.value = true
    errorMessage.value = ''
    rateLimited.value = false

    console.log('Resending verification to:', userEmail.value)

    const result = await resendVerification(userEmail.value)

    if (result.rateLimited) {
      rateLimited.value = true
      errorMessage.value = result.message
    } else {
      successMessage.value = result.message
      startResendCooldown()
    }
  } catch (error) {
    console.error('Resend error:', error)
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('Too many')) {
        rateLimited.value = true
      }
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to resend verification email'
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
  if (resendTimer) {
    clearInterval(resendTimer)
  }
})
</script>
