<template>
  <aside
    :class="[
      'border-r border-gray-200 bg-white flex flex-col h-full transition-all duration-300 ease-in-out',
      isCollapsed ? 'w-16' : 'w-64'
    ]"
  >
    <!-- Sidebar Header -->
    <div class="p-6 border-b border-gray-100">
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span class="text-white font-bold text-sm">M</span>
        </div>
        <Transition name="fade">
          <div v-show="!isCollapsed" class="min-w-0">
            <h2 class="font-semibold text-gray-900 truncate">Membella</h2>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Toggle Button -->
    <div class="px-4 py-2 border-b border-gray-100">
      <button
        @click="toggleSidebar"
        class="w-full flex items-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        :class="isCollapsed ? 'justify-center' : 'justify-start'"
        :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <Menu class="w-4 h-4" />
        <Transition name="fade">
          <span v-show="!isCollapsed" class="ml-2 text-sm">Collapse</span>
        </Transition>
      </button>
    </div>

    <!-- Sidebar Content -->
    <div class="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
      <!-- Menu Group -->
      <div class="mb-6">
        <Transition name="fade">
          <div v-show="!isCollapsed" class="px-2 mb-2">
            <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</h3>
          </div>
        </Transition>
        <nav class="space-y-1">
          <router-link
            v-for="item in menuItems"
            :key="item.title"
            :to="item.url"
            class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 relative"
            :class="[
              isActive(item.url)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              isCollapsed ? 'justify-center' : 'justify-start'
            ]"
            active-class="bg-blue-50 text-blue-700"
          >
            <!-- Active indicator -->
            <div
              v-if="isActive(item.url)"
              class="absolute right-0 top-0 bottom-0 w-0.5 bg-blue-700"
            ></div>

            <component
              :is="item.icon"
              :class="[
                'flex-shrink-0 transition-colors',
                isActive(item.url) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500',
                isCollapsed ? 'w-5 h-5' : 'w-4 h-4'
              ]"
            />
            <Transition name="fade">
              <span
                v-show="!isCollapsed"
                class="ml-3"
              >
                {{ item.title }}
              </span>
            </Transition>

            <!-- Tooltip for collapsed state -->
            <Transition name="tooltip">
              <div
                v-if="isCollapsed && isHovered === item.title"
                class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-50"
              >
                {{ item.title }}
                <div class="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-2 border-b-2 border-r-2 border-transparent border-r-gray-900"></div>
              </div>
            </Transition>
          </router-link>
        </nav>
      </div>
    </div>

    <!-- Sidebar Footer -->
    <div class="p-4 border-t border-gray-100">
      <!-- Profile Section (when expanded) -->
      <Transition name="fade">
        <div
          v-if="!isCollapsed"
          @click="handleProfileClick"
          class="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors mb-3 group"
        >
          <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              v-if="authStore.user?.logo"
              :src="authStore.user.logo"
              :alt="authStore.user.org_name"
              class="w-full h-full object-cover"
            />
            <User v-else class="w-4 h-4 text-gray-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">Profile</p>
            <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
          </div>
          <ChevronRight class="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        </div>
      </Transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  User,
  Menu,
  ChevronRight
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Sidebar state
const isCollapsed = ref(false)
const isHovered = ref<string | null>(null)

// Menu items configuration
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
]

// Methods
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value

  // Save preference to localStorage
  localStorage.setItem('sidebarCollapsed', isCollapsed.value.toString())
}

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

const handleProfileClick = () => {
  router.push('/profile')
}

// Initialize sidebar state from localStorage
const initSidebarState = () => {
  const saved = localStorage.getItem('sidebarCollapsed')
  if (saved !== null) {
    isCollapsed.value = saved === 'true'
  }
}

// Mouse event handlers for tooltips
const handleMouseEnter = (itemTitle: string) => {
  if (isCollapsed.value) {
    isHovered.value = itemTitle
  }
}

const handleMouseLeave = () => {
  isHovered.value = null
}

// Add mouse event listeners to menu items
const addTooltipListeners = () => {
  menuItems.forEach(item => {
    // These will be handled in template with @mouseenter/@mouseleave
  })
}

// Initialize on component mount
onMounted(() => {
  initSidebarState()
})
</script>

<style scoped>
/* Custom scrollbar for webkit browsers */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}

/* Smooth transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Tooltip transitions */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>