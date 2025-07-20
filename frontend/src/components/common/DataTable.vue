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
          <LoadingSpinner size="sm" :text="loadingText" color="blue" />
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
                  column.align === 'center' ? 'text-center' :
                  column.align === 'right' ? 'text-right' : 'text-left'
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
                  column.align === 'center' ? 'text-center' :
                  column.align === 'right' ? 'text-right' : 'text-left'
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
                  <span v-if="column.type === 'badge'" :class="getBadgeClass(getColumnValue(item, column.key))">
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
                      v-for="tag in getColumnValue(item, column.key) && Array.isArray(getColumnValue(item, column.key)) ? getColumnValue(item, column.key).slice(0, 3) : []"
                      :key="tag"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {{ tag }}
                    </span>
                    <span
                      v-if="getColumnValue(item, column.key) && Array.isArray(getColumnValue(item, column.key)) && getColumnValue(item, column.key).length > 3"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      +{{ getColumnValue(item, column.key).length - 3 }} more
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
          <div class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <DynamicIcon :icon="emptyIcon" class="w-6 h-6 text-gray-400" />
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
import { computed } from 'vue'
import { Database } from 'lucide-vue-next'
import LoadingSpinner from './LoadingSpinner.vue'
import DynamicIcon from './DynamicIcon.vue'

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
  data: any[]
  columns: TableColumn[]

  // Header
  title?: string
  subtitle?: string

  // State
  loading?: boolean
  loadingText?: string

  // Row configuration
  rowKey?: string | ((item: any, index: number) => string)
  disabledRows?: any[] | ((item: any) => boolean)

  // Empty state
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: any
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingText: 'Loading...',
  rowKey: 'id',
  emptyTitle: 'No data',
  emptyDescription: 'No items to display',
  emptyIcon: Database,
  disabledRows: () => [],
})

// Methods
const getRowKey = (item: any, index: number): string => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(item, index)
  }
  return item[props.rowKey] || index.toString()
}

const getColumnValue = (item: any, key: string): any => {
  return key.split('.').reduce((obj, k) => obj?.[k], item)
}

const isRowDisabled = (item: any): boolean => {
  if (typeof props.disabledRows === 'function') {
    return props.disabledRows(item)
  }
  return Array.isArray(props.disabledRows) && props.disabledRows.includes(item)
}

const formatValue = (value: any, column: TableColumn): string => {
  if (value === null || value === undefined) return '-'

  switch (column.type) {
    case 'text':
    default:
      return String(value)
  }
}

const formatCurrency = (value: number): string => {
  if (typeof value !== 'number') return '0.00'
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (value: string | Date): string => {
  if (!value) return '-'
  try {
    const date = new Date(value)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid Date'
  }
}

const getBadgeClass = (value: any): string => {
  // Default badge styling - can be customized via props or slots
  return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
}
</script>
