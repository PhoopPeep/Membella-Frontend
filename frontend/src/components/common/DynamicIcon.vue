<template>
  <FAIcon
    :icon="iconName || 'Database'"
    :size="faSize"
    :color="color"
    :class="className"
    :spin="spin"
    :pulse="pulse"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FAIcon from './FAIcon.vue'

interface Props {
  icon?: string | any
  size?: number | string
  color?: string
  className?: string
  spin?: boolean
  pulse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'Database',
  size: 16,
  color: 'currentColor',
  className: '',
  spin: false,
  pulse: false
})

// Convert icon to string
const iconName = computed(() => {
  if (typeof props.icon === 'string') {
    return props.icon
  }

  // If it's a Lucide component object, try to get name
  if (props.icon && typeof props.icon === 'object') {
    if (props.icon.name) return props.icon.name
    if (props.icon.__name) return props.icon.__name
    if (props.icon.displayName) return props.icon.displayName
  }

  return 'Database'
})

// Convert pixel size to Font Awesome size
const faSize = computed(() => {
  const sizeNum = typeof props.size === 'number' ? props.size : parseInt(props.size as string) || 16

  if (sizeNum <= 10) return 'xs'
  if (sizeNum <= 14) return 'sm'
  if (sizeNum <= 18) return '1x'
  if (sizeNum <= 24) return 'lg'
  if (sizeNum <= 32) return 'xl'
  if (sizeNum <= 48) return '2xl'
  if (sizeNum <= 64) return '2x'
  if (sizeNum <= 96) return '3x'
  return '4x'
})
</script>
