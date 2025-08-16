<template>
  <div class="text-center" :class="containerClass">
    <!-- Icon -->
    <div
      class="mx-auto rounded-full flex items-center justify-center mb-4"
      :class="[
        iconContainerClass,
        size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12',
      ]"
    >
      <slot name="icon">
        <FontAwesomeIcon
          :icon="icon"
          :class="[iconClass, size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6']"
        />
      </slot>
    </div>

    <!-- Title -->
    <h3
      :class="[
        titleClass,
        size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg',
        'font-medium text-gray-900 mb-2',
      ]"
    >
      <slot name="title">{{ title }}</slot>
    </h3>

    <!-- Description -->
    <p
      v-if="description || $slots.description"
      :class="[descriptionClass, size === 'sm' ? 'text-xs' : 'text-sm', 'text-gray-500 mb-4']"
    >
      <slot name="description">{{ description }}</slot>
    </p>

    <!-- Actions -->
    <div v-if="$slots.actions || primaryAction" class="space-y-2">
      <slot name="actions">
        <!-- Primary Action -->
        <button
          v-if="primaryAction"
          @click="handlePrimaryAction"
          :disabled="primaryAction.disabled"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
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
            class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 h-10 px-4 py-2"
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
  iconContainerClass: 'bg-gray-100',
  iconClass: 'text-gray-400',
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
