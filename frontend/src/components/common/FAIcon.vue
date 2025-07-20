<template>
  <FontAwesomeIcon
    :icon="iconName"
    :size="size"
    :style="{ color: color }"
    :class="className"
    :spin="spin"
    :pulse="pulse"
    :rotation="rotation"
    :flip="flip"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon: string
  size?: 'xs' | 'sm' | 'lg' | 'xl' | '2xl' | '1x' | '2x' | '3x' | '4x' | '5x' | '6x' | '7x' | '8x' | '9x' | '10x'
  color?: string
  className?: string
  spin?: boolean
  pulse?: boolean
  rotation?: 90 | 180 | 270
  flip?: 'horizontal' | 'vertical' | 'both'
}

const props = withDefaults(defineProps<Props>(), {
  size: '1x',
  color: 'currentColor',
  className: '',
  spin: false,
  pulse: false
})

// Map icon names from Lucide-style to Font Awesome
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
  DollarSign: 'dollar-sign',
  CreditCard: 'credit-card',
  TrendingUp: 'chart-line',
  TrendingDown: 'chart-line-down',

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

  // Math & Misc
  Minus: 'minus',

  // Custom mappings for better Font Awesome alternatives
  Trash: 'trash-alt',
  Cog: 'cogs',
  Home: 'home',
  Search: 'search',
  Download: 'download',
  Upload: 'upload',
  Heart: 'heart',
  Star: 'star',
  Bookmark: 'bookmark',
  Tag: 'tag',
  Flag: 'flag',
}

const iconName = computed(() => {
  const mappedIcon = iconMap[props.icon]

  // If it's an array (for brands), return as is
  if (Array.isArray(mappedIcon)) {
    return mappedIcon
  }

  // Return mapped icon or fallback to database
  return mappedIcon || iconMap.Database || 'database'
})
</script>
