<template>
  <nav class="bg-white shadow-sm border-b border-gray-200 fixed top-0 w-full z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <router-link to="/homepage" class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">M</span>
            </div>
            <span class="text-xl font-semibold text-gray-900 hidden sm:block">Membella</span>
          </router-link>
        </div>

        <!-- Navigation Links -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.href"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            active-class="text-blue-600 bg-blue-50"
          >
            <FontAwesomeIcon :icon="item.icon" class="w-4 h-4 mr-2" />
            {{ item.name }}
          </router-link>
        </div>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <!-- Show different content based on auth status -->
          <div v-if="authStore.isAuthenticated" class="flex items-center space-x-4">
            <!-- Profile Link (Direct navigation, no dropdown) -->
            <router-link
              to="/profile"
              class="flex items-center space-x-2 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2 transition-colors"
              active-class="text-blue-600 bg-blue-50"
            >
              <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon="user" class="w-4 h-4 text-gray-600" />
              </div>
              <span class="hidden sm:block text-sm font-medium">Profile</span>
            </router-link>
          </div>

          <!-- Login/Register buttons for non-authenticated users -->
          <div v-else class="flex items-center space-x-3">
            <router-link
              to="/login"
              class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Login
            </router-link>
            <router-link
              to="/register"
              class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Register
            </router-link>
          </div>

          <!-- Mobile menu button -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <FontAwesomeIcon :icon="showMobileMenu ? 'times' : 'bars'" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="showMobileMenu" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          <!-- Navigation items -->
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.href"
            class="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
            active-class="text-blue-600 bg-blue-50"
            @click="closeMobileMenu"
          >
            <FontAwesomeIcon :icon="item.icon" class="w-4 h-4 mr-2" />
            {{ item.name }}
          </router-link>

          <!-- Auth items for mobile -->
          <div v-if="!authStore.isAuthenticated" class="pt-4 border-t border-gray-200">
            <router-link
              to="/login"
              class="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              @click="closeMobileMenu"
            >
              Login
            </router-link>
            <router-link
              to="/register"
              class="bg-blue-600 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-colors mx-3 mt-2"
              @click="closeMobileMenu"
            >
              Register
            </router-link>
          </div>

          <div v-else class="pt-4 border-t border-gray-200">
            <router-link
              to="/profile"
              class="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
              @click="closeMobileMenu"
            >
              <FontAwesomeIcon icon="user" class="w-4 h-4 mr-2" />
              Profile
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const showMobileMenu = ref(false)

// Dynamic navigation items based on auth status
const navigationItems = computed(() => {
  if (authStore.isAuthenticated) {
    return [
      { name: 'Organizations', href: '/homepage', icon: 'home' },
      { name: 'My Subscriptions', href: '/subscriptions', icon: 'layer-group' },
      { name: 'Payment History', href: '/payments', icon: 'receipt' },
    ]
  } else {
    return [
      { name: 'Organizations', href: '/homepage', icon: 'home' },
    ]
  }
})

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}
</script>
