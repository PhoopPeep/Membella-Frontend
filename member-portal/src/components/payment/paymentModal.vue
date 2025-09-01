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

          <!-- Card Form using traditional approach -->
          <form @submit.prevent="processCardPayment" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                v-model="cardForm.name"
                type="text"
                class="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter cardholder name"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                v-model="cardForm.number"
                type="text"
                maxlength="19"
                class="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1234 5678 9012 3456"
                @input="formatCardNumber"
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  v-model="cardForm.expiry"
                  type="text"
                  maxlength="5"
                  class="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="MM/YY"
                  @input="formatExpiry"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Security Code
                </label>
                <input
                  v-model="cardForm.security_code"
                  type="text"
                  maxlength="4"
                  class="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123"
                  required
                />
              </div>
            </div>
          </form>
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
            :disabled="!selectedMethod || isProcessing || (selectedMethod === 'card' && !isCardFormValid)"
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
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

// Omise type definitions
interface OmiseInstance {
  setPublicKey: (key: string) => void
  createToken: (type: string, data: CardData, callback: (statusCode: number, response: TokenResponse) => void) => void
}

interface CardData {
  name: string
  number: string
  expiration_month: number
  expiration_year: number
  security_code: string
}

interface TokenResponse {
  object: string
  id?: string
  message?: string
  card?: {
    security_code_check: boolean
  }
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
const isProcessing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const qrCodeUrl = ref('')
const isPollingPayment = ref(false)

// Card form data
const cardForm = ref({
  name: '',
  number: '',
  expiry: '',
  security_code: ''
})

// Omise instance
let omise: OmiseInstance | null = null

// Computed for card form validation
const isCardFormValid = computed(() => {
  return cardForm.value.name.trim() !== '' &&
         cardForm.value.number.replace(/\s/g, '').length >= 13 &&
         cardForm.value.expiry.length === 5 &&
         cardForm.value.security_code.length >= 3
})

// Initialize Omise
const initializeOmise = async () => {
  try {
    console.log('Starting Omise initialization...')

    // Load Omise script first
    await loadOmiseScript()

    // Get public key from backend
    const publicKey = await paymentApi.getOmisePublicKey()
    console.log('Got Omise public key:', publicKey ? 'Yes' : 'No')

    // Set public key using the traditional approach
    omise = (window as unknown as { Omise: OmiseInstance }).Omise
    if (!omise) {
      throw new Error('Omise script not loaded properly')
    }

    // Use setPublicKey method as per documentation
    omise.setPublicKey(publicKey)

    console.log('Omise initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Omise:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to initialize payment system'
  }
}

// Load Omise script
const loadOmiseScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as unknown as { Omise?: OmiseInstance }).Omise) {
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

// Select payment method
const selectPaymentMethod = async (method: 'card' | 'promptpay') => {
  selectedMethod.value = method
  errorMessage.value = ''
  qrCodeUrl.value = ''
}

// Format card number with spaces
const formatCardNumber = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\s/g, '').replace(/[^0-9]/g, '')

  // Add spaces every 4 digits
  value = value.replace(/(.{4})/g, '$1 ').trim()

  cardForm.value.number = value
}

// Format expiry date
const formatExpiry = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/[^0-9]/g, '')

  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }

  cardForm.value.expiry = value
}

// Process payment
const processPayment = async () => {
  if (!selectedMethod.value) return

  isProcessing.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (selectedMethod.value === 'card') {
      // For card payments, create token first using Omise.createToken
      await processCardPayment()
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

// Process card payment using Omise.createToken
const processCardPayment = async () => {
  try {
    if (!omise) {
      throw new Error('Omise not initialized')
    }

    if (!isCardFormValid.value) {
      throw new Error('Please fill in all card details')
    }

    // Parse expiry date
    const [expMonth, expYear] = cardForm.value.expiry.split('/')
    const currentYear = new Date().getFullYear()
    const fullYear = parseInt('20' + expYear)

    // Prepare card data according to Omise documentation
    const cardData = {
      name: cardForm.value.name.trim(),
      number: cardForm.value.number.replace(/\s/g, ''),
      expiration_month: parseInt(expMonth),
      expiration_year: fullYear,
      security_code: cardForm.value.security_code
    }

    console.log('Creating token with card data:', {
      ...cardData,
      number: cardData.number.replace(/\d(?=\d{4})/g, '*'),
      security_code: '***'
    })

    // Create token using Omise.createToken as per documentation
    omise.createToken('card', cardData, async (statusCode: number, response: any) => {
      try {
        if (statusCode === 200 && response.object !== 'error') {
          console.log('Token created successfully:', response.id)

          // Check security code validation
          if (!response.card.security_code_check) {
            errorMessage.value = 'Security code validation failed'
            isProcessing.value = false
            return
          }

          await submitCardPayment(response.id)
        } else {
          console.error('Token creation failed:', response)
          errorMessage.value = response.message || 'Card validation failed'
          isProcessing.value = false
        }
      } catch (error) {
        console.error('Error in token callback:', error)
        errorMessage.value = error instanceof Error ? error.message : 'Token processing failed'
        isProcessing.value = false
      }
    })
  } catch (error) {
    console.error('Card payment processing error:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Card payment failed'
    isProcessing.value = false
  }
}

// Submit card payment to backend
const submitCardPayment = async (token: string) => {
  try {
    const paymentData: PaymentData = {
      planId: props.plan.id,
      paymentMethod: 'card',
      paymentSource: token,
      customerData: {
        name: cardForm.value.name.trim()
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
  // Clean up if needed
})
</script>
