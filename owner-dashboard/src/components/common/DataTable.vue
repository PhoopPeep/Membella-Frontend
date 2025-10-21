<template>
  <div class="rounded-lg border bg-white shadow-sm">
    <!-- Header -->
    <div v-if="title || $slots.header" class="p-6 border-b border-gray-200">
      <slot name="header">
        <h2 v-if="title" class="text-xl font-semibold">{{ title }}</h2>
        <p v-if="subtitle" class="text-sm text-gray-500 mt-1">{{ subtitle }}</p>
      </slot>
    </div>

    <!-- Table Container -->
    <div class="p-6">
      <!-- Loading overlay -->
      <div v-if="loading" class="relative">
        <div class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span v-if="loadingText" class="ml-2 text-sm text-gray-600">{{ loadingText }}</span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <!-- Table Header -->
          <thead>
            <tr class="border-b border-gray-200">
              <th
                v-for="column in columns"
                :key="column.key"
                :class="[
                  'py-3 px-4 font-medium text-gray-900',
                  column.align === 'center'
                    ? 'text-center'
                    : column.align === 'right'
                      ? 'text-right'
                      : 'text-left',
                ]"
              >
                {{ column.title }}
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody>
            <tr
              v-for="(item, index) in data"
              :key="getRowKey(item, index)"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              :class="{ 'opacity-50 pointer-events-none': isRowDisabled(item) }"
            >
              <td
                v-for="column in columns"
                :key="column.key"
                :class="[
                  'py-4 px-4',
                  column.align === 'center'
                    ? 'text-center'
                    : column.align === 'right'
                      ? 'text-right'
                      : 'text-left',
                ]"
              >
                <!-- Custom slot for column -->
                <slot
                  :name="`column-${column.key}`"
                  :item="item"
                  :value="getColumnValue(item, column.key)"
                  :index="index"
                >
                  <!-- Default column rendering -->
                  <span
                    v-if="column.type === 'badge'"
                    :class="getBadgeClass()"
                  >
                    {{ formatValue(getColumnValue(item, column.key), column) }}
                  </span>
                  <span v-else-if="column.type === 'currency'" class="font-medium">
                    ${{ formatCurrency(getColumnValue(item, column.key)) }}
                  </span>
                  <span v-else-if="column.type === 'date'" class="text-gray-600">
                    {{ formatDate(getColumnValue(item, column.key)) }}
                  </span>
                  <span v-else-if="column.type === 'tags'" class="flex flex-wrap gap-1">
                    <span
                      v-for="tag in getTagsArray(getColumnValue(item, column.key))"
                      :key="tag"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {{ tag }}
                    </span>
                    <span
                      v-if="getTagsArray(getColumnValue(item, column.key)).length > 3"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      +{{ getTagsArray(getColumnValue(item, column.key)).length - 3 }} more
                    </span>
                  </span>
                  <span v-else>
                    {{ formatValue(getColumnValue(item, column.key), column) }}
                  </span>
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && data.length === 0" class="text-center py-12">
        <slot name="empty">
          <div
            class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4"
          >
            <FontAwesomeIcon :icon="emptyIcon" class="w-6 h-6 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">{{ emptyTitle }}</h3>
          <p class="text-gray-500 mb-4">{{ emptyDescription }}</p>
          <slot name="empty-action" />
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

export interface TableColumn {
  key: string
  title: string
  type?: 'text' | 'badge' | 'currency' | 'date' | 'tags'
  align?: 'left' | 'center' | 'right'
  width?: string
  sortable?: boolean
}

interface Props {
  // Data
  data: Record<string, unknown>[]
  columns: TableColumn[]

  // Header
  title?: string
  subtitle?: string

  // State
  loading?: boolean
  loadingText?: string

  // Row configuration
  rowKey?: string | ((item: Record<string, unknown>, index: number) => string)
  disabledRows?: Record<string, unknown>[] | ((item: Record<string, unknown>) => boolean)

  // Empty state
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingText: 'Loading...',
  rowKey: 'id',
  emptyTitle: 'No data',
  emptyDescription: 'No items to display',
  emptyIcon: 'database',
  disabledRows: () => [],
})

// Methods
const getRowKey = (item: Record<string, unknown>, index: number): string => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(item, index)
  }
  return String(item[props.rowKey] || index.toString())
}

const getColumnValue = (item: Record<string, unknown>, key: string): unknown => {
  return key.split('.').reduce((obj: unknown, k: string) => {
    if (obj && typeof obj === 'object' && k in obj) {
      return (obj as Record<string, unknown>)[k]
    }
    return undefined
  }, item)
}

const isRowDisabled = (item: Record<string, unknown>): boolean => {
  if (typeof props.disabledRows === 'function') {
    return props.disabledRows(item)
  }
  return Array.isArray(props.disabledRows) && props.disabledRows.includes(item)
}

const formatValue = (value: unknown, column: TableColumn): string => {
  if (value === null || value === undefined) return '-'

  if (column.type === 'text') {
    return String(value)
  }

  return String(value)
}

const formatCurrency = (value: unknown): string => {
  if (typeof value !== 'number') return '0.00'
  return value.toLocaleString('en-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const formatDate = (value: unknown): string => {
  if (!value) return '-'
  try {
    const date = new Date(value as string | Date)
    return date.toLocaleDateString('en-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid Date'
  }
}

const getBadgeClass = (): string => {
  // Default badge styling - can be customized via props or slots
  return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
}

const getTagsArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.slice(0, 3).map(String)
  }
  return []
}
</script>
