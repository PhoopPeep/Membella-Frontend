<template>
  <FontAwesomeIcon
    :icon="iconName"
    :class="className"
    :style="{
      fontSize: typeof size === 'number' ? `${size}px` : size,
      color: color,
    }"
    :spin="spin"
    :pulse="pulse"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon?: string | any
  size?: number | string
  color?: string
  className?: string
  spin?: boolean
  pulse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'database',
  size: 16,
  color: 'currentColor',
  className: '',
  spin: false,
  pulse: false,
})

// Convert icon to FontAwesome icon name
const iconName = computed(() => {
  if (typeof props.icon === 'string') {
    const iconMap: Record<string, string> = {
      // Core actions
      Plus: 'plus',
      Eye: 'eye',
      Edit: 'edit',
      Trash2: 'trash',
      Settings: 'cog',
      ArrowLeft: 'arrow-left',
      Database: 'database',

      // Financial & Business
      BahtSign: 'baht-sign',
      CreditCard: 'credit-card',
      TrendingUp: 'arrow-up',
      TrendingDown: 'arrow-down',

      // Users & People
      Users: 'users',
      User: 'user',

      // Communication
      Mail: 'envelope',
      Phone: 'phone',
      Globe: 'globe',

      // Location & Building
      Building: 'building',
      MapPin: 'map-marker-alt',

      // Time & Calendar
      Calendar: 'calendar',
      Clock: 'clock',

      // Security
      Lock: 'lock',
      LogOut: 'sign-out-alt',

      // Media
      Camera: 'camera',

      // Navigation
      Menu: 'bars',
      ChevronRight: 'chevron-right',

      // Status & Feedback
      CheckCircle: 'check-circle',
      AlertCircle: 'exclamation-circle',
      AlertTriangle: 'exclamation-triangle',

      // Math & Misc
      Minus: 'minus',
      X: 'times',

      // Convert kebab-case to match our mapping
      plus: 'plus',
      eye: 'eye',
      edit: 'edit',
      trash: 'trash',
      settings: 'cog',
      'arrow-left': 'arrow-left',
      database: 'database',
      'baht-sign': 'baht-sign',
      'credit-card': 'credit-card',
      users: 'users',
      user: 'user',
      envelope: 'envelope',
      phone: 'phone',
      globe: 'globe',
      building: 'building',
      calendar: 'calendar',
      clock: 'clock',
      lock: 'lock',
      camera: 'camera',
      bars: 'bars',
      'chevron-right': 'chevron-right',
      'check-circle': 'check-circle',
      'exclamation-circle': 'exclamation-circle',
      'exclamation-triangle': 'exclamation-triangle',
      minus: 'minus',
      times: 'times',
    }

    return iconMap[props.icon] || iconMap[props.icon.toLowerCase()] || 'database'
  }

  // If it's a component object, try to get name
  if (props.icon && typeof props.icon === 'object') {
    if (props.icon.name) return props.icon.name.toLowerCase()
    if (props.icon.__name) return props.icon.__name.toLowerCase()
    if (props.icon.displayName) return props.icon.displayName.toLowerCase()
  }

  return 'database'
})
</script>
