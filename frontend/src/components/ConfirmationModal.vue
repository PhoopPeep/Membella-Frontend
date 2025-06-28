<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
    <div class="relative mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Icon -->
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4"
             :class="iconBgClass">
          <component :is="icon" class="h-6 w-6" :class="iconClass" />
        </div>

        <!-- Content -->
        <div class="text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">
            {{ title }}
          </h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              {{ message }}
            </p>
            <p v-if="itemName" class="text-sm font-medium text-gray-900 mt-2">
              "{{ itemName }}"
            </p>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-3 px-4 py-3">
            <button
              @click="cancel"
              :disabled="loading"
              class="flex-1 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ cancelText }}
            </button>
            <button
              @click="confirm"
              :disabled="loading"
              class="flex-1 px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :class="confirmButtonClass"
            >
              <div v-if="loading" class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {{ loadingText }}
              </div>
              <span v-else>{{ confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, Trash2, LogOut, AlertCircle } from 'lucide-vue-next'

interface Props {
  show: boolean
  type?: 'danger' | 'warning' | 'info'
  title: string
  message: string
  itemName?: string
  confirmText?: string
  cancelText?: string
  loadingText?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'danger',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loadingText: 'Processing...',
  loading: false
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const icon = computed(() => {
  switch (props.type) {
    case 'danger':
      return Trash2
    case 'warning':
      return AlertTriangle
    case 'info':
      return AlertCircle
    default:
      return AlertTriangle
  }
})

const iconBgClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-100'
    case 'warning':
      return 'bg-yellow-100'
    case 'info':
      return 'bg-blue-100'
    default:
      return 'bg-red-100'
  }
})

const iconClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'text-red-600'
    case 'warning':
      return 'text-yellow-600'
    case 'info':
      return 'text-blue-600'
    default:
      return 'text-red-600'
  }
})

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    case 'warning':
      return 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
    case 'info':
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
    default:
      return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
})

const confirm = () => {
  emit('confirm')
}

const cancel = () => {
  emit('cancel')
}
</script>
