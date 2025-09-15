<template>
  <nav
    class="bg-white/90 backdrop-blur-sm shadow-soft border-b border-primary-200 fixed top-0 w-full z-50"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-20">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <router-link to="/homepage" class="flex items-center space-x-3 group">
            <div
              class="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-medium group-hover:shadow-glow transition-all duration-300"
            >
              <span class="text-white font-bold text-lg">M</span>
            </div>
            <div class="hidden sm:block">
              <span
                class="text-xl font-bold text-neutral-800 group-hover:text-primary-700 transition-colors"
                >Membella</span
              >
            </div>
          </router-link>
        </div>

        <!-- Navigation Links -->
        <div class="hidden md:flex items-center space-x-2">
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.href"
            class="text-neutral-600 hover:text-primary-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden"
            active-class="text-primary-700 bg-primary-50 shadow-soft"
          >
            <!-- Background effect for hover -->
            <div
              class="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-200 rounded-xl"
            ></div>

            <FontAwesomeIcon
              :icon="item.icon"
              class="w-4 h-4 mr-2 relative z-10 group-hover:scale-110 transition-transform"
            />
            <span class="relative z-10">{{ item.name }}</span>
          </router-link>
        </div>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <!-- Show different content based on auth status -->
          <div v-if="authStore.isAuthenticated" class="flex items-center space-x-4">
            <!-- Profile Link (Direct navigation, no dropdown) -->
            <router-link
              to="/profile"
              class="flex items-center space-x-3 text-neutral-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl p-3 transition-all duration-200 group"
              active-class="text-primary-700 bg-primary-50 shadow-soft"
            >
              <div
                class="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-medium transition-all duration-200"
              >
                <FontAwesomeIcon icon="user" class="w-5 h-5 text-white" />
              </div>
              <span class="hidden sm:block text-sm font-semibold">Profile</span>
            </router-link>
          </div>

          <!-- Login/Register buttons for non-authenticated users -->
          <div v-else class="flex items-center space-x-3">
            <router-link
              to="/login"
              class="text-neutral-600 hover:text-primary-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-primary-50"
            >
              Login
            </router-link>
            <router-link
              to="/register"
              class="bg-gradient-primary text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-gradient-secondary transition-all duration-200 shadow-medium hover:shadow-glow"
            >
              Register
            </router-link>
          </div>

          <!-- Mobile menu button -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden inline-flex items-center justify-center p-3 rounded-xl text-neutral-500 hover:text-primary-700 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-200"
          >
            <FontAwesomeIcon :icon="showMobileMenu ? 'times' : 'bars'" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div
        v-if="showMobileMenu"
        class="md:hidden bg-white/95 backdrop-blur-sm border-t border-primary-200 shadow-soft"
      >
        <div class="px-4 pt-4 pb-6 space-y-2 sm:px-6">
          <!-- Navigation items -->
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.href"
            class="text-neutral-600 hover:text-primary-700 block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 hover:bg-primary-50"
            active-class="text-primary-700 bg-primary-50 shadow-soft"
            @click="closeMobileMenu"
          >
            <FontAwesomeIcon :icon="item.icon" class="w-4 h-4 mr-3" />
            {{ item.name }}
          </router-link>

          <!-- Auth items for mobile -->
          <div v-if="!authStore.isAuthenticated" class="pt-4 border-t border-primary-200">
            <router-link
              to="/login"
              class="text-neutral-600 hover:text-primary-700 block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 hover:bg-primary-50"
              @click="closeMobileMenu"
            >
              Login
            </router-link>
            <router-link
              to="/register"
              class="bg-gradient-primary text-white block px-4 py-3 rounded-xl text-base font-semibold hover:bg-gradient-secondary transition-all duration-200 shadow-medium mx-4 mt-3"
              @click="closeMobileMenu"
            >
              Register
            </router-link>
          </div>

          <div v-else class="pt-4 border-t border-primary-200">
            <router-link
              to="/profile"
              class="text-neutral-600 hover:text-primary-700 block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 hover:bg-primary-50"
              @click="closeMobileMenu"
            >
              <FontAwesomeIcon icon="user" class="w-4 h-4 mr-3" />
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
    return [{ name: 'Organizations', href: '/homepage', icon: 'home' }]
  }
})

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}
</script>
