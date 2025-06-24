<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="w-full max-w-md bg-white rounded-lg border shadow-sm">
      <div class="p-6 space-y-1">
        <h2 class="text-2xl font-bold text-center">Welcome Back</h2>
        <p class="text-center text-gray-600">
          Enter your credentials to access your account
        </p>
      </div>
      <div class="p-6 pt-0">
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium leading-none">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              v-model="email"
              required
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../../service/authService'

const router = useRouter()
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

    // Call the API
      const result = await login({
      email: email.value,
      password: password.value
    } as { email: string, password: string })

    successMessage.value = result.message

    // Redirect to dashboard after a delay
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'An unknown error occurred.'
    }
  } finally {
    isLoading.value = false
  }
}

</script>