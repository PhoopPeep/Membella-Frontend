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
    // Initialize auth state from localStorage
    authStore.initAuth()

    // Add a small delay to prevent flash of content
    await new Promise((resolve) => setTimeout(resolve, 100))
  } catch (error) {
    console.error('Error initializing auth:', error)
  } finally {
    isInitializing.value = false
  }
})
</script>

<style>
#app {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
