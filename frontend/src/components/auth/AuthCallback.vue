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
          <div class="space-y-2">
            <button
              @click="redirectToLogin"
              class="w-full h-10 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Back to Login
            </button>
            <button
              @click="retryVerification"
              v-if="canRetry"
              class="w-full h-10 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>

        <div v-else-if="success" class="space-y-4">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle class="w-6 h-6 text-green-600" />
          </div>
          <h2 class="text-xl font-semibold text-green-600">Email Verified!</h2>
          <p class="text-gray-600">Your account has been successfully verified. You're being redirected to the dashboard...</p>
          <div class="mt-4">
            <button
              @click="redirectToDashboard"
              class="w-full h-10 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
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
import { useAuthStore } from '../../stores/auth'
import api from '../../router/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isProcessing = ref(true)
const error = ref('')
const success = ref(false)
const canRetry = ref(false)

const processAuthCallback = async () => {
  try {
    console.log('🔄 Starting auth callback processing')
    console.log('📍 Current URL:', window.location.href)
    console.log('🔗 Route query:', route.query)

    // Check if we have URL parameters for auth
    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get('access_token')
    const refreshToken = urlParams.get('refresh_token')
    const type = urlParams.get('type')

    console.log('🔑 URL tokens found:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      type
    })

    if (accessToken && refreshToken) {
      // This is a URL-based callback (email verification link)
      console.log('📧 Processing email verification callback')

      // Set the session in Supabase client
      const { data: { session }, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (sessionError) {
        console.error('❌ Failed to set session:', sessionError)
        throw new Error('Failed to verify email: ' + sessionError.message)
      }

      if (!session || !session.user) {
        throw new Error('No valid session created from email verification')
      }

      console.log('✅ Session set successfully:', session.user.id)
      console.log('📧 Email confirmed:', session.user.email_confirmed_at)

      // Call our backend to complete the auth process
      try {
        console.log('🔗 Calling backend auth callback...')
        const response = await api.post('/api/auth/callback', {
          access_token: accessToken,
          refresh_token: refreshToken,
          type: type || 'signup'
        })

        console.log('✅ Backend callback successful:', response.data)

        if (response.data.token && response.data.user) {
          // Store auth data
          authStore.setAuth(response.data.token, response.data.user)
          success.value = true

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            redirectToDashboard()
          }, 2000)
        } else {
          throw new Error('Backend did not return authentication data')
        }
      } catch (backendError) {
        console.error('❌ Backend callback failed:', backendError)

        // Even if backend fails, if we have a valid Supabase session,
        // we can try to get user data directly
        if (session.user.email_confirmed_at) {
          console.log('🔄 Attempting direct user lookup...')
          await handleDirectAuth(session)
        } else {
          throw new Error('Email verification failed on backend')
        }
      }
    } else {
      // Check for existing session (page refresh scenario)
      console.log('🔄 Checking for existing session...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('❌ Session error:', sessionError)
        throw new Error('Session error: ' + sessionError.message)
      }

      if (session && session.user && session.user.email_confirmed_at) {
        console.log('✅ Found existing confirmed session')
        await handleDirectAuth(session)
      } else {
        throw new Error('No valid authentication session found. Please try logging in again.')
      }
    }
  } catch (err) {
    console.error('❌ Auth callback error:', err)
    error.value = err instanceof Error ? err.message : 'Authentication failed'
    canRetry.value = true
  } finally {
    isProcessing.value = false
  }
}

const handleDirectAuth = async (session: any) => {
  try {
    console.log('🔄 Handling direct auth with session')

    // Try to get user from our backend using the session
    const { data: profileResponse } = await api.get('/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (profileResponse.user) {
      // Create a JWT token for this session (this should ideally come from backend)
      // For now, we'll use the Supabase access token
      authStore.setAuth(session.access_token, profileResponse.user)
      success.value = true

      setTimeout(() => {
        redirectToDashboard()
      }, 2000)
    } else {
      throw new Error('User profile not found')
    }
  } catch (directAuthError) {
    console.error('❌ Direct auth failed:', directAuthError)
    throw new Error('Failed to complete authentication')
  }
}

const redirectToLogin = () => {
  router.push('/login')
}

const redirectToDashboard = () => {
  router.push('/dashboard')
}

const retryVerification = () => {
  isProcessing.value = true
  error.value = ''
  canRetry.value = false
  processAuthCallback()
}

onMounted(() => {
  // Add a small delay to let the URL parameters settle
  setTimeout(() => {
    processAuthCallback()
  }, 500)
})
</script>