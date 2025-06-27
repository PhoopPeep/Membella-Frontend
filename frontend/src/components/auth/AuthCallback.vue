<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="w-full max-w-md bg-white rounded-lg border shadow-sm">
      <div class="p-6 text-center">
        <div v-if="isProcessing" class="space-y-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 class="text-xl font-semibold">Verifying your email...</h2>
          <p class="text-gray-600">Please wait while we confirm your account.</p>
        </div>

        <div v-else-if="error" class="space-y-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle class="w-6 h-6 text-red-600" />
          </div>
          <h2 class="text-xl font-semibold text-red-600">Verification Failed</h2>
          <p class="text-gray-600">{{ error }}</p>
          <button
            @click="redirectToLogin"
            class="w-full h-10 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Back to Login
          </button>
        </div>

        <div v-else-if="success" class="space-y-4">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle class="w-6 h-6 text-green-600" />
          </div>
          <h2 class="text-xl font-semibold text-green-600">Email Verified!</h2>
          <p class="text-gray-600">Your account has been successfully verified. You're being redirected to the dashboard...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CheckCircle, AlertCircle } from 'lucide-vue-next'
import { supabase } from '../../lib/supabase'
import { handleAuthCallback } from '../../service/authService'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isProcessing = ref(true)
const error = ref('')
const success = ref(false)

const processAuthCallback = async () => {
  try {
    // Check if we have the auth session from URL params
    const { data, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      throw new Error(sessionError.message)
    }

    if (!data.session) {
      throw new Error('No authentication session found')
    }

    // Call our backend to handle the auth callback
    const result = await handleAuthCallback(
      data.session.access_token,
      data.session.refresh_token
    )

    if (result.token && result.user) {
      // Store auth data
      authStore.setAuth(result.token, result.user)
      success.value = true

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } else {
      throw new Error('Authentication failed - no token received')
    }
  } catch (err) {
    console.error('Auth callback error:', err)
    error.value = err instanceof Error ? err.message : 'Authentication failed'
  } finally {
    isProcessing.value = false
  }
}

const redirectToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  processAuthCallback()
})
</script>