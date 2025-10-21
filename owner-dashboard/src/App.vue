<template>
  <div id="app" class="min-h-screen bg-gradient-soft">
    <!-- Show loading state while initializing auth -->
    <div v-if="isInitializing" class="min-h-screen flex items-center justify-center">
      <div class="text-center animate-fade-in">
        <div class="relative">
          <div
            class="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-500 mx-auto mb-4"
          ></div>
          <div
            class="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-secondary-500 animate-pulse-soft"
          ></div>
        </div>
        <p class="text-neutral-600 font-medium">Loading Membella...</p>
        <div class="mt-2 w-32 h-1 bg-primary-100 rounded-full mx-auto">
          <div class="h-1 bg-gradient-primary rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>

    <!-- Main app content -->
    <div v-else>
      <!-- Show full-screen auth pages for auth callback and non-authenticated users -->
      <div v-if="isAuthCallbackPage || !authStore.isAuthenticated" class="min-h-screen bg-gradient-soft">
        <router-view />
      </div>

      <!-- Show sidebar and main content for authenticated users (except auth callback) -->
      <div v-else class="flex h-screen bg-gradient-soft">
        <AppSidebar />
        <main class="flex-1 overflow-auto bg-gradient-soft">
          <div class="min-h-full">
            <router-view />
          </div>
        </main>
      </div>
    </div>

    <!-- Notification Container -->
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AppSidebar from './components/layout/AppSidebar.vue'
import NotificationContainer from './components/NotificationContainer.vue'

const authStore = useAuthStore()
const route = useRoute()
const isInitializing = ref(true)

// Check if current page is auth callback
const isAuthCallbackPage = computed(() => {
  return route.path.includes('/auth/callback')
})

onMounted(async () => {
  try {
    console.log('App: Initializing application...')

    // Initialize auth state from localStorage
    authStore.initAuth()

    // If user is authenticated, refresh their data from server
    if (authStore.isAuthenticated) {
      console.log('👤 App: User is authenticated, refreshing data...')

      // Try to refresh user data from server to get latest info including profile image
      try {
        await authStore.refreshUserData()
        console.log('App: User data refreshed successfully')
      } catch (error) {
        console.warn('App: Failed to refresh user data, continuing with cached data:', error)
        // Continue with cached data if server request fails
      }
    }

    // Add a small delay to prevent flash of content
    await new Promise((resolve) => setTimeout(resolve, 100))
  } catch (error) {
    console.error('App: Error initializing auth:', error)
  } finally {
    isInitializing.value = false
    console.log('App: Initialization complete')
  }
})
</script>
