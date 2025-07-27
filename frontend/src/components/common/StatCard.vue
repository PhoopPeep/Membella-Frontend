<template>
  <div class="rounded-lg border bg-white shadow-sm" :class="cardClass">
    <div class="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
      <h3 class="tracking-tight text-sm font-medium" :class="titleClass">
        {{ title }}
      </h3>
      <FontAwesomeIcon v-if="icon" :icon="icon" class="h-4 w-4" :class="iconClass" />
    </div>
    <div class="p-6 pt-0">
      <div class="text-2xl font-bold" :class="valueClass">
        <slot name="value">
          <span v-if="prefix">{{ prefix }}</span>
          {{ formattedValue }}
          <span v-if="suffix">{{ suffix }}</span>
        </slot>
      </div>
      <p class="text-xs" :class="descriptionClass">
        <slot name="description">{{ description }}</slot>
      </p>

      <!-- Trend indicator -->
      <div v-if="trend !== undefined || $slots.trend" class="flex items-center mt-2">
        <slot name="trend">
          <div v-if="trend !== undefined" class="flex items-center space-x-1">
            <FontAwesomeIcon :icon="getTrendIcon()" :class="['w-3 h-3', getTrendColor()]" />
            <span :class="['text-xs font-medium', getTrendColor()]"> {{ Math.abs(trend) }}% </span>
            <span class="text-xs text-gray-500">
              {{ trendLabel }}
            </span>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // Content
  title: string
  value: string | number
  description?: string
  icon?: string

  // Formatting
  prefix?: string
  suffix?: string
  formatValue?: (value: string | number) => string

  // Trend
  trend?: number // Percentage change
  trendLabel?: string

  // Styling
  cardClass?: string
  titleClass?: string
  valueClass?: string
  descriptionClass?: string
  iconClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  cardClass: '',
  titleClass: '',
  valueClass: '',
  descriptionClass: 'text-gray-500',
  iconClass: 'text-gray-500',
  trendLabel: 'from last period',
})

// Computed
const formattedValue = computed(() => {
  if (props.formatValue) {
    return props.formatValue(props.value)
  }

  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }

  return props.value
})

// Methods
const getTrendIcon = (): string => {
  if (props.trend === undefined) return 'minus'
  if (props.trend > 0) return 'arrow-up'
  if (props.trend < 0) return 'arrow-down'
  return 'minus'
}

const getTrendColor = (): string => {
  if (props.trend === undefined) return 'text-gray-500'
  if (props.trend > 0) return 'text-green-600'
  if (props.trend < 0) return 'text-red-600'
  return 'text-gray-500'
}
</script>
