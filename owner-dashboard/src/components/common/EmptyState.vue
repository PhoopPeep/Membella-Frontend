<template>
  <div
    class="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-soft border border-primary-200"
    :class="containerClass"
  >
    <!-- Icon -->
    <div
      class="mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-soft"
      :class="[
        iconContainerClass,
        size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-20 h-20' : 'w-16 h-16',
      ]"
    >
      <slot name="icon">
        <FontAwesomeIcon
          :icon="icon"
          :class="[iconClass, size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8']"
        />
      </slot>
    </div>

    <!-- Title -->
    <h3
      :class="[
        titleClass,
        size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl',
        'font-bold text-neutral-800 mb-3',
      ]"
    >
      <slot name="title">{{ title }}</slot>
    </h3>

    <!-- Description -->
    <p
      v-if="description || $slots.description"
      :class="[
        descriptionClass,
        size === 'sm' ? 'text-sm' : 'text-base',
        'text-neutral-600 mb-6 font-medium',
      ]"
    >
      <slot name="description">{{ description }}</slot>
    </p>

    <!-- Actions -->
    <div v-if="$slots.actions || primaryAction" class="space-y-3">
      <slot name="actions">
        <!-- Primary Action -->
        <button
          v-if="primaryAction"
          @click="handlePrimaryAction"
          :disabled="primaryAction.disabled"
          class="inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-primary text-white hover:bg-gradient-secondary h-11 px-6 shadow-medium hover:shadow-glow"
        >
          <FontAwesomeIcon
            v-if="primaryAction.icon"
            :icon="primaryAction.icon"
            class="w-4 h-4 mr-2"
          />
          {{ primaryAction.text }}
        </button>

        <!-- Secondary Action -->
        <div v-if="secondaryAction">
          <button
            @click="handleSecondaryAction"
            :disabled="secondaryAction.disabled"
            class="inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-primary-200 bg-white/80 hover:bg-primary-50 text-neutral-700 hover:text-primary-700 h-11 px-6"
          >
            <FontAwesomeIcon
              v-if="secondaryAction.icon"
              :icon="secondaryAction.icon"
              class="w-4 h-4 mr-2"
            />
            {{ secondaryAction.text }}
          </button>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface EmptyStateAction {
  text: string
  icon?: any
  disabled?: boolean
  onClick?: () => void
}

interface Props {
  // Content
  title: string
  description?: string
  icon?: string

  // Actions
  primaryAction?: EmptyStateAction
  secondaryAction?: EmptyStateAction

  // Styling
  size?: 'sm' | 'md' | 'lg'
  containerClass?: string
  iconContainerClass?: string
  iconClass?: string
  titleClass?: string
  descriptionClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'database',
  size: 'md',
  containerClass: 'py-12',
  iconContainerClass: 'bg-gradient-primary',
  iconClass: 'text-white',
  titleClass: '',
  descriptionClass: '',
})

const emit = defineEmits<{
  primaryAction: []
  secondaryAction: []
}>()

// Methods
const handlePrimaryAction = () => {
  if (props.primaryAction?.onClick) {
    props.primaryAction.onClick()
  } else {
    emit('primaryAction')
  }
}

const handleSecondaryAction = () => {
  if (props.secondaryAction?.onClick) {
    props.secondaryAction.onClick()
  } else {
    emit('secondaryAction')
  }
}
</script>
