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
        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p class="text-sm text-green-600">{{ successMessage }}</p>
        </div>

        <!-- Rate Limited Message -->
        <div v-if="rateLimited" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
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
        <div v-if="requiresVerification" class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
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
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Clock } from 'lucide-vue-next'
import { login, resendVerification } from '../../service/authService'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const isResending = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const requiresVerification = ref(false)
const rateLimited = ref(false)
const resendCooldown = ref(0)

let resendTimer: NodeJS.Timeout | null = null

const handleLogin = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''
    requiresVerification.value = false
    rateLimited.value = false

    if (!email.value.trim() || !password.value.trim()) {
      throw new Error('Please enter both email and password')
    }

    console.log('🔐 Attempting login for:', email.value)

    const result = await login({
      email: email.value.trim().toLowerCase(),
      password: password.value,
    })

    console.log('✅ Login response:', result)

    if (result.requiresVerification) {
      requiresVerification.value = true
      errorMessage.value = result.message
      startResendCooldown()
    } else if (result.rateLimited) {
      rateLimited.value = true
      errorMessage.value = result.message
    } else {
      successMessage.value = result.message || 'Login successful!'

      // Store auth data if login includes token and user
      if (result.token && result.user) {
        authStore.setAuth(result.token, result.user)

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        throw new Error('Login response missing authentication data')
      }
    }
  } catch (error) {
    console.error('❌ Login error:', error)
    if (error instanceof Error) {
      if (error.message.includes('verify') || error.message.includes('verification')) {
        requiresVerification.value = true
      } else if (error.message.includes('rate limit') || error.message.includes('Too many')) {
        rateLimited.value = true
      }
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'An unknown error occurred during login.'
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

    if (!email.value.trim()) {
      throw new Error('Please enter your email address first')
    }

    console.log('📧 Resending verification to:', email.value)

    const result = await resendVerification(email.value.trim().toLowerCase())

    if (result.rateLimited) {
      rateLimited.value = true
      errorMessage.value = result.message
    } else {
      successMessage.value = result.message
      startResendCooldown()
    }
  } catch (error) {
    console.error('❌ Resend verification error:', error)
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