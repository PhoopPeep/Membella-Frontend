<template>
  <aside
    :class="[
      'relative border-r border-primary-200 bg-white/80 backdrop-blur-sm flex flex-col h-full transition-all duration-300 ease-out shadow-soft',
      isCollapsed ? 'w-16' : 'w-64',
    ]"
  >
    <!-- Sidebar Header -->
    <div class="p-6 border-b border-primary-200 bg-white">
      <div class="flex items-center space-x-3">
        <div
          class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300"
        >
          <span class="text-white font-bold text-lg">M</span>
        </div>
        <Transition name="fade">
          <div v-show="!isCollapsed" class="min-w-0">
            <h2 class="font-bold text-gray-800 text-lg truncate">Membella</h2>
            <p class="text-gray-500 text-xs">Owner Dashboard</p>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Toggle Button -->
    <div class="px-4 py-3 border-b border-primary-200 bg-white">
      <button
        @click="toggleSidebar"
        class="w-full flex items-center p-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 group"
        :class="isCollapsed ? 'justify-center' : 'justify-start'"
        :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <FontAwesomeIcon icon="bars" class="w-4 h-4 group-hover:scale-110 transition-transform" />
        <Transition name="fade">
          <span v-show="!isCollapsed" class="ml-3 text-sm font-medium">Collapse</span>
        </Transition>
      </button>
    </div>

    <!-- Sidebar Content -->
    <div class="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
      <!-- Menu Group -->
      <div class="mb-8">
        <Transition name="fade">
          <div v-show="!isCollapsed" class="px-3 mb-4">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</h3>
          </div>
        </Transition>
        <nav class="space-y-2">
          <router-link
            v-for="item in menuItems"
            :key="item.title"
            :to="item.url"
            class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden"
            :class="[
              isActive(item.url)
                ? 'text-primary-700 bg-primary-50 shadow-soft'
                : 'text-gray-600 hover:text-primary-700',
              isCollapsed ? 'justify-center' : 'justify-start',
            ]"
            active-class="text-primary-700 bg-primary-50 shadow-soft"
            @mouseenter="handleMouseEnter(item.title)"
            @mouseleave="handleMouseLeave"
          >
            <!-- Background effect for hover -->
            <div
              v-if="!isActive(item.url)"
              class="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-200 rounded-xl"
            ></div>

            <FontAwesomeIcon
              :icon="item.icon"
              :class="[
                'flex-shrink-0 transition-all duration-200 relative z-10 group-hover:scale-110',
                isActive(item.url)
                  ? 'text-primary-700'
                  : 'text-gray-500 group-hover:text-primary-700',
                isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
              ]"
            />
            <Transition name="fade">
              <span v-show="!isCollapsed" class="ml-3 relative z-10">
                {{ item.title }}
              </span>
            </Transition>

            <!-- Tooltip for collapsed state -->
            <Transition name="tooltip">
              <div
                v-if="isCollapsed && isHovered === item.title"
                class="absolute left-full ml-3 px-3 py-2 bg-neutral-800 text-white text-xs rounded-lg shadow-strong whitespace-nowrap z-50 backdrop-blur-sm"
              >
                {{ item.title }}
                <div
                  class="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-2 border-b-2 border-r-2 border-transparent border-r-neutral-800"
                ></div>
              </div>
            </Transition>
          </router-link>
        </nav>
      </div>
    </div>

    <!-- Sidebar Footer -->
    <div class="p-4 border-t border-primary-200 bg-white">
      <!-- Profile Section (when expanded) -->
      <Transition name="fade">
        <div
          v-if="!isCollapsed"
          @click="handleProfileClick"
          class="flex items-center space-x-3 cursor-pointer text-gray-600 hover:text-primary-700 p-3 rounded-xl transition-all duration-200 mb-3 group relative overflow-hidden"
          :class="isActive('/profile') ? 'text-primary-700 bg-primary-50 shadow-soft' : ''"
        >
          <!-- Background effect for hover -->
          <div
            v-if="!isActive('/profile')"
            class="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-200 rounded-xl"
          ></div>

          <!-- Profile Image with improved loading -->
          <div
            class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 relative shadow-md group-hover:shadow-medium transition-all duration-200"
          >
            <!-- Loading State -->
            <div
              v-if="isImageLoading"
              class="absolute inset-0 flex items-center justify-center bg-primary-100"
            >
              <div
                class="animate-spin rounded-full h-4 w-4 border-2 border-primary-200 border-t-primary-500"
              ></div>
            </div>

            <!-- Profile Image -->
            <img
              v-if="profileImageUrl && !imageError"
              :src="profileImageUrl"
              :alt="authStore.user?.org_name || 'Profile'"
              class="w-full h-full object-cover transition-opacity duration-300 rounded-xl"
              :class="{ 'opacity-0': isImageLoading, 'opacity-100': !isImageLoading }"
              @load="onImageLoad"
              @error="onImageError"
              :key="imageKey"
            />

            <!-- Fallback: User Icon or Initials -->
            <div
              v-if="!profileImageUrl || imageError"
              class="w-full h-full flex items-center justify-center bg-secondary-500 text-white rounded-xl"
            >
              <span v-if="authStore.user?.org_name" class="text-sm font-bold">
                {{ getInitials(authStore.user.org_name) }}
              </span>
              <FontAwesomeIcon v-else icon="user" class="w-5 h-5 text-white" />
            </div>
          </div>

          <div class="flex-1 min-w-0 relative z-10">
            <p
              class="text-sm font-semibold truncate group-hover:text-primary-700 transition-colors"
            >
              Profile
            </p>
            <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
          </div>
          <FontAwesomeIcon
            icon="chevron-right"
            class="w-4 h-4 text-gray-400 group-hover:text-primary-700 group-hover:translate-x-1 transition-all relative z-10"
          />
        </div>
      </Transition>

      <!-- Collapsed Profile Icon -->
      <div v-if="isCollapsed" class="flex justify-center">
        <button
          @click="handleProfileClick"
          class="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center overflow-hidden hover:bg-secondary-500 transition-all duration-200 relative shadow-md group-hover:shadow-medium"
          :title="`Profile - ${authStore.user?.email}`"
        >
          <!-- Loading State for collapsed -->
          <div
            v-if="isImageLoading"
            class="absolute inset-0 flex items-center justify-center bg-primary-100 rounded-xl"
          >
            <div
              class="animate-spin rounded-full h-4 w-4 border-2 border-primary-200 border-t-primary-500"
            ></div>
          </div>

          <!-- Profile Image for collapsed -->
          <img
            v-if="profileImageUrl && !imageError"
            :src="profileImageUrl"
            :alt="authStore.user?.org_name || 'Profile'"
            class="w-full h-full object-cover transition-opacity duration-300 rounded-xl"
            :class="{ 'opacity-0': isImageLoading, 'opacity-100': !isImageLoading }"
            @load="onImageLoad"
            @error="onImageError"
            :key="imageKey"
          />

          <!-- Fallback for collapsed -->
          <div
            v-if="!profileImageUrl || imageError"
            class="w-full h-full flex items-center justify-center bg-secondary-500 text-white rounded-xl"
          >
            <span v-if="authStore.user?.org_name" class="text-sm font-bold">
              {{ getInitials(authStore.user.org_name) }}
            </span>
            <FontAwesomeIcon v-else icon="user" class="w-5 h-5 text-white" />
          </div>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Sidebar state
const isCollapsed = ref(false)
const isHovered = ref<string | null>(null)

// Profile image state
const profileImageUrl = ref('')
const isImageLoading = ref(false)
const imageError = ref(false)
const imageKey = ref(0)

// Menu items configuration with Font Awesome icons
const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'home',
  },
  {
    title: 'Plan Management',
    url: '/plans',
    icon: 'credit-card',
  },
  {
    title: 'Features Management',
    url: '/features',
    icon: 'cog',
  },
  {
    title: 'API Keys',
    url: '/api-keys',
    icon: 'key',
  },
]

// Methods - move to before watch
const updateProfileImage = (logoUrl: string | undefined | null = '') => {
  const newUrl = logoUrl ?? ''

  if (newUrl !== profileImageUrl.value) {
    console.log('Sidebar: Updating profile image:', { from: profileImageUrl.value, to: newUrl })

    profileImageUrl.value = newUrl
    imageKey.value++
    isImageLoading.value = !!newUrl
    imageError.value = false
  }
}

const onImageLoad = () => {
  console.log('Sidebar: Profile image loaded successfully')
  isImageLoading.value = false
  imageError.value = false
}

const onImageError = () => {
  console.error('Sidebar: Profile image failed to load:', profileImageUrl.value)
  isImageLoading.value = false
  imageError.value = true
}

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

const handleMouseEnter = (itemTitle: string) => {
  if (isCollapsed.value) {
    isHovered.value = itemTitle
  }
}

const handleMouseLeave = () => {
  isHovered.value = null
}

// Initialize sidebar state from localStorage
const initSidebarState = () => {
  const saved = localStorage.getItem('sidebarCollapsed')
  if (saved !== null) {
    isCollapsed.value = saved === 'true'
  }
}

// Watch for changes in user logo - ย้ายมาหลัง methods
watch(
  () => authStore.user,
  (newUser) => {
    console.log('Sidebar: User changed:', newUser)
    if (newUser && 'logo' in newUser && newUser.logo) {
      updateProfileImage(newUser.logo as string)
    }
  },
  { immediate: true, deep: true },
)

// Initialize on component mount
onMounted(() => {
  console.log('Sidebar: Component mounted')
  initSidebarState()

  // Initialize profile image
  if (authStore.user && 'logo' in authStore.user && authStore.user.logo) {
    updateProfileImage(authStore.user.logo as string)
  }
})
</script>

<style scoped>
/* Custom scrollbar for webkit browsers */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #007bff, #0056b3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #0056b3, #004085);
}

/* Smooth transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide fade transitions */
.slide-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(-20px) scale(0.95);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

/* Tooltip transitions */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-16px) scale(0.9);
}

/* Glass morphism effect */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Enhanced hover effects */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

.group:hover .group-hover\:translate-x-1 {
  transform: translateX(4px);
}
</style>
