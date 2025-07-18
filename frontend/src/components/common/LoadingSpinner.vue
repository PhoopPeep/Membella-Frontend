<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div class="flex flex-col items-center space-y-3">
      <!-- Spinner -->
      <div class="relative">
        <div class="animate-spin rounded-full border-b-2" :class="[spinnerClass, sizeClass]"></div>
        <div
          v-if="showProgress && progress > 0"
          class="absolute inset-0 flex items-center justify-center"
        >
          <span class="text-xs font-medium" :class="textClass"> {{ Math.round(progress) }}% </span>
        </div>
      </div>

      <!-- Loading Text -->
      <div v-if="text" class="text-center">
        <p class="font-medium" :class="textClass">{{ text }}</p>
        <p v-if="subtitle" class="text-sm text-gray-500 mt-1">{{ subtitle }}</p>
      </div>

      <!-- Progress Bar -->
      <div v-if="showProgress && progress > 0" class="w-full max-w-xs">
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-300 ease-out"
            :class="progressBarClass"
            :style="{ width: `${Math.min(progress, 100)}%` }"
          ></div>
        </div>
      </div>

      <!-- Estimated Time -->
      <div v-if="estimatedTime && estimatedTime > 0" class="text-xs text-gray-400">
        <Clock class="w-3 h-3 inline mr-1" />
        ~{{ formatTime(estimatedTime) }} remaining
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Clock } from 'lucide-vue-next'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray'
  text?: string
  subtitle?: string
  fullScreen?: boolean
  progress?: number // 0-100
  showProgress?: boolean
  estimatedTime?: number // in seconds
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'blue',
  fullScreen: false,
  progress: 0,
  showProgress: false,
  estimatedTime: 0,
})

// Computed properties
const containerClass = computed(() => {
  return props.fullScreen ? 'min-h-screen w-full' : 'py-8'
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-4 h-4'
    case 'md':
      return 'w-8 h-8'
    case 'lg':
      return 'w-12 h-12'
    case 'xl':
      return 'w-16 h-16'
    default:
      return 'w-8 h-8'
  }
})

const spinnerClass = computed(() => {
  switch (props.color) {
    case 'blue':
      return 'border-blue-600'
    case 'green':
      return 'border-green-600'
    case 'red':
      return 'border-red-600'
    case 'yellow':
      return 'border-yellow-600'
    case 'gray':
      return 'border-gray-600'
    default:
      return 'border-blue-600'
  }
})

const textClass = computed(() => {
  switch (props.color) {
    case 'blue':
      return 'text-blue-700'
    case 'green':
      return 'text-green-700'
    case 'red':
      return 'text-red-700'
    case 'yellow':
      return 'text-yellow-700'
    case 'gray':
      return 'text-gray-700'
    default:
      return 'text-blue-700'
  }
})

const progressBarClass = computed(() => {
  switch (props.color) {
    case 'blue':
      return 'bg-blue-600'
    case 'green':
      return 'bg-green-600'
    case 'red':
      return 'bg-red-600'
    case 'yellow':
      return 'bg-yellow-600'
    case 'gray':
      return 'bg-gray-600'
    default:
      return 'bg-blue-600'
  }
})

// Methods
const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
}
</script>
