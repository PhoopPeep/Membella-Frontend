<template>
  <div
    id="app"
    class="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/20"
  >
    <!-- Global Notification Container -->
    <NotificationContainer />
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

    <div v-else>
      <!-- Show full-screen auth pages for auth callback and non-authenticated members -->
      <div
        v-if="isAuthCallbackPage || !authStore.isAuthenticated"
        class="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/20"
      >
        <router-view />
      </div>

      <!-- Show navigation and main content for authenticated members (except auth callback) -->
      <div
        v-else
        class="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/20"
      >
        <MemberNavigation />
        <main class="pt-20 bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/20">
          <div class="min-h-screen">
            <router-view />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import MemberNavigation from './components/layout/MemberNavigation.vue'
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
    console.log('Member Portal: Initializing...')
    authStore.initAuth()
    await new Promise((resolve) => setTimeout(resolve, 100))
  } catch (error) {
    console.error('Member Portal: Initialization error:', error)
  } finally {
    isInitializing.value = false
  }
})
</script>
