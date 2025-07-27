<template>
  <div class="flex space-x-2" :class="containerClass">
    <button
      v-for="action in actions"
      :key="action.key"
      @click="handleActionClick(action)"
      :disabled="action.disabled || action.loading"
      :title="action.tooltip"
      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      :class="[getButtonClass(action.variant, action.size), action.className || '']"
    >
      <!-- Loading state -->
      <div v-if="action.loading" class="flex items-center">
        <div
          class="animate-spin rounded-full border-b-2 mr-2"
          :class="getSpinnerClass(action.size)"
        ></div>
        {{ action.loadingText || 'Loading...' }}
      </div>

      <!-- Normal state -->
      <template v-else>
        <FontAwesomeIcon
          v-if="action.icon"
          :icon="action.icon"
          :class="getIconClass(action.size, !!action.text)"
        />
        <span v-if="action.text">{{ action.text }}</span>
      </template>
    </button>
  </div>
</template>

<script setup lang="ts">
export interface ActionButton {
  key: string
  text?: string
  icon?: any
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  tooltip?: string
  className?: string
  onClick?: () => void
}

interface Props {
  actions: ActionButton[]
  containerClass?: string
  justify?: 'start' | 'center' | 'end'
}

const props = withDefaults(defineProps<Props>(), {
  containerClass: '',
  justify: 'end',
})

const emit = defineEmits<{
  action: [action: ActionButton]
}>()

// Methods
const handleActionClick = (action: ActionButton) => {
  if (action.onClick) {
    action.onClick()
  } else {
    emit('action', action)
  }
}

const getButtonClass = (variant: string = 'secondary', size: string = 'md'): string => {
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 py-3',
  }

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'hover:bg-gray-100 text-gray-700',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700',
  }

  return `${sizeClasses[size as keyof typeof sizeClasses]} ${variantClasses[variant as keyof typeof variantClasses]}`
}

const getIconClass = (size: string = 'md', hasText: boolean = false): string => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const marginClass = hasText ? 'mr-2' : ''

  return `${sizeClasses[size as keyof typeof sizeClasses]} ${marginClass}`
}

const getSpinnerClass = (size: string = 'md'): string => {
  const sizeClasses = {
    sm: 'h-3 w-3 border-white',
    md: 'h-4 w-4 border-white',
    lg: 'h-5 w-5 border-white',
  }

  return sizeClasses[size as keyof typeof sizeClasses]
}
</script>
