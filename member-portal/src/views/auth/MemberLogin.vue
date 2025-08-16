<!-- member-portal/src/views/auth/MemberLogin.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="w-full max-w-md bg-white rounded-lg border shadow-sm">
      <div class="p-6 space-y-1">
        <h2 class="text-2xl font-bold text-center">Member Login</h2>
        <p class="text-center text-gray-600">Access your subscription and benefits</p>
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
            :disabled="isLoading"
            class="w-full h-10 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>

        <div class="mt-4 text-center text-sm">
          Don't have an account?
          <router-link to="/register" class="text-blue-600 hover:underline ml-1">
            Sign up here
          </router-link>
        </div>

        <!-- Browse as Guest -->
        <div class="mt-4 text-center">
          <router-link
            to="/browse"
            class="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Browse plans as guest
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { memberApi } from '../../api/member'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleLogin = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    if (!email.value.trim() || !password.value.trim()) {
      errorMessage.value = 'Please enter both email and password'
      return
    }

    console.log('Member login attempt:', email.value)

    const result = await memberApi.login(email.value.trim(), password.value)

    if (result.success && result.token && result.user) {
      authStore.setAuth(result.token, result.user)
      successMessage.value = 'Login successful!'

      setTimeout(() => {
        router.push('/browse')
      }, 1000)
    } else {
      errorMessage.value = result.message || 'Login failed'
    }
  } catch (error: unknown) {
    console.error('Member login error:', error)
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'An error occurred during login'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
