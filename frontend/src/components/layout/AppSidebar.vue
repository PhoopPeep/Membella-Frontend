<template>
  <aside class="border-r border-gray-200 w-64 bg-white flex flex-col h-full">
    <!-- Sidebar Header -->
    <div class="p-6">
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-sm">
            {{ getInitials(authStore.user?.org_name || 'ORG') }}
          </span>
        </div>
        <div>
          <h2 class="font-semibold text-gray-900">
            {{ authStore.user?.org_name || 'Organization' }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ authStore.user?.email || 'user@example.com' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Sidebar Content -->
    <div class="flex-1 px-4">
      <div class="mb-4">
        <h3 class="px-2 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</h3>
        <nav class="space-y-1">
          <router-link
            v-for="item in menuItems"
            :key="item.title"
            :to="item.url"
            class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200"
            :class="
              isActive(item.url)
                ? 'bg-blue-50 text-blue-700 border-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            "
          >
            <component :is="item.icon" class="w-4 h-4 mr-3" />
            <span>{{ item.title }}</span>
          </router-link>
        </nav>
      </div>
    </div>

    <!-- Sidebar Footer -->
    <div class="p-4">
      <button
        @click="handleLogout"
        :disabled="isLoggingOut"
        class="w-full flex items-center justify-start px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:text-red-700 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
      >
        <LogOut class="w-4 h-4 mr-2" />
        {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LayoutDashboard, CreditCard, Settings, User, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isLoggingOut = ref(false)

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Plan Management',
    url: '/plans',
    icon: CreditCard,
  },
  {
    title: 'Features',
    url: '/features',
    icon: Settings,
  },
  {
    title: 'Profile',
    url: '/profile',
    icon: User,
  },
]

const isActive = (url: string) => {
  return route.path === url
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const handleLogout = async () => {
  try {
    isLoggingOut.value = true

    // Clear authentication state
    authStore.clearAuth()

    // Add a small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Redirect to login
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    isLoggingOut.value = false
  }
}
</script>
