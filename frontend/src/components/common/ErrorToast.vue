<template>
  <!-- Toast Container -->
  <Teleport to="body">
    <div v-if="show" class="fixed top-4 right-4 z-50 max-w-sm w-full" :class="containerClass">
      <div
        class="bg-white rounded-lg border shadow-lg overflow-hidden transition-all duration-300 transform"
        :class="[show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0', borderClass]"
      >
        <!-- Toast Header -->
        <div class="flex items-start p-4">
          <div class="flex-shrink-0">
            <FontAwesomeIcon :icon="icon" class="w-5 h-5" :class="iconClass" />
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium" :class="titleClass">
              {{ title }}
            </p>
            <p v-if="message" class="mt-1 text-sm text-gray-600">
              {{ message }}
            </p>

            <!-- Countdown for auto-dismiss -->
            <div v-if="countdown > 0 && type === 'error'" class="mt-2">
              <div class="flex items-center text-xs text-gray-500">
                <FontAwesomeIcon icon="clock" class="w-3 h-3 mr-1" />
                <span>Disappears in {{ countdown }}s</span>
              </div>
              <div class="mt-1 w-full bg-gray-200 rounded-full h-1">
                <div
                  class="bg-red-400 h-1 rounded-full transition-all duration-1000 ease-linear"
                  :style="{ width: `${(countdown / duration) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
          <div class="ml-4 flex-shrink-0">
            <button
              @click="dismiss"
              class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span class="sr-only">Close</span>
              <FontAwesomeIcon icon="times" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

interface Props {
  show: boolean
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number // Auto-dismiss duration in seconds (0 = no auto-dismiss)
  persistent?: boolean // If true, won't auto-dismiss even with duration
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 5,
  persistent: false,
})

const emit = defineEmits<{
  dismiss: []
}>()

const countdown = ref(0)
let countdownTimer: NodeJS.Timeout | null = null
let dismissTimer: NodeJS.Timeout | null = null

// Computed properties for styling
const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return 'check-circle'
    case 'error':
      return 'exclamation-circle'
    case 'warning':
      return 'exclamation-triangle'
    case 'info':
    default:
      return 'info-circle'
  }
})

const containerClass = computed(() => {
  return 'animate-slide-in-right'
})

const borderClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'border-green-200'
    case 'error':
      return 'border-red-200'
    case 'warning':
      return 'border-yellow-200'
    case 'info':
    default:
      return 'border-blue-200'
  }
})

const iconClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-500'
    case 'error':
      return 'text-red-500'
    case 'warning':
      return 'text-yellow-500'
    case 'info':
    default:
      return 'text-blue-500'
  }
})

const titleClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-800'
    case 'error':
      return 'text-red-800'
    case 'warning':
      return 'text-yellow-800'
    case 'info':
    default:
      return 'text-blue-800'
  }
})

// Methods
const dismiss = () => {
  clearTimers()
  emit('dismiss')
}

const clearTimers = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
}

const startCountdown = () => {
  if (props.persistent || props.duration <= 0) return

  countdown.value = props.duration

  // Start countdown timer (updates every second)
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearTimers()
    }
  }, 1000)

  // Set dismiss timer
  dismissTimer = setTimeout(() => {
    dismiss()
  }, props.duration * 1000)
}

// Watch for show changes
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      startCountdown()
    } else {
      clearTimers()
    }
  },
  { immediate: true },
)

// Cleanup on unmount
onUnmounted(() => {
  clearTimers()
})
</script>

<style>
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
</style>
