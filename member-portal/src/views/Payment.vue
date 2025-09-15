<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/20">
    <!-- Notification Container -->
    <NotificationContainer />
    <!-- Hero Header Section -->
    <div
      class="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 px-6 py-16 md:px-8"
    >
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div
        class="absolute top-0 right-0 w-64 h-64 bg-secondary-400/20 rounded-full -translate-y-32 translate-x-32"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-48 h-48 bg-primary-300/20 rounded-full translate-y-24 -translate-x-24"
      ></div>

      <div class="relative max-w-4xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
          Complete Your Subscription 💳
        </h1>
        <p class="text-xl text-white/90 font-medium max-w-2xl mx-auto">
          Choose your preferred payment method to subscribe to this plan
        </p>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10 pb-12">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="relative">
            <div
              class="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mx-auto mb-6"
            ></div>
          </div>
          <h3 class="text-lg font-bold text-primary-700 mb-2">Loading Payment Options</h3>
          <p class="text-primary-600 text-sm">Please wait while we prepare your payment...</p>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-white/80 backdrop-blur-sm rounded-3xl border border-error-200 shadow-xl p-8"
      >
        <div class="text-center max-w-md mx-auto">
          <div
            class="w-20 h-20 bg-gradient-to-r from-error-500 to-error-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <FontAwesomeIcon icon="exclamation-triangle" class="w-10 h-10 text-white" />
          </div>
          <h3 class="text-xl font-bold text-error-800 mb-3">Payment Error</h3>
          <p class="text-error-600 mb-6 font-medium text-sm">{{ error }}</p>
          <button
            @click="goBack"
            class="bg-gradient-to-r from-error-500 to-error-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-error-600 hover:to-error-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FontAwesomeIcon icon="arrow-left" class="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>

      <!-- Payment Form -->
      <div v-else class="space-y-8">
        <!-- Plan Summary -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl border border-primary-200 shadow-xl p-8">
          <h2 class="text-2xl font-bold text-primary-700 mb-6">Plan Summary</h2>
          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <h3 class="text-xl font-bold text-primary-800 mb-2">{{ planName }}</h3>
              <p class="text-primary-600 mb-4">{{ organization }}</p>
              <div class="text-3xl font-black text-primary-700">
                ฿{{ price.toLocaleString() }}
                <span class="text-lg font-normal text-primary-500">/ {{ duration }} days</span>
              </div>
            </div>
            <div class="flex items-center justify-center">
              <div
                class="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center shadow-lg"
              >
                <FontAwesomeIcon icon="credit-card" class="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl border border-primary-200 shadow-xl p-8">
          <h2 class="text-2xl font-bold text-primary-700 mb-6">Choose Payment Method</h2>

          <div class="grid gap-4 md:grid-cols-2">
            <!-- Card Payment -->
            <div
              class="border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200"
              :class="selectedMethod === 'card'
                ? 'border-primary-500 bg-primary-50 shadow-lg'
                : 'border-gray-200 hover:border-primary-300 hover:shadow-md'"
              @click="selectPaymentMethod('card')"
            >
              <div class="flex items-center space-x-4">
                <div
                  class="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center"
                >
                  <FontAwesomeIcon icon="credit-card" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-primary-700">Credit/Debit Card</h3>
                  <p class="text-sm text-primary-600">Visa, Mastercard, JCB</p>
                </div>
              </div>
            </div>

            <!-- PromptPay Payment -->
            <div
              class="border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200"
              :class="selectedMethod === 'promptpay'
                ? 'border-primary-500 bg-primary-50 shadow-lg'
                : 'border-gray-200 hover:border-primary-300 hover:shadow-md'"
              @click="selectPaymentMethod('promptpay')"
            >
              <div class="flex items-center space-x-4">
                <div
                  class="w-12 h-12 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center"
                >
                  <FontAwesomeIcon icon="qrcode" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-primary-700">PromptPay</h3>
                  <p class="text-sm text-primary-600">QR Code Payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Form -->
        <div v-if="selectedMethod" class="bg-white/80 backdrop-blur-sm rounded-3xl border border-primary-200 shadow-xl p-8">
          <h2 class="text-2xl font-bold text-primary-700 mb-6">Payment Details</h2>

          <!-- Card Payment Form -->
          <div v-if="selectedMethod === 'card'" class="space-y-6">
            <div class="text-center mb-6">
              <p class="text-primary-600 font-medium">
                Enter your card details securely. Your card information is encrypted and processed by Omise.
              </p>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label for="cardNumber" class="block text-sm font-bold text-primary-700 mb-2">Card Number</label>
                <input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  class="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  :value="cardData.number"
                  @input="formatCardNumber"
                  maxlength="19"
                />
              </div>
              <div>
                <label for="cardholderName" class="block text-sm font-bold text-primary-700 mb-2">Cardholder Name</label>
                <input
                  id="cardholderName"
                  type="text"
                  placeholder="John Doe"
                  class="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  :value="cardData.name"
                  @input="updateCardData('name', $event.target.value)"
                />
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-3">
              <div>
                <label for="expiryMonth" class="block text-sm font-bold text-primary-700 mb-2">Expiry Month</label>
                <select
                  id="expiryMonth"
                  class="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  :value="cardData.expiration_month"
                  @change="updateCardData('expiration_month', $event.target.value)"
                >
                  <option value="">Month</option>
                  <option v-for="month in 12" :key="month" :value="month.toString().padStart(2, '0')">
                    {{ month.toString().padStart(2, '0') }}
                  </option>
                </select>
              </div>
              <div>
                <label for="expiryYear" class="block text-sm font-bold text-primary-700 mb-2">Expiry Year</label>
                <select
                  id="expiryYear"
                  class="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  :value="cardData.expiration_year"
                  @change="updateCardData('expiration_year', $event.target.value)"
                >
                  <option value="">Year</option>
                  <option v-for="year in 10" :key="year" :value="(new Date().getFullYear() + year).toString()">
                    {{ new Date().getFullYear() + year }}
                  </option>
                </select>
              </div>
              <div>
                <label for="cvv" class="block text-sm font-bold text-primary-700 mb-2">CVV</label>
                <input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  class="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  :value="cardData.security_code"
                  @input="updateCardData('security_code', $event.target.value)"
                  maxlength="4"
                />
              </div>
            </div>
          </div>

          <!-- PromptPay Payment Form -->
          <div v-else-if="selectedMethod === 'promptpay'" class="space-y-6">
            <div v-if="!promptPayQRCode" class="text-center">
              <div class="w-64 h-64 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div class="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500"></div>
              </div>
              <p class="text-primary-600 font-medium mb-4">
                Preparing QR code for payment...
              </p>
            </div>
            <div v-else class="text-center">
              <div class="w-64 h-64 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-primary-200">
                <img
                  :src="promptPayQRCode"
                  alt="PromptPay QR Code"
                  class="w-60 h-60 object-contain"
                />
              </div>
              <p class="text-primary-600 font-medium mb-4">
                Scan this QR code with your banking app to complete payment
              </p>
              <p class="text-sm text-gray-500 mb-4">
                Amount: ฿{{ formattedPrice }}
              </p>
              <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p class="text-sm text-yellow-800 font-medium">
                  <FontAwesomeIcon icon="clock" class="w-4 h-4 mr-2" />
                  Please complete payment within 15 minutes
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              @click="goBack"
              class="flex-1 px-8 py-4 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FontAwesomeIcon icon="arrow-left" class="w-5 h-5 mr-2" />
              Cancel
            </button>
            <button
              @click="processPayment"
              :disabled="processing || (selectedMethod === 'promptpay' && !promptPayQRCode)"
              class="flex-1 px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center"
            >
              <div v-if="processing" class="flex items-center">
                <div
                  class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"
                ></div>
                {{ selectedMethod === 'promptpay' ? 'Generating QR Code...' : 'Processing...' }}
              </div>
              <span v-else class="flex items-center">
                <FontAwesomeIcon :icon="selectedMethod === 'promptpay' ? 'qrcode' : 'credit-card'" class="w-5 h-5 mr-2" />
                {{ selectedMethod === 'promptpay' ? 'QR Code Generated' : `Pay ฿${price.toLocaleString()}` }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { paymentApi, type PaymentData } from '../api/payment'
import { getOmiseService, type OmiseCardData } from '../services/omiseService'
import NotificationContainer from '../components/NotificationContainer.vue'
import notificationService from '../services/notificationService'

// Composables
const route = useRoute()
const router = useRouter()

// State
const loading = ref(false)
const error = ref('')
const selectedMethod = ref<'card' | 'promptpay' | null>(null)
const processing = ref(false)
const omiseService = ref<any>(null)

// Plan data from query params
const planId = ref('')
const planName = ref('')
const price = ref(0)
const duration = ref(0)
const organization = ref('')
const organizationId = ref('')

// Card form data
const cardData = ref<OmiseCardData>({
  name: '',
  number: '',
  expiration_month: '',
  expiration_year: '',
  security_code: ''
})

// PromptPay data
const promptPayQRCode = ref('')
const promptPaySourceId = ref('')
const paymentId = ref('')
const pollingInterval = ref<any>(null)

// Computed
const amountInSatang = computed(() => Math.round(price.value * 100))
const formattedPrice = computed(() => price.value.toLocaleString())

// Methods
const selectPaymentMethod = async (method: 'card' | 'promptpay') => {
  selectedMethod.value = method
  error.value = ''

  // Clear previous data
  if (method === 'card') {
    promptPayQRCode.value = ''
    promptPaySourceId.value = ''
  } else {
    cardData.value = {
      name: '',
      number: '',
      expiration_month: '',
      expiration_year: '',
      security_code: ''
    }

    // Auto-generate QR code for PromptPay
    if (method === 'promptpay') {
      try {
        await processPromptPayPayment()
      } catch (err) {
        console.error('Failed to generate QR code:', err)
        error.value = 'Failed to generate QR code. Please try again.'
      }
    }
  }
}

const processPayment = async () => {
  if (!selectedMethod.value) return

  try {
    processing.value = true
    error.value = ''

    if (selectedMethod.value === 'card') {
      await processCardPayment()
    } else if (selectedMethod.value === 'promptpay') {
      // For PromptPay, payment is already processed when method is selected
      // Just show a message that payment is being processed
      console.log('PromptPay payment is already being processed')
    }
  } catch (err) {
    console.error('Payment failed:', err)
    error.value = err instanceof Error ? err.message : 'Payment failed'
  } finally {
    processing.value = false
  }
}

const processCardPayment = async () => {
  try {
    // Validate card data
    const validation = omiseService.value.validateCardData(cardData.value)
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '))
    }

    // Create Omise token
    const token = await omiseService.value.createCardToken(cardData.value)

    // Create payment with token
    const paymentData: PaymentData = {
      planId: planId.value,
      paymentMethod: 'card',
      paymentSource: token.id,
      customerData: {
        name: cardData.value.name,
        email: '', // You might want to get this from user profile
        phone: ''
      }
    }

    const result = await paymentApi.createSubscriptionPayment(paymentData)
    paymentId.value = result.paymentId

    // Check payment status
    await checkPaymentStatus(result.paymentId)
  } catch (err) {
    console.error('Card payment failed:', err)
    notificationService.paymentFailed(planName.value, err instanceof Error ? err.message : 'Unknown error')
    throw err
  }
}

const processPromptPayPayment = async () => {
  try {
    processing.value = true
    error.value = ''

    // Use backend to create PromptPay payment and get QR code
    console.log('Creating PromptPay payment via backend...')

    const paymentData: PaymentData = {
      planId: planId.value,
      paymentMethod: 'promptpay',
      customerData: {
        name: '',
        email: '',
        phone: ''
      }
    }

    const result = await paymentApi.createSubscriptionPayment(paymentData)
    paymentId.value = result.paymentId

    if (result.qr_code_url) {
      promptPayQRCode.value = result.qr_code_url
      console.log('QR code received from backend:', promptPayQRCode.value)
    } else {
      throw new Error('Backend did not provide QR code URL')
    }

    // Start polling for payment status
    startPaymentPolling(paymentId.value)
  } catch (err) {
    console.error('PromptPay payment failed:', err)
    error.value = err instanceof Error ? err.message : 'Failed to create PromptPay payment'

    // Show error notification
    notificationService.paymentFailed(planName.value, err instanceof Error ? err.message : 'Failed to create PromptPay payment')

    throw err
  } finally {
    processing.value = false
  }
}

const checkPaymentStatus = async (paymentId: string) => {
  try {
    const status = await paymentApi.getPaymentStatus(paymentId)

    if (status.status === 'successful') {
      // Payment successful - show success notification
      notificationService.paymentSuccess(planName.value, price.value, paymentId)

      // Redirect after a short delay to let user see the notification
      setTimeout(() => {
        router.push('/subscriptions')
      }, 2000)
    } else if (status.status === 'failed') {
      // Payment failed - show error notification
      notificationService.paymentFailed(planName.value, 'Payment was declined or failed')
      throw new Error('Payment failed. Please try again.')
    } else {
      // Still processing, check again in 3 seconds
      setTimeout(() => checkPaymentStatus(paymentId), 3000)
    }
  } catch (err) {
    console.error('Error checking payment status:', err)
    throw err
  }
}

const startPaymentPolling = (paymentId: string) => {
  // Poll every 3 seconds for up to 5 minutes
  let attempts = 0
  const maxAttempts = 100 // 5 minutes

  pollingInterval.value = setInterval(async () => {
    try {
      attempts++
      const status = await paymentApi.getPaymentStatus(paymentId)

      if (status.status === 'successful') {
        clearInterval(pollingInterval.value)

        // Show success notification
        notificationService.paymentSuccess(planName.value, price.value, paymentId)

        // Redirect after a short delay
        setTimeout(() => {
          router.push('/subscriptions')
        }, 2000)
      } else if (status.status === 'failed' || status.status === 'expired') {
        clearInterval(pollingInterval.value)

        // Show error notification
        notificationService.paymentFailed(planName.value, `Payment ${status.status}`)

        error.value = `Payment ${status.status}. Please try again.`
      } else if (attempts >= maxAttempts) {
        clearInterval(pollingInterval.value)

        // Show timeout notification
        notificationService.paymentFailed(planName.value, 'Payment verification timeout. Please check your payment status manually.')

        error.value = 'Payment verification timeout. Please check your payment status manually.'
      }
    } catch (err) {
      console.error('Error polling payment status:', err)
      if (attempts >= maxAttempts) {
        clearInterval(pollingInterval.value)

        // Show error notification
        notificationService.paymentFailed(planName.value, 'Unable to verify payment status. Please check your payment status manually.')

        error.value = 'Payment verification failed. Please check your payment status manually.'
      }
    }
  }, 3000)
}

const formatCardNumber = (event: Event) => {
  const target = event.target as HTMLInputElement
  const formatted = omiseService.value.formatCardNumber(target.value)
  target.value = formatted
  cardData.value.number = formatted.replace(/\s/g, '')
}

const updateCardData = (field: keyof OmiseCardData, value: string) => {
  cardData.value[field] = value
}

const goBack = () => {
  router.go(-1)
}

// Lifecycle
onMounted(async () => {
  try {
    loading.value = true

    // Get plan data from query params
    planId.value = route.query.planId as string || ''
    planName.value = route.query.planName as string || ''
    price.value = parseFloat(route.query.price as string || '0')
    duration.value = parseInt(route.query.duration as string || '0')
    organization.value = route.query.organization as string || ''
    organizationId.value = route.query.organizationId as string || ''

    if (!planId.value || !planName.value) {
      error.value = 'Invalid plan information. Please try again.'
      return
    }

    // Initialize Omise service
    try {
      const publicKey = await paymentApi.getOmisePublicKey()
      omiseService.value = getOmiseService(publicKey)

      if (!omiseService.value.isOmiseAvailable()) {
        throw new Error('Omise payment gateway is not available')
      }
    } catch (err) {
      console.error('Failed to initialize Omise:', err)
      error.value = 'Payment gateway initialization failed. Please try again later.'
      return
    }

    loading.value = false
  } catch (err) {
    console.error('Failed to initialize payment page:', err)
    error.value = 'Failed to initialize payment page. Please try again.'
    loading.value = false
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }
})
</script>
