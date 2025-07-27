<template>
  <div class="flex items-center justify-between">
    <!-- Left side - Title and optional back button -->
    <div class="flex items-center space-x-2">
      <!-- Back Button -->
      <button
        v-if="showBackButton"
        @click="handleBackClick"
        :disabled="backDisabled"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-9 px-3"
        :class="backButtonClass"
      >
        <FontAwesomeIcon icon="arrow-left" class="w-4 h-4 mr-1" />
        {{ backText }}
      </button>

      <!-- Title Section -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
        <p v-if="subtitle" class="text-gray-600 mt-1">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Right side - Actions -->
    <div v-if="$slots.actions || primaryAction" class="flex items-center space-x-2">
      <slot name="actions">
        <!-- Primary Action Button -->
        <button
          v-if="primaryAction"
          @click="handlePrimaryAction"
          :disabled="primaryAction.disabled"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2"
          :class="getPrimaryActionClass()"
        >
          <FontAwesomeIcon
            v-if="primaryAction.icon"
            :icon="primaryAction.icon"
            class="w-4 h-4 mr-2"
          />
          {{
            primaryAction.loading ? primaryAction.loadingText || 'Loading...' : primaryAction.text
          }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface PrimaryAction {
  text: string
  icon?: any
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  variant?: 'primary' | 'secondary' | 'danger'
  onClick?: () => void
}

interface Props {
  // Content
  title: string
  subtitle?: string

  // Back button
  showBackButton?: boolean
  backText?: string
  backDisabled?: boolean
  backButtonClass?: string

  // Primary action
  primaryAction?: PrimaryAction
}

const props = withDefaults(defineProps<Props>(), {
  showBackButton: false,
  backText: 'Back',
  backDisabled: false,
  backButtonClass: '',
})

const emit = defineEmits<{
  back: []
  primaryAction: []
}>()

// Methods
const handleBackClick = () => {
  emit('back')
}

const handlePrimaryAction = () => {
  if (props.primaryAction?.onClick) {
    props.primaryAction.onClick()
  } else {
    emit('primaryAction')
  }
}

const getPrimaryActionClass = (): string => {
  const variant = props.primaryAction?.variant || 'primary'

  const classes = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  return classes[variant]
}
</script>
