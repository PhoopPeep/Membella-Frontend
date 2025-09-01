<template>
  <div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white">Subscribe to Plan</h2>
            <p class="text-blue-100">{{ plan.name }} - {{ plan.organization }}</p>
          </div>
          <button
            @click="$emit('close')"
            class="text-white hover:text-gray-200 transition-colors"
          >
            <FontAwesomeIcon icon="times" class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Plan Summary -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Plan Summary</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Plan</p>
              <p class="font-medium">{{ plan.name }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Duration</p>
              <p class="font-medium">{{ plan.duration }} days</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Organization</p>
              <p class="font-medium">{{ plan.organization }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Total Price</p>
              <p class="text-xl font-bold text-green-600">฿{{ plan.price }}</p>
            </div>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              @click="selectPaymentMethod('card')"
              :class="[
                'p-4 border-2 rounded-lg transition-colors',
                selectedMethod === 'card'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <div class="flex items-center space-x-3">
                <FontAwesomeIcon icon="credit-card" class="w-6 h-6 text-blue-600" />
                <div class="text-left">
                  <p class="font-medium">Credit/Debit Card</p>
                  <p class="text-sm text-gray-500">Visa, Mastercard, etc.</p>
                </div>
              </div>
            </button>

            <button
              @click="selectPaymentMethod('promptpay')"
              :class="[
                'p-4 border-2 rounded-lg transition-colors',
                selectedMethod === 'promptpay'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <div class="flex items-center space-x-3">
                <FontAwesomeIcon icon="qrcode" class="w-6 h-6 text-green-600" />
                <div class="text-left">
                  <p class="font-medium">PromptPay QR</p>
                  <p class="text-sm text-gray-500">Scan to pay</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Card Payment Form -->
        <div v-if="selectedMethod === 'card'" class="mb-6">
          <h4 class="text-md font-semibold text-gray-900 mb-4">Card Information</h4>

          <!-- Card Form -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <div id="card-number" class="border border-gray-300 rounded-md p-3 min-h-[48px]"></div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <div id="expiry-date" class="border border-gray-300 rounded-md p-3 min-h-[48px]"></div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Security Code
                </label>
                <div id="security-code" class="border border-gray-300 rounded-md p-3 min-h-[48px]"></div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                v-model="cardholderName"
                type="text"
                class="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter cardholder name"
              />
            </div>
          </div>
        </div>

        <!-- PromptPay QR Code -->
        <div v-if="selectedMethod === 'promptpay' && qrCodeUrl" class="mb-6 text-center">
          <h4 class="text-md font-semibold text-gray-900 mb-4">Scan QR Code to Pay</h4>
          <div class="bg-white p-4 rounded-lg border">
            <img :src="qrCodeUrl" alt="PromptPay QR Code" class="mx-auto max-w-xs" />
            <p class="text-sm text-gray-500 mt-2">
              Open your mobile banking app and scan this QR code
            </p>
            <p class="text-lg font-bold text-green-600 mt-2">฿{{ plan.price }}</p>
          </div>

          <!-- Payment Status -->
          <div v-if="isPollingPayment" class="mt-4">
            <div class="flex items-center justify-center space-x-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span class="text-sm text-gray-600">Waiting for payment...</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Please complete the payment on your mobile banking app
            </p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p class="text-sm text-green-600">{{ successMessage }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3">
          <button
            @click="$emit('close')"
            :disabled="isProcessing"
            class="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            @click="processPayment"
            :disabled="!selectedMethod || isProcessing || (selectedMethod === 'card' && !cardholderName)"
            class="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div v-if="isProcessing" class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {{ selectedMethod === 'promptpay' ? 'Generating QR Code...' : 'Processing...' }}
            </div>
            <span v-else>
              {{ selectedMethod === 'promptpay' ? 'Generate QR Code' : 'Pay Now' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { paymentApi, type PaymentData } from '../../api/payment'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  duration: number
  organization: string
  features: Array<{
    id: string
    name: string
    description: string
  }>
}

const props = defineProps<{
  plan: Plan
}>()

const emit = defineEmits<{
  close: []
  success: [paymentId: string]
}>()

// State
const selectedMethod = ref<'card' | 'promptpay' | null>(null)
const cardholderName = ref('')
const isProcessing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const qrCodeUrl = ref('')
const isPollingPayment = ref(false)

// Omise variables
let omise: any = null
let card: any = null

// Initialize Omise
const initializeOmise = async () => {
  try {
    console.log('Starting Omise initialization...')

    // Load Omise script first
    await loadOmiseScript()

    // Get public key from backend
    const publicKey = await paymentApi.getOmisePublicKey()
    console.log('Got Omise public key:', publicKey ? 'Yes' : 'No')

    // Initialize Omise with public key
    omise = (window as any).Omise
    if (!omise) {
      throw new Error('Omise script not loaded properly')
    }

    console.log('Setting Omise public key...')
    omise.setPublicKey(publicKey)

    console.log('Omise initialized successfully with key:', publicKey.substring(0, 20) + '...')
  } catch (error) {
    console.error('Failed to initialize Omise:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to initialize payment system'
  }
}

// Load Omise script
const loadOmiseScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).Omise) {
      console.log('Omise script already loaded')
      resolve()
      return
    }

    console.log('Loading Omise script...')
    const script = document.createElement('script')
    script.src = 'https://cdn.omise.co/omise.js'
    script.onload = () => {
      console.log('Omise script loaded successfully')
      resolve()
    }
    script.onerror = () => {
      console.error('Failed to load Omise script')
      reject(new Error('Failed to load Omise script'))
    }
    document.head.appendChild(script)
  })
}

// Initialize card form - FIXED VERSION
const initializeCardForm = async () => {
  if (!omise) {
    console.error('Omise not initialized')
    return
  }

  await nextTick()

  try {
    console.log('Initializing card form...')

    // Create individual field elements
    const cardNumberElement = document.getElementById('card-number')
    const expiryDateElement = document.getElementById('expiry-date')
    const securityCodeElement = document.getElementById('security-code')

    if (!cardNumberElement || !expiryDateElement || !securityCodeElement) {
      throw new Error('Card form elements not found')
    }

    // Initialize individual fields
    omise.card.fields = {
      number: omise.card.createNumberField({
        element: cardNumberElement,
        placeholder: '4242 4242 4242 4242'
      }),
      expiryDate: omise.card.createExpiryDateField({
        element: expiryDateElement,
        placeholder: 'MM/YY'
      }),
      securityCode: omise.card.createSecurityCodeField({
        element: securityCodeElement,
        placeholder: '123'
      })
    }

    console.log('Card form initialized successfully')
  } catch (error) {
    console.error('Failed to initialize card form:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to initialize card form'
  }
}

// Select payment method
const selectPaymentMethod = async (method: 'card' | 'promptpay') => {
  selectedMethod.value = method
  errorMessage.value = ''
  qrCodeUrl.value = ''

  if (method === 'card') {
    await nextTick()
    initializeCardForm()
  }
}

// Process payment
const processPayment = async () => {
  if (!selectedMethod.value) return

  isProcessing.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (selectedMethod.value === 'card') {
      // For card payments, create token first
      if (!cardholderName.value.trim()) {
        errorMessage.value = 'Please enter cardholder name'
        isProcessing.value = false
        return
      }

      // Create token using Omise.js
      omise.createToken('card', {
        name: cardholderName.value.trim()
      }, (statusCode: number, response: any) => {
        if (statusCode === 200) {
          submitCardPayment(response.id)
        } else {
          console.error('Token creation failed:', response)
          errorMessage.value = response.message || 'Card validation failed'
          isProcessing.value = false
        }
      })
    } else {
      // PromptPay payment
      await processPromptPayPayment()
    }
  } catch (error) {
    console.error('Payment processing error:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Payment processing failed'
    isProcessing.value = false
  }
}

// Submit card payment
const submitCardPayment = async (token: string) => {
  try {
    const paymentData: PaymentData = {
      planId: props.plan.id,
      paymentMethod: 'card',
      paymentSource: token,
      customerData: {
        name: cardholderName.value.trim()
      }
    }

    const result = await paymentApi.createSubscriptionPayment(paymentData)

    if (result.status === 'successful') {
      successMessage.value = 'Payment successful! Subscription activated.'
      setTimeout(() => {
        emit('success', result.paymentId)
      }, 2000)
    } else {
      errorMessage.value = `Payment ${result.status}. Please try again.`
    }
  } catch (error) {
    console.error('Card payment submission failed:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Payment failed'
  } finally {
    isProcessing.value = false
  }
}

// Process PromptPay payment
const processPromptPayPayment = async () => {
  try {
    const paymentData: PaymentData = {
      planId: props.plan.id,
      paymentMethod: 'promptpay'
    }

    const result = await paymentApi.createSubscriptionPayment(paymentData)

    if (result.qr_code_url) {
      qrCodeUrl.value = result.qr_code_url
      isProcessing.value = false
      isPollingPayment.value = true

      // Start polling for payment status
      startPaymentPolling(result.paymentId)
    } else {
      throw new Error('Failed to generate QR code')
    }
  } catch (error) {
    console.error('PromptPay payment failed:', error)
    errorMessage.value = error instanceof Error ? error.message : 'PromptPay payment failed'
    isProcessing.value = false
  }
}

// Start payment polling for PromptPay
const startPaymentPolling = async (paymentId: string) => {
  try {
    const result = await paymentApi.pollPaymentStatus(paymentId)

    isPollingPayment.value = false

    if (result.status === 'successful') {
      successMessage.value = 'Payment successful! Subscription activated.'
      setTimeout(() => {
        emit('success', paymentId)
      }, 2000)
    } else {
      errorMessage.value = `Payment ${result.status}. Please try again.`
    }
  } catch (error) {
    console.error('Payment polling failed:', error)
    isPollingPayment.value = false
    errorMessage.value = error instanceof Error ? error.message : 'Payment verification failed'
  }
}

onMounted(() => {
  initializeOmise()
})

onUnmounted(() => {
  // Clean up Omise card form
  if (card) {
    try {
      card.destroy()
    } catch (error) {
      console.warn('Failed to cleanup card form:', error)
    }
  }
})
</script>
