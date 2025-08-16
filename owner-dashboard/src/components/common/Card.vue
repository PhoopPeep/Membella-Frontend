<template>
  <div
    class="rounded-lg border bg-white shadow-sm"
    :class="[cardClass, { 'hover:shadow-md transition-shadow': hoverable }]"
  >
    <!-- Header -->
    <div
      v-if="title || subtitle || $slots.header || $slots.actions"
      class="p-6 border-b border-gray-200"
      :class="headerClass"
    >
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <slot name="header">
            <h2 v-if="title" class="text-xl font-semibold" :class="titleClass">
              {{ title }}
            </h2>
            <p v-if="subtitle" class="text-sm text-gray-500 mt-1" :class="subtitleClass">
              {{ subtitle }}
            </p>
          </slot>
        </div>

        <!-- Header Actions -->
        <div v-if="$slots.actions" class="ml-4">
          <slot name="actions" />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6" :class="[contentClass, { 'pt-6': !title && !subtitle && !$slots.header }]">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="p-6 pt-0 border-t border-gray-200" :class="footerClass">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  // Content
  title?: string
  subtitle?: string

  // Styling
  cardClass?: string
  headerClass?: string
  contentClass?: string
  footerClass?: string
  titleClass?: string
  subtitleClass?: string

  // Behavior
  hoverable?: boolean
}

withDefaults(defineProps<Props>(), {
  cardClass: '',
  headerClass: '',
  contentClass: '',
  footerClass: '',
  titleClass: '',
  subtitleClass: '',
  hoverable: false,
})
</script>
