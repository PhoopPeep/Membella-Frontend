<!-- ErrorModal.vue -->
<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
    >
      <div
        class="relative top-20 mx-auto p-8 border w-11/12 max-w-lg shadow-2xl rounded-2xl bg-white"
      >
        <div class="mt-3">
          <!-- Icon -->
          <div
            class="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-error-100"
          >
            <FontAwesomeIcon icon="exclamation-triangle" class="h-8 w-8 text-error-500" />
          </div>

          <!-- Content -->
          <div class="text-center">
            <h3 class="text-xl font-bold text-error-800 mb-4">
              {{ title }}
            </h3>

            <div class="mt-2 px-4 py-3">
              <p class="text-sm text-error-700 mb-4">
                {{ message }}
              </p>

              <!-- Details section -->
              <div v-if="details" class="text-left bg-error-50 rounded-lg p-4 mb-4">
                <h4 class="text-sm font-semibold text-error-800 mb-2">Details:</h4>
                <p class="text-sm text-error-700">{{ details }}</p>
              </div>

              <!-- Active members list -->
              <div
                v-if="activeMembers && activeMembers.length > 0"
                class="text-left bg-warning-50 rounded-lg p-4 mb-4"
              >
                <h4 class="text-sm font-semibold text-warning-800 mb-2">
                  Active Members ({{ activeMembers.length }}):
                </h4>
                <div class="space-y-2">
                  <div
                    v-for="(member, index) in activeMembers"
                    :key="index"
                    class="flex items-center justify-between bg-white rounded-lg p-2 border border-warning-200"
                  >
                    <div>
                      <p class="text-sm font-medium text-warning-800">{{ member.name }}</p>
                      <p class="text-xs text-warning-600">{{ member.email }}</p>
                    </div>
                    <FontAwesomeIcon icon="user" class="h-4 w-4 text-warning-500" />
                  </div>
                </div>
              </div>

              <!-- Suggestions -->
              <div
                v-if="suggestions && suggestions.length > 0"
                class="text-left bg-primary-50 rounded-lg p-4"
              >
                <h4 class="text-sm font-semibold text-primary-800 mb-2">What you can do:</h4>
                <ul class="text-sm text-primary-700 space-y-1">
                  <li
                    v-for="(suggestion, index) in suggestions"
                    :key="index"
                    class="flex items-start"
                  >
                    <FontAwesomeIcon
                      icon="check"
                      class="h-3 w-3 text-primary-500 mt-1 mr-2 flex-shrink-0"
                    />
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-3 px-4 py-3">
              <button
                v-if="showCancel"
                @click="cancel"
                class="flex-1 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                {{ cancelText }}
              </button>
              <button
                @click="confirm"
                class="flex-1 px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                :class="confirmButtonClass"
              >
                {{ confirmText }}
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

interface ActiveMember {
  name: string
  email: string
}

interface Props {
  show: boolean
  title: string
  message: string
  details?: string
  activeMembers?: ActiveMember[]
  suggestions?: string[]
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  type?: 'error' | 'warning'
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'OK',
  cancelText: 'Cancel',
  showCancel: false,
  type: 'error',
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'error':
      return 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500'
    case 'warning':
      return 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500'
    default:
      return 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500'
  }
})

const confirm = () => {
  emit('confirm')
}

const cancel = () => {
  emit('cancel')
}
</script>

<script lang="ts">
export default {
  name: 'ErrorModal',
}
</script>
