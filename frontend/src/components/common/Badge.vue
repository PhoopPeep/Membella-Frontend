<template>
  <span
    :class="[
      'inline-flex items-center font-medium rounded-full transition-colors',
      getSizeClass(),
      getVariantClass(),
      className,
    ]"
  >
    <FontAwesomeIcon v-if="icon" :icon="icon" :class="getIconSizeClass()" />
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup lang="ts">
import { useSlots } from 'vue'

const slots = useSlots()

interface Props {
  // Content
  text?: string
  icon?: any

  // Styling
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'xs' | 'sm' | 'md' | 'lg'

  // Custom class
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'sm',
  className: '',
})

// Methods
const getSizeClass = (): string => {
  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  }

  return sizes[props.size]
}

const getVariantClass = (): string => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border border-gray-200',
    primary: 'bg-blue-100 text-blue-800 border border-blue-200',
    secondary: 'bg-gray-100 text-gray-800 border border-gray-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
  }

  return variants[props.variant]
}

const getIconSizeClass = (): string => {
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const marginClass = props.text || slots.default ? 'mr-1' : ''

  return `${iconSizes[props.size]} ${marginClass}`
}
</script>
