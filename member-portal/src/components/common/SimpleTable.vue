<template>
  <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
    <!-- Table Header -->
    <div v-if="title || $slots.header" class="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <div class="flex items-center justify-between">
        <div>
          <h3 v-if="title" class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          <p v-if="subtitle" class="text-sm text-gray-600 mt-1">{{ subtitle }}</p>
        </div>
        <slot name="header-actions"></slot>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">{{ loadingText }}</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-6 text-center">
      <FontAwesomeIcon icon="exclamation-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-red-800 mb-2">{{ errorTitle }}</h3>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        v-if="showRetry"
        @click="$emit('retry')"
        class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!data || data.length === 0" class="p-6 text-center">
      <FontAwesomeIcon :icon="emptyIcon" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">{{ emptyTitle }}</h3>
      <p class="text-gray-500 mb-4">{{ emptyMessage }}</p>
      <slot name="empty-actions"></slot>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <!-- Table Head -->
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              :class="getHeaderClass(column)"
            >
              {{ column.title }}
            </th>
            <th v-if="showActions" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(item, index) in data"
            :key="getRowKey(item, index)"
            class="hover:bg-gray-50 transition-colors cursor-pointer"
            @click="handleRowClick(item)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap"
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
              <div v-else>
                <!-- Date -->
                <span v-if="column.type === 'date'" class="text-sm text-gray-900">
                  {{ formatDate(getValue(item, column.key)) }}
                </span>

                <!-- Currency -->
                <span v-else-if="column.type === 'currency'" class="text-sm font-medium text-gray-900">
                  {{ formatCurrency(getValue(item, column.key)) }}
                </span>

                <!-- Number -->
                <span v-else-if="column.type === 'number'" class="text-sm font-medium text-gray-900">
                  {{ formatNumber(getValue(item, column.key)) }}
                </span>

                <!-- Default Text -->
                <span v-else class="text-sm text-gray-900">
                  {{ formatValue(item, column) }}
                </span>
              </div>
            </td>

            <!-- Actions Column -->
            <td v-if="showActions" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <slot name="actions" :item="item" :index="index">
                <!-- Default Actions -->
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click.stop="$emit('view', item)"
                    class="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors"
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
interface Column {
  key: string
  title: string
  type?: 'text' | 'number' | 'date' | 'currency'
  align?: 'left' | 'center' | 'right'
  formatter?: (value: any, item: any) => string
  width?: string
}

interface Props {
  data: any[]
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
  clickable: true
})

const emit = defineEmits<{
  view: [item: any]
  edit: [item: any]
  delete: [item: any]
  retry: []
  'row-click': [item: any]
}>()

const getRowKey = (item: any, index: number) => {
  return item.id || item.key || index
}

const getValue = (item: any, key: string) => {
  return key.split('.').reduce((obj, k) => obj?.[k], item)
}

const formatValue = (item: any, column: Column) => {
  const value = getValue(item, column.key)

  if (column.formatter) {
    return column.formatter(value, item)
  }

  return value || '-'
}

const formatDate = (value: any) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatCurrency = (value: any) => {
  if (!value && value !== 0) return '-'
  return `฿${Number(value).toLocaleString()}`
}

const formatNumber = (value: any) => {
  if (!value && value !== 0) return '-'
  return Number(value).toLocaleString()
}

const getHeaderClass = (column: Column) => {
  const classes = []
  if (column.align === 'center') classes.push('text-center')
  else if (column.align === 'right') classes.push('text-right')
  if (column.width) classes.push(`w-${column.width}`)
  return classes.join(' ')
}

const getCellClass = (column: Column) => {
  const classes = []
  if (column.align === 'center') classes.push('text-center')
  else if (column.align === 'right') classes.push('text-right')
  return classes.join(' ')
}

const handleRowClick = (item: any) => {
  if (props.clickable) {
    emit('row-click', item)
  }
}
</script>
