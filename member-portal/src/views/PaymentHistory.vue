<template>
  <div class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
      <p class="text-gray-600">View all your payment transactions and receipts</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center">
        <FontAwesomeIcon icon="exclamation-circle" class="w-5 h-5 text-red-500 mr-2" />
        <h3 class="text-lg font-medium text-red-800">Error Loading Payment History</h3>
      </div>
      <p class="text-red-600 mt-2">{{ error }}</p>
      <button
        @click="loadPaymentHistory"
        class="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Payment History Table -->
    <div v-else-if="payments.length > 0" class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">Transaction History</h2>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">
              {{ payments.length }} transaction{{ payments.length === 1 ? '' : 's' }}
            </span>
            <button
              @click="loadPaymentHistory"
              class="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <FontAwesomeIcon icon="sync-alt" class="w-4 h-4 mr-1" />
              Refresh
            </button>
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
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
      <FontAwesomeIcon icon="receipt" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
      <p class="text-gray-500 mb-6">You haven't made any payments yet.</p>
      <router-link
        to="/homepage"
        class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
      >
        <FontAwesomeIcon icon="search" class="w-4 h-4 mr-2" />
        Browse Plans
      </router-link>
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

          <!-- Actions -->
          <div v-if="selectedPayment.status === 'successful'" class="flex justify-center">
            <button
              @click="downloadReceipt(selectedPayment)"
              class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <FontAwesomeIcon icon="download" class="w-4 h-4" />
              <span>Download Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { paymentApi, type PaymentHistory } from '../api/payment'

// State
const loading = ref(false)
const error = ref('')
const payments = ref<PaymentHistory[]>([])
const selectedPayment = ref<PaymentHistory | null>(null)
const showDetailsModal = ref(false)

// Methods
const loadPaymentHistory = async () => {
  try {
    loading.value = true
    error.value = ''

    const data = await paymentApi.getPaymentHistory()
    payments.value = data

    console.log('Payment history loaded:', data.length)
  } catch (err) {
    console.error('Failed to load payment history:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load payment history'
  } finally {
    loading.value = false
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

const downloadReceipt = async (payment: PaymentHistory) => {
  try {
    const receiptContent = generateReceiptText(payment)
    const blob = new Blob([receiptContent], { type: 'text/plain' })
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

Thank you for your payment!
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
  return iconMap[method] || 'money-bill'
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
