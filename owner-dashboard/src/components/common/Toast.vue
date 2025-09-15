<!-- Toast.vue -->
<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="show" class="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div
        class="rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
        :class="toastClasses"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <FontAwesomeIcon :icon="icon" class="h-6 w-6" :class="iconClasses" />
            </div>
            <div class="ml-3 w-0 flex-1">
              <p class="text-sm font-medium" :class="titleClasses">
                {{ title }}
              </p>
              <p v-if="message" class="mt-1 text-sm" :class="messageClasses">
                {{ message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="close"
                class="rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2"
                :class="closeButtonClasses"
              >
                <span class="sr-only">Close</span>
                <FontAwesomeIcon icon="times" class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

interface Props {
  show: boolean
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 5000,
})

const emit = defineEmits<{
  close: []
}>()

const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return 'check-circle'
    case 'error':
      return 'exclamation-circle'
    case 'warning':
      return 'exclamation-triangle'
    case 'info':
      return 'information-circle'
    default:
      return 'information-circle'
  }
})

const toastClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-success-50 border border-success-200'
    case 'error':
      return 'bg-error-50 border border-error-200'
    case 'warning':
      return 'bg-warning-50 border border-warning-200'
    case 'info':
      return 'bg-primary-50 border border-primary-200'
    default:
      return 'bg-primary-50 border border-primary-200'
  }
})

const iconClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-success-500'
    case 'error':
      return 'text-error-500'
    case 'warning':
      return 'text-warning-500'
    case 'info':
      return 'text-primary-500'
    default:
      return 'text-primary-500'
  }
})

const titleClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-success-800'
    case 'error':
      return 'text-error-800'
    case 'warning':
      return 'text-warning-800'
    case 'info':
      return 'text-primary-800'
    default:
      return 'text-primary-800'
  }
})

const messageClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-success-700'
    case 'error':
      return 'text-error-700'
    case 'warning':
      return 'text-warning-700'
    case 'info':
      return 'text-primary-700'
    default:
      return 'text-primary-700'
  }
})

const closeButtonClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-success-400 hover:text-success-500 focus:ring-success-500'
    case 'error':
      return 'text-error-400 hover:text-error-500 focus:ring-error-500'
    case 'warning':
      return 'text-warning-400 hover:text-warning-500 focus:ring-warning-500'
    case 'info':
      return 'text-primary-400 hover:text-primary-500 focus:ring-primary-500'
    default:
      return 'text-primary-400 hover:text-primary-500 focus:ring-primary-500'
  }
})

const close = () => {
  emit('close')
}
</script>

<script lang="ts">
export default {
  name: 'Toast',
}
</script>
