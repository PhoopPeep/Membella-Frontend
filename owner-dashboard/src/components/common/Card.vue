<template>
  <div
    class="relative overflow-hidden rounded-3xl border border-primary-200/50 bg-white/90 backdrop-blur-md shadow-xl"
    :class="[
      cardClass,
      { 'hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group': hoverable },
    ]"
  >
    <!-- Background Gradient -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary-50/20 via-white/30 to-secondary-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
    ></div>

    <!-- Top Accent Line -->
    <div
      class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500"
    ></div>

    <div class="relative z-10">
      <!-- Header -->
      <div
        v-if="title || subtitle || $slots.header || $slots.actions"
        class="px-8 py-6 border-b border-primary-100/50 bg-gradient-to-r from-primary-50/30 via-white/50 to-secondary-50/20 rounded-t-3xl"
        :class="headerClass"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <slot name="header">
              <h2 v-if="title" class="text-2xl font-black text-neutral-800" :class="titleClass">
                {{ title }}
              </h2>
              <p
                v-if="subtitle"
                class="text-base text-neutral-600 mt-2 font-semibold"
                :class="subtitleClass"
              >
                {{ subtitle }}
              </p>
            </slot>
          </div>

          <!-- Header Actions -->
          <div v-if="$slots.actions" class="ml-6">
            <slot name="actions" />
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-8" :class="[contentClass, { 'pt-8': !title && !subtitle && !$slots.header }]">
        <slot />
      </div>

      <!-- Footer -->
      <div
        v-if="$slots.footer"
        class="px-8 pb-8 pt-0 border-t border-primary-100/50 bg-gradient-to-r from-secondary-50/20 via-white/50 to-primary-50/30 rounded-b-3xl"
        :class="footerClass"
      >
        <slot name="footer" />
      </div>
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
