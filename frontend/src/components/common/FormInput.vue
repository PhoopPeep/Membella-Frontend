<template>
  <div class="space-y-2">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="text-sm font-medium leading-none"
      :class="[
        labelClass,
        { 'text-red-700': hasError }
      ]"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Input Container -->
    <div class="relative">
      <!-- Prefix Icon -->
      <div
        v-if="prefixIcon"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <DynamicIcon :icon="prefixIcon" class="w-4 h-4 text-gray-400" />
      </div>

      <!-- Input Field -->
      <input
        v-if="type !== 'textarea'"
        :id="inputId"
        :type="type"
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :min="min"
        :max="max"
        :step="step"
        :autocomplete="autocomplete"
        class="flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        :class="[
          getInputClasses(),
          prefixIcon ? 'pl-10' : '',
          suffixIcon ? 'pr-10' : '',
          inputClass
        ]"
      />

      <!-- Textarea -->
      <textarea
        v-else
        :id="inputId"
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :rows="rows"
        class="flex w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-vertical"
        :class="[
          getInputClasses(),
          `min-h-[${rows * 1.5}rem]`,
          inputClass
        ]"
      />

      <!-- Suffix Icon -->
      <div
        v-if="suffixIcon"
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
      >
        <DynamicIcon :icon="suffixIcon" class="w-4 h-4 text-gray-400" />
      </div>

      <!-- Loading Spinner -->
      <div
        v-if="loading"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      </div>
    </div>

    <!-- Helper Text / Error Message -->
    <div v-if="hasError || helperText" class="flex items-start space-x-1">
      <DynamicIcon
        v-if="hasError"
        :icon="AlertCircle"
        class="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0"
      />
      <p
        :class="[
          'text-xs',
          hasError ? 'text-red-600' : 'text-gray-500'
        ]"
      >
        {{ hasError ? errorMessage : helperText }}
      </p>
    </div>

    <!-- Character Count (for text inputs) -->
    <div v-if="showCharCount && maxLength" class="text-xs text-gray-500 text-right">
      {{ characterCount }}/{{ maxLength }} characters
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertCircle } from 'lucide-vue-next'
import DynamicIcon from './DynamicIcon.vue'

interface Props {
  // Value
  modelValue: string | number

  // Input attributes
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  autocomplete?: string

  // Styling
  label?: string
  labelClass?: string
  inputClass?: string

  // Number inputs
  min?: number
  max?: number
  step?: number

  // Textarea
  rows?: number

  // Validation
  errorMessage?: string
  helperText?: string

  // Icons
  prefixIcon?: any
  suffixIcon?: any

  // State
  loading?: boolean

  // Character count
  showCharCount?: boolean
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  rows: 3,
  labelClass: '',
  inputClass: '',
  loading: false,
  showCharCount: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

// State
const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)

// Computed
const hasError = computed(() => !!props.errorMessage)

const characterCount = computed(() => {
  if (typeof props.modelValue === 'string') {
    return props.modelValue.length
  }
  return 0
})

// Methods
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  let value: string | number = target.value

  // Convert to number for number inputs
  if (props.type === 'number' && value !== '') {
    value = parseFloat(value)
  }

  emit('update:modelValue', value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const getInputClasses = (): string => {
  if (hasError.value) {
    return 'border-red-300 focus:ring-red-500 focus:border-red-500'
  }
  return 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
}
</script>
