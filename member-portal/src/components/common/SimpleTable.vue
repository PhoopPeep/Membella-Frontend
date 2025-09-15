<template>
  <div
    class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-primary-200 overflow-hidden mx-4 sm:mx-6 lg:mx-8"
  >
    <!-- Table Header -->
    <div
      v-if="title || $slots.header"
      class="px-6 py-6 border-b border-primary-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/30"
    >
      <div class="flex items-center justify-between">
        <div>
          <h3 v-if="title" class="text-xl font-bold text-neutral-800">{{ title }}</h3>
          <p v-if="subtitle" class="text-sm text-neutral-600 mt-1 font-medium">{{ subtitle }}</p>
        </div>
        <slot name="header-actions"></slot>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-500 mx-auto mb-4"
        ></div>
        <span class="text-neutral-600 font-medium">{{ loadingText }}</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-8 text-center">
      <div class="w-16 h-16 bg-error-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <FontAwesomeIcon icon="exclamation-circle" class="w-8 h-8 text-error-600" />
      </div>
      <h3 class="text-xl font-bold text-error-800 mb-3">{{ errorTitle }}</h3>
      <p class="text-error-600 mb-6 font-medium">{{ error }}</p>
      <button
        v-if="showRetry"
        @click="$emit('retry')"
        class="bg-gradient-to-r from-error-500 to-error-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-error-600 hover:to-error-700 transition-all duration-200 shadow-medium"
      >
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!data || data.length === 0" class="p-8 text-center">
      <div
        class="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft"
      >
        <FontAwesomeIcon :icon="emptyIcon" class="w-10 h-10 text-white" />
      </div>
      <h3 class="text-xl font-bold text-neutral-800 mb-3">{{ emptyTitle }}</h3>
      <p class="text-neutral-600 mb-6 font-medium">{{ emptyMessage }}</p>
      <slot name="empty-actions"></slot>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto p-4 sm:p-6">
      <table class="min-w-full divide-y divide-primary-100">
        <!-- Table Head -->
        <thead class="bg-gradient-to-r from-primary-50/50 to-secondary-50/30">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-8 py-6 text-left text-sm font-bold text-primary-700 uppercase tracking-wider"
              :class="getHeaderClass(column)"
            >
              {{ column.title }}
            </th>
            <th
              v-if="showActions"
              class="px-8 py-6 text-right text-sm font-bold text-primary-700 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="bg-white divide-y divide-primary-100">
          <tr
            v-for="(item, index) in data"
            :key="getRowKey(item, index)"
            class="hover:bg-primary-50/50 transition-all duration-200 cursor-pointer group"
            @click="handleRowClick(item)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-8 py-6 whitespace-nowrap"
              :class="getCellClass(column)"
            >
              <!-- Custom Column Slot -->
              <slot
                v-if="$slots[`column-${column.key}`]"
                :name="`column-${column.key}`"
                :item="item"
                :value="getValue(item, column.key)"
                :index="index"
              ></slot>

              <!-- Default Column Rendering -->
              <div v-else class="space-y-1">
                <!-- Date -->
                <div v-if="column.type === 'date'" class="text-sm font-semibold text-primary-700">
                  {{ formatDate(getValue(item, column.key)) }}
                </div>

                <!-- Currency -->
                <div
                  v-else-if="column.type === 'currency'"
                  class="text-base font-bold text-primary-600"
                >
                  {{ formatCurrency(getValue(item, column.key)) }}
                </div>

                <!-- Number -->
                <div
                  v-else-if="column.type === 'number'"
                  class="text-base font-bold text-primary-700"
                >
                  {{ formatNumber(getValue(item, column.key)) }}
                </div>

                <!-- Default Text -->
                <div v-else class="text-sm font-medium text-neutral-800 leading-relaxed">
                  {{ formatValue(item, column) }}
                </div>
              </div>
            </td>

            <!-- Actions Column -->
            <td
              v-if="showActions"
              class="px-8 py-6 whitespace-nowrap text-right text-sm font-medium"
            >
              <slot name="actions" :item="item" :index="index">
                <!-- Default Actions -->
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click.stop="$emit('view', item)"
                    class="text-primary-600 hover:text-primary-800 p-2 rounded-xl hover:bg-primary-100 transition-all duration-200 group-hover:scale-110"
                    title="View Details"
                  >
                    <FontAwesomeIcon icon="eye" class="w-4 h-4" />
                  </button>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define types
type TableValue = string | number | boolean | Date | null | undefined
type TableRecord = Record<string, TableValue>

interface Column {
  key: string
  title: string
  type?: 'text' | 'number' | 'date' | 'currency'
  align?: 'left' | 'center' | 'right'
  formatter?: (value: TableValue, item: TableRecord) => string
  width?: string
}

interface Props {
  data: TableRecord[]
  columns: Column[]
  title?: string
  subtitle?: string
  loading?: boolean
  error?: string
  loadingText?: string
  errorTitle?: string
  showRetry?: boolean
  showActions?: boolean
  emptyTitle?: string
  emptyMessage?: string
  emptyIcon?: string
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  columns: () => [],
  loading: false,
  error: '',
  loadingText: 'Loading...',
  errorTitle: 'Error',
  showRetry: true,
  showActions: true,
  emptyTitle: 'No Data',
  emptyMessage: 'No data available',
  emptyIcon: 'inbox',
  clickable: true,
})

const emit = defineEmits<{
  view: [item: TableRecord]
  edit: [item: TableRecord]
  delete: [item: TableRecord]
  retry: []
  'row-click': [item: TableRecord]
}>()

const getRowKey = (item: TableRecord, index: number): string | number => {
  return (item.id as string | number) || (item.key as string | number) || index
}

const getValue = (item: TableRecord, key: string): TableValue => {
  return key.split('.').reduce(
    (obj, k) => {
      if (obj && typeof obj === 'object' && k in obj) {
        return (obj as unknown as Record<string, TableValue>)[k]
      }
      return undefined
    },
    item as unknown as TableValue,
  )
}

const formatValue = (item: TableRecord, column: Column): string => {
  const value = getValue(item, column.key)

  if (column.formatter) {
    return column.formatter(value, item)
  }

  return value?.toString() || '-'
}

const formatDate = (value: TableValue): string => {
  if (!value) return '-'

  try {
    const date = value instanceof Date ? value : new Date(value as string | number)
    return date.toLocaleDateString('en-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '-'
  }
}

const formatCurrency = (value: TableValue): string => {
  if (value === null || value === undefined) return '-'

  const numValue = typeof value === 'number' ? value : Number(value)
  if (isNaN(numValue)) return '-'

  return `฿${numValue.toLocaleString()}`
}

const formatNumber = (value: TableValue): string => {
  if (value === null || value === undefined) return '-'

  const numValue = typeof value === 'number' ? value : Number(value)
  if (isNaN(numValue)) return '-'

  return numValue.toLocaleString()
}

const getHeaderClass = (column: Column): string => {
  const classes: string[] = []
  if (column.align === 'center') classes.push('text-center')
  else if (column.align === 'right') classes.push('text-right')
  if (column.width) classes.push(`w-${column.width}`)
  return classes.join(' ')
}

const getCellClass = (column: Column): string => {
  const classes: string[] = []
  if (column.align === 'center') classes.push('text-center')
  else if (column.align === 'right') classes.push('text-right')
  return classes.join(' ')
}

const handleRowClick = (item: TableRecord): void => {
  if (props.clickable) {
    emit('row-click', item)
  }
}
</script>
