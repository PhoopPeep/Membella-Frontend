<template>
  <div
    class="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-primary-200"
  >
    <!-- Left side - Title and optional back button -->
    <div class="flex items-center space-x-4">
      <!-- Back Button -->
      <button
        v-if="showBackButton"
        @click="handleBackClick"
        :disabled="backDisabled"
        class="inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-primary-200 bg-white/80 hover:bg-primary-50 hover:border-primary-300 h-10 px-4 text-neutral-700 hover:text-primary-700"
        :class="backButtonClass"
      >
        <FontAwesomeIcon icon="arrow-left" class="w-4 h-4 mr-2" />
        {{ backText }}
      </button>

      <!-- Title Section -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-neutral-800">{{ title }}</h1>
        <p v-if="subtitle" class="text-neutral-600 mt-1 font-medium">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Right side - Actions -->
    <div v-if="$slots.actions || primaryAction" class="flex items-center space-x-3">
      <slot name="actions">
        <!-- Primary Action Button -->
        <button
          v-if="primaryAction"
          @click="handlePrimaryAction"
          :disabled="primaryAction.disabled"
          class="inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-6 shadow-medium hover:shadow-glow"
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
    primary: 'bg-gradient-primary text-white hover:bg-gradient-secondary',
    secondary:
      'border border-primary-200 bg-white/80 hover:bg-primary-50 text-neutral-700 hover:text-primary-700',
    danger:
      'bg-gradient-to-r from-error-500 to-error-600 text-white hover:from-error-600 hover:to-error-700',
  }

  return classes[variant]
}
</script>
