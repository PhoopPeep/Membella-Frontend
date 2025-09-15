<template>
  <div
    class="relative overflow-hidden rounded-3xl border border-primary-200/50 bg-white/90 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 group transform hover:scale-105"
    :class="cardClass"
  >
    <!-- Background Gradient -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-white/50 to-secondary-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
    ></div>

    <!-- Top Glow Effect -->
    <div
      class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"
    ></div>

    <div class="relative z-10 p-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3">
          <div
            v-if="icon"
            class="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-glow group-hover:scale-110 transition-all duration-500"
          >
            <FontAwesomeIcon :icon="icon" class="h-7 w-7 text-white" :class="iconClass" />
          </div>
          <div>
            <h3
              class="text-sm font-bold text-primary-600 uppercase tracking-wider"
              :class="titleClass"
            >
              {{ title }}
            </h3>
          </div>
        </div>
      </div>

      <!-- Value -->
      <div class="mb-4">
        <div class="text-4xl font-black text-primary-700 mb-2" :class="valueClass">
          <slot name="value">
            <span v-if="prefix" class="text-primary-600">{{ prefix }}</span>
            <span
              class="bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent"
              >{{ formattedValue }}</span
            >
            <span v-if="suffix" class="text-secondary-600">{{ suffix }}</span>
          </slot>
        </div>
        <p class="text-sm font-semibold text-primary-600" :class="descriptionClass">
          <slot name="description">{{ description }}</slot>
        </p>
      </div>

      <!-- Trend indicator -->
      <div v-if="trend !== undefined || $slots.trend" class="flex items-center">
        <slot name="trend">
          <div
            v-if="trend !== undefined"
            class="flex items-center space-x-3 bg-gradient-to-r from-primary-50 to-primary-100 px-4 py-3 rounded-xl border border-primary-200"
          >
            <div
              :class="['w-8 h-8 rounded-xl flex items-center justify-center', getTrendBgColor()]"
            >
              <FontAwesomeIcon :icon="getTrendIcon()" :class="['w-4 h-4', getTrendColor()]" />
            </div>
            <div>
              <span :class="['text-lg font-bold', getTrendColor()]">{{ Math.abs(trend) }}%</span>
              <p class="text-xs text-primary-600 font-medium">{{ trendLabel }}</p>
            </div>
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
  if (props.trend === undefined) return 'text-neutral-500'
  if (props.trend > 0) return 'text-success-600'
  if (props.trend < 0) return 'text-error-600'
  return 'text-neutral-500'
}

const getTrendBgColor = (): string => {
  if (props.trend === undefined) return 'bg-neutral-200'
  if (props.trend > 0) return 'bg-success-100'
  if (props.trend < 0) return 'bg-error-100'
  return 'bg-neutral-200'
}
</script>
