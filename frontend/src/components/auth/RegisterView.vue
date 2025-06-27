<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
  >
    <div class="w-full max-w-md bg-white rounded-lg border shadow-sm">
      <div class="p-6 space-y-1">
        <h2 class="text-2xl font-bold text-center">Create Account</h2>
        <p class="text-center text-gray-600">
          Enter your details to create your organization account
        </p>
      </div>
      <div class="p-6 pt-0">
        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p class="text-sm text-green-600">{{ successMessage }}</p>
        </div>

        <!-- Email Verification Required -->
        <div v-if="requiresVerification" class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div class="flex items-start">
            <Mail class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div class="flex-1">
              <h3 class="text-sm font-medium text-blue-800">Check Your Email</h3>
              <p class="text-sm text-blue-600 mt-1">
                We've sent a verification link to <strong>{{ userEmail }}</strong>
              </p>
              <div class="mt-2 text-xs text-blue-600 space-y-1">
                <p>• Check your <strong>spam/junk folder</strong> if you don't see it in your inbox</p>
                <p>• Look for an email from <code>noreply@mail.supabase.io</code></p>
                <p>• The email may take a few minutes to arrive</p>
              </div>
            </div>
          </div>
          <div class="mt-3 flex flex-col sm:flex-row gap-2">
            <button
              @click="handleResendVerification"
              :disabled="isResending || resendCooldown > 0"
              class="text-sm text-blue-600 hover:text-blue-700 underline disabled:opacity-50 disabled:no-underline"
            >
              {{ isResending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email' }}
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
            <label for="org_name" class="text-sm font-medium leading-none">Organization Name *</label>
            <input
              id="org_name"
              type="text"
              placeholder="Enter your organization name"
              v-model="org_name"
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
            <label for="password" class="text-sm font-medium leading-none">Password *</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password (min. 6 characters)"
              v-model="password"
              required
              :disabled="isLoading"
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div class="space-y-2">
            <label for="confirmPassword" class="text-sm font-medium leading-none">Confirm Password *</label>
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
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Mail } from 'lucide-vue-next'
import { registerUser, resendVerification } from '../../service/authService'

const router = useRouter()

const isLoading = ref(false)
const isResending = ref(false)
const org_name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const requiresVerification = ref(false)
const userEmail = ref('')
const resendCooldown = ref(0)

let resendTimer: NodeJS.Timeout | null = null

const handleRegister = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // Validate inputs
    if (!org_name.value.trim()) {
      throw new Error('Organization name is required')
    }

    if (password.value.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    if (password.value !== confirmPassword.value) {
      throw new Error('Passwords do not match')
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      throw new Error('Please enter a valid email address')
    }

    console.log('🚀 Attempting registration for:', email.value)

    const result = await registerUser({
      org_name: org_name.value.trim(),
      email: email.value.trim().toLowerCase(),
      password: password.value,
    })

    console.log('✅ Registration response:', result)

    if (result.requiresVerification) {
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
    console.error('❌ Registration error:', error)
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else if (typeof error === 'string') {
      errorMessage.value = error
    } else {
      errorMessage.value = 'An error occurred during registration'
    }
  } finally {
    isLoading.value = false
  }
}

const handleResendVerification = async () => {
  try {
    isResending.value = true
    errorMessage.value = ''

    console.log('📧 Resending verification to:', userEmail.value)

    const result = await resendVerification(userEmail.value)
    successMessage.value = result.message
    startResendCooldown()
  } catch (error) {
    console.error('❌ Resend error:', error)
    if (error instanceof Error) {
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

const tryDifferentEmail = () => {
  requiresVerification.value = false
  successMessage.value = ''
  errorMessage.value = ''
  email.value = ''
  userEmail.value = ''
  if (resendTimer) {
    clearInterval(resendTimer)
    resendTimer = null
    resendCooldown.value = 0
  }
}

onUnmounted(() => {
  if (resendTimer) {
    clearInterval(resendTimer)
  }
})
</script>