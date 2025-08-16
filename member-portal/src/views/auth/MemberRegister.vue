<!-- member-portal/src/views/auth/MemberRegister.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="w-full max-w-md bg-white rounded-lg border shadow-sm">
      <div class="p-6 space-y-1">
        <h2 class="text-2xl font-bold text-center">Create Member Account</h2>
        <p class="text-center text-gray-600">Join us to access exclusive plans and benefits</p>
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

        <form @submit.prevent="handleRegister" class="space-y-4">
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
            :disabled="isLoading"
            class="w-full h-10 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { memberApi } from '../../api/member'

const router = useRouter()

const fullName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // Validation
    if (!fullName.value.trim()) {
      errorMessage.value = 'Full name is required'
      return
    }

    if (!email.value.trim()) {
      errorMessage.value = 'Email is required'
      return
    }

    if (password.value.length < 8) {
      errorMessage.value = 'Password must be at least 8 characters long'
      return
    }

    if (password.value !== confirmPassword.value) {
      errorMessage.value = 'Passwords do not match'
      return
    }

    console.log('Member registration attempt:', email.value)

    const result = await memberApi.register({
      fullName: fullName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim() || undefined,
      password: password.value
    })

    if (result.success) {
      successMessage.value = 'Account created successfully! You can now login.'

      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      errorMessage.value = result.message || 'Registration failed'
    }
  } catch (error: unknown) {
    console.error('Member registration error:', error)
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage.value = (error as { message?: string }).message || 'An error occurred during registration'
    } else {
      errorMessage.value = 'An error occurred during registration'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
