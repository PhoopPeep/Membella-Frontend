<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <div v-if="isInitializing" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Loading...</p>
      </div>
    </div>

    <div v-else>
      <!-- Show navigation and main content for authenticated members -->
      <div v-if="authStore.isAuthenticated" class="min-h-screen">
        <MemberNavigation />
        <main class="pt-16">
          <router-view />
        </main>
      </div>

      <!-- Show auth pages for non-authenticated members -->
      <div v-else>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import MemberNavigation from './components/layout/MemberNavigation.vue'

const authStore = useAuthStore()
const isInitializing = ref(true)

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
