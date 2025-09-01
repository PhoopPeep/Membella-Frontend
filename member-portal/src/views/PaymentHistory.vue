<template>
  <div class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
      <p class="text-gray-600">View all your payment transactions and receipts</p>
    </div>

    <!-- Filter Controls -->
    <div class="mb-6 bg-white rounded-lg shadow border border-gray-200 p-4">
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Status Filter -->
          <div>
            <label for="statusFilter" class="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="statusFilter"
              v-model="selectedStatus"
              @change="applyFilters"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="expired">Expired</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <!-- Results per page -->
          <div>
            <label for="limitFilter" class="block text-sm font-medium text-gray-700 mb-1">
              Results per page
            </label>
            <select
              id="limitFilter"
              v-model="pageLimit"
              @change="applyFilters"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <!-- Refresh Button -->
        <button
          @click="refreshPayments"
          :disabled="loading"
          class="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <FontAwesomeIcon
            :icon="loading ? 'spinner' : 'sync-alt'"
            :class="{ 'animate-spin': loading }"
            class="w-4 h-4"
          />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && payments.length === 0" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-gray-600">Loading payments...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center mb-4">
        <FontAwesomeIcon icon="exclamation-circle" class="w-5 h-5 text-red-500 mr-2" />
        <h3 class="text-lg font-medium text-red-800">Error Loading Payment History</h3>
      </div>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        @click="loadPaymentHistory"
        class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Payment History Table -->
    <div v-else-if="payments.length > 0" class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Transaction History</h2>
            <p class="text-sm text-gray-500 mt-1">
              {{ pagination.total }} transaction{{ pagination.total === 1 ? '' : 's' }} found
              {{ selectedStatus ? `(${selectedStatus} only)` : '' }}
            </p>
          </div>
          <div class="text-sm text-gray-500">
            Showing {{ pagination.offset + 1 }}-{{ Math.min(pagination.offset + pageLimit, pagination.total) }} of {{ pagination.total }}
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Plan
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="payment in payments"
              :key="payment.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ payment.planName }}</p>
                  <p class="text-sm text-gray-500">{{ formatDate(payment.createdAt) }}</p>
                  <p class="text-xs text-gray-400">{{ formatTime(payment.createdAt) }}</p>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ payment.organization }}</div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  ฿{{ payment.amount.toLocaleString() }}
                </div>
                <div class="text-xs text-gray-500">{{ payment.currency }}</div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                  <FontAwesomeIcon
                    :icon="getPaymentMethodIcon(payment.paymentMethod)"
                    :class="getPaymentMethodIconColor(payment.paymentMethod)"
                    class="w-4 h-4"
                  />
                  <span class="text-sm text-gray-900 capitalize">
                    {{ formatPaymentMethod(payment.paymentMethod) }}
                  </span>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getStatusColor(payment.status)
                  ]"
                >
                  {{ formatStatus(payment.status) }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="payment.subscription" class="text-sm">
                  <div class="flex items-center space-x-2">
                    <span
                      :class="[
                        'w-2 h-2 rounded-full',
                        payment.subscription.status === 'active' ? 'bg-green-500' :
                        payment.subscription.status === 'expired' ? 'bg-yellow-500' : 'bg-gray-500'
                      ]"
                    ></span>
                    <span class="text-gray-900 capitalize">{{ payment.subscription.status }}</span>
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ formatDateRange(payment.subscription.startDate, payment.subscription.endDate) }}
                  </div>
                </div>
                <div v-else class="text-sm text-gray-400">
                  No subscription
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button
                    @click="viewPaymentDetails(payment)"
                    class="text-blue-600 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50 transition-colors"
                    title="View Details"
                  >
                    <FontAwesomeIcon icon="eye" class="w-4 h-4" />
                  </button>
                  <button
                    v-if="payment.status === 'successful'"
                    @click="downloadReceipt(payment)"
                    class="text-green-600 hover:text-green-700 p-2 rounded-md hover:bg-green-50 transition-colors"
                    title="Download Receipt"
                  >
                    <FontAwesomeIcon icon="download" class="w-4 h-4" />
                  </button>
                  <button
                    v-if="payment.subscription"
                    @click="viewSubscription(payment.subscription.id)"
                    class="text-purple-600 hover:text-purple-700 p-2 rounded-md hover:bg-purple-50 transition-colors"
                    title="View Subscription"
                  >
                    <FontAwesomeIcon icon="layer-group" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > pageLimit" class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div class="flex items-center">
          <p class="text-sm text-gray-700">
            Showing
            <span class="font-medium">{{ pagination.offset + 1 }}</span>
            to
            <span class="font-medium">{{ Math.min(pagination.offset + pageLimit, pagination.total) }}</span>
            of
            <span class="font-medium">{{ pagination.total }}</span>
            results
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="previousPage"
            :disabled="pagination.offset === 0 || loading"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            @click="nextPage"
            :disabled="!pagination.hasMore || loading"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
      <FontAwesomeIcon icon="receipt" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
      <p class="text-gray-500 mb-6">
        {{ selectedStatus ? `No ${selectedStatus} payments found.` : 'You haven\'t made any payments yet.' }}
      </p>
      <div class="space-x-4">
        <button
          v-if="selectedStatus"
          @click="clearFilters"
          class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          Clear Filters
        </button>
        <router-link
          to="/homepage"
          class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
        >
          <FontAwesomeIcon icon="search" class="w-4 h-4 mr-2" />
          Browse Plans
        </router-link>
      </div>
    </div>

    <!-- Payment Details Modal -->
    <div
      v-if="showDetailsModal && selectedPayment"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
      @click.self="closeDetailsModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900">Payment Details</h2>
            <button
              @click="closeDetailsModal"
              class="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <FontAwesomeIcon icon="times" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Transaction Info -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Transaction Information</h3>
            <div class="bg-gray-50 rounded-lg p-4 space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Transaction ID:</span>
                <span class="font-mono text-sm bg-gray-200 px-2 py-1 rounded">{{ selectedPayment.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Date & Time:</span>
                <div class="text-right">
                  <p class="font-medium">{{ formatDate(selectedPayment.createdAt) }}</p>
                  <p class="text-sm text-gray-500">{{ formatTime(selectedPayment.createdAt) }}</p>
                </div>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Status:</span>
                <span
                  :class="[
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getStatusColor(selectedPayment.status)
                  ]"
                >
                  {{ formatStatus(selectedPayment.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Plan Info -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Plan Information</h3>
            <div class="bg-gray-50 rounded-lg p-4 space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Plan Name:</span>
                <span class="font-medium">{{ selectedPayment.planName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Organization:</span>
                <span class="font-medium">{{ selectedPayment.organization }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Description:</span>
                <span class="font-medium">{{ selectedPayment.description }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Info -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Payment Information</h3>
            <div class="bg-gray-50 rounded-lg p-4 space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Amount:</span>
                <span class="font-bold text-lg">฿{{ selectedPayment.amount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Currency:</span>
                <span class="font-medium">{{ selectedPayment.currency }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Payment Method:</span>
                <div class="flex items-center space-x-2">
                  <FontAwesomeIcon
                    :icon="getPaymentMethodIcon(selectedPayment.paymentMethod)"
                    :class="getPaymentMethodIconColor(selectedPayment.paymentMethod)"
                    class="w-4 h-4"
                  />
                  <span class="font-medium capitalize">
                    {{ formatPaymentMethod(selectedPayment.paymentMethod) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Subscription Info -->
          <div v-if="selectedPayment.subscription">
            <h3 class="text-lg font-medium text-gray-900 mb-3">Subscription Information</h3>
            <div class="bg-gray-50 rounded-lg p-4 space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Subscription ID:</span>
                <span class="font-mono text-sm bg-gray-200 px-2 py-1 rounded">{{ selectedPayment.subscription.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Status:</span>
                <span
                  :class="[
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    selectedPayment.subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedPayment.subscription.status === 'expired' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ selectedPayment.subscription.status.charAt(0).toUpperCase() + selectedPayment.subscription.status.slice(1) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Period:</span>
                <span class="font-medium">
                  {{ formatDateRange(selectedPayment.subscription.startDate, selectedPayment.subscription.endDate) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-center space-x-4">
            <button
              v-if="selectedPayment.status === 'successful'"
              @click="downloadReceipt(selectedPayment)"
              class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <FontAwesomeIcon icon="download" class="w-4 h-4" />
              <span>Download Receipt</span>
            </button>
            <button
              v-if="selectedPayment.subscription"
              @click="viewSubscription(selectedPayment.subscription.id)"
              class="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <FontAwesomeIcon icon="layer-group" class="w-4 h-4" />
              <span>View Subscription</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { paymentApi, type PaymentHistory } from '../api/payment'

const router = useRouter()

// State
const loading = ref(false)
const error = ref('')
const payments = ref<PaymentHistory[]>([])
const selectedPayment = ref<PaymentHistory | null>(null)
const showDetailsModal = ref(false)

// Filters and Pagination
const selectedStatus = ref('')
const pageLimit = ref(25)
const pagination = ref({
  total: 0,
  limit: 25,
  offset: 0,
  hasMore: false
})

// Methods
const loadPaymentHistory = async (resetOffset = false) => {
  try {
    loading.value = true
    error.value = ''

    if (resetOffset) {
      pagination.value.offset = 0
    }

    console.log('Loading payment history with options:', {
      limit: pageLimit.value,
      offset: pagination.value.offset,
      status: selectedStatus.value || undefined
    })

    const options: Record<string, string | number> = {
      limit: pageLimit.value,
      offset: pagination.value.offset
    }

    if (selectedStatus.value) {
      options.status = selectedStatus.value
    }

    const data = await paymentApi.getPaymentHistory(options)

    payments.value = data.data
    pagination.value = data.pagination

    console.log('Payment history loaded:', {
      payments: data.data.length,
      pagination: data.pagination
    })

  } catch (err) {
    console.error('Failed to load payment history:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load payment history'
  } finally {
    loading.value = false
  }
}

const refreshPayments = () => {
  loadPaymentHistory(true)
}

const applyFilters = () => {
  loadPaymentHistory(true)
}

const clearFilters = () => {
  selectedStatus.value = ''
  pageLimit.value = 25
  loadPaymentHistory(true)
}

const nextPage = () => {
  if (pagination.value.hasMore && !loading.value) {
    pagination.value.offset += pageLimit.value
    loadPaymentHistory()
  }
}

const previousPage = () => {
  if (pagination.value.offset > 0 && !loading.value) {
    pagination.value.offset = Math.max(0, pagination.value.offset - pageLimit.value)
    loadPaymentHistory()
  }
}

const viewPaymentDetails = (payment: PaymentHistory) => {
  selectedPayment.value = payment
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedPayment.value = null
}

const viewSubscription = (subscriptionId: string) => {
  console.log('Viewing subscription:', subscriptionId)
  router.push('/subscriptions')
}

const downloadReceipt = async (payment: PaymentHistory) => {
  try {
    const receiptContent = generateReceiptText(payment)
    const blob = new Blob([receiptContent], { type: 'text/plain; charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${payment.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to download receipt:', err)
    error.value = 'Failed to download receipt'
  }
}

const generateReceiptText = (payment: PaymentHistory): string => {
  return `
PAYMENT RECEIPT
===============

Transaction ID: ${payment.id}
Date: ${formatDate(payment.createdAt)}
Time: ${formatTime(payment.createdAt)}

PLAN DETAILS:
Plan Name: ${payment.planName}
Organization: ${payment.organization}
Description: ${payment.description}

PAYMENT DETAILS:
Amount: ฿${payment.amount.toLocaleString()}
Currency: ${payment.currency}
Payment Method: ${formatPaymentMethod(payment.paymentMethod)}
Status: ${formatStatus(payment.status)}

${payment.subscription ? `SUBSCRIPTION DETAILS:
Subscription ID: ${payment.subscription.id}
Status: ${payment.subscription.status.charAt(0).toUpperCase() + payment.subscription.status.slice(1)}
Period: ${formatDateRange(payment.subscription.startDate, payment.subscription.endDate)}
` : ''}
Thank you for your payment!

Generated on ${new Date().toLocaleString('en-US')}
`.trim()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${start} - ${end}`
}

const formatPaymentMethod = (method: string) => {
  const methodMap: Record<string, string> = {
    'card': 'Credit/Debit Card',
    'promptpay': 'PromptPay QR'
  }
  return methodMap[method] || method
}

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'successful': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'failed': 'bg-red-100 text-red-800',
    'expired': 'bg-gray-100 text-gray-800',
    'refunded': 'bg-purple-100 text-purple-800'
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}

const getPaymentMethodIcon = (method: string) => {
  const iconMap: Record<string, string> = {
    'card': 'credit-card',
    'promptpay': 'qrcode'
  }
  return iconMap[method] || 'money-bill-wave'
}

const getPaymentMethodIconColor = (method: string) => {
  const colorMap: Record<string, string> = {
    'card': 'text-blue-600',
    'promptpay': 'text-green-600'
  }
  return colorMap[method] || 'text-gray-600'
}

onMounted(() => {
  loadPaymentHistory()
})
</script>

<style scoped>
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
