<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Show loading state while initializing auth -->
    <div v-if="isInitializing" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Loading...</p>
      </div>
    </div>

    <!-- Main app content -->
    <div v-else>
      <!-- Show sidebar and main content for authenticated users -->
      <div v-if="authStore.isAuthenticated" class="flex h-screen">
        <AppSidebar />
        <main class="flex-1 overflow-auto">
          <router-view />
        </main>
      </div>

      <!-- Show full-screen auth pages for non-authenticated users -->
      <div v-else>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import AppSidebar from './components/layout/AppSidebar.vue'

const authStore = useAuthStore()
const isInitializing = ref(true)

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
