<template>
  <nav class="bg-white shadow-sm border-b border-gray-200 fixed top-0 w-full z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <router-link to="/dashboard" class="flex items-center space-x-3">
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
          <div v-if="authStore.isAuthenticated">
            <!-- Profile Dropdown for authenticated users -->
            <div class="relative" ref="dropdownRef">
              <button
                @click="toggleDropdown"
                class="flex items-center space-x-2 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2"
              >
                <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon="user" class="w-4 h-4 text-gray-600" />
                </div>
                <span class="hidden sm:block text-sm font-medium">{{ authStore.user?.email }}</span>
                <FontAwesomeIcon icon="chevron-down" class="w-3 h-3" />
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="showDropdown"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="closeDropdown"
                >
                  <FontAwesomeIcon icon="user" class="w-4 h-4 mr-2" />
                  Profile
                </router-link>
                <router-link
                  to="/subscription"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="closeDropdown"
                >
                  <FontAwesomeIcon icon="credit-card" class="w-4 h-4 mr-2" />
                  Subscription
                </router-link>
                <hr class="my-1" />
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <FontAwesomeIcon icon="sign-out-alt" class="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
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
              Subscription
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
              Subscription
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
            <button
              @click="handleLogout"
              class="text-red-600 hover:text-red-700 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
            >
              <FontAwesomeIcon icon="sign-out-alt" class="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const showDropdown = ref(false)
const showMobileMenu = ref(false)
const dropdownRef = ref<HTMLElement>()

// Dynamic navigation items based on auth status
const navigationItems = computed(() => {
  const baseItems = [
    { name: 'Homepage', href: '/dashboard', icon: 'home' },
    { name: 'Search Plan', href: '/browse', icon: 'search' },
  ]
  return baseItems
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const handleLogout = async () => {
  authStore.clearAuth()
  await router.push('/dashboard')
  closeMobileMenu()
  closeDropdown()
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
