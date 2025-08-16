<!-- member-portal/src/views/BrowsePlans.vue -->
<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Select the perfect plan for your needs. All plans include access to our core features.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <FontAwesomeIcon icon="exclamation-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-red-800 mb-2">Error Loading Plans</h3>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        @click="loadPlans"
        class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Plans Grid -->
    <div v-else-if="plans.length > 0" class="grid gap-8 lg:grid-cols-3 md:grid-cols-2">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
        :class="{ 'ring-2 ring-blue-500': plan.popular }"
      >
        <!-- Plan Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-semibold text-gray-900">{{ plan.name }}</h3>
            <span v-if="plan.popular" class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              Popular
            </span>
          </div>
          <p class="text-gray-600 mb-4">{{ plan.description }}</p>
          <div class="flex items-baseline">
            <span class="text-3xl font-bold text-gray-900">฿{{ plan.price }}</span>
            <span class="text-gray-500 ml-2">/ {{ plan.duration }} days</span>
          </div>
          <p class="text-sm text-gray-500 mt-2">by {{ plan.organization }}</p>
        </div>

        <!-- Features List -->
        <div class="p-6">
          <h4 class="font-medium text-gray-900 mb-4">What's included:</h4>
          <ul class="space-y-3">
            <li
              v-for="feature in plan.features"
              :key="feature.id"
              class="flex items-start"
            >
              <FontAwesomeIcon icon="check" class="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p class="text-sm font-medium text-gray-900">{{ feature.name }}</p>
                <p class="text-xs text-gray-500">{{ feature.description }}</p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Subscribe Button -->
        <div class="p-6 pt-0">
          <button
            @click="subscribeToPlan(plan)"
            :disabled="subscribing === plan.id"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <div v-if="subscribing === plan.id" class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Subscribing...
            </div>
            <span v-else>Subscribe Now</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <FontAwesomeIcon icon="search" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No Plans Available</h3>
      <p class="text-gray-500">There are currently no subscription plans available.</p>
    </div>

    <!-- Success Modal -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
        <div class="text-center">
          <FontAwesomeIcon icon="check-circle" class="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Subscription Successful!</h3>
          <p class="text-gray-600 mb-6">
            You have successfully subscribed to {{ selectedPlan?.name }}.
            You can view your subscription details in your account.
          </p>
          <div class="flex space-x-3">
            <button
              @click="closeSuccessModal"
              class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            <button
              @click="goToSubscription"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              View Subscription
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
import { memberApi } from '../api/member'

const router = useRouter()

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
  popular?: boolean
}

const plans = ref<Plan[]>([])
const loading = ref(false)
const error = ref('')
const subscribing = ref<string | null>(null)
const showSuccessModal = ref(false)
const selectedPlan = ref<Plan | null>(null)

const loadPlans = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await memberApi.getAvailablePlans()
    plans.value = data.map((plan, index) => ({
      ...plan,
      popular: index === 1 // Mark second plan as popular for demo
    }))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load plans'
  } finally {
    loading.value = false
  }
}

const subscribeToPlan = async (plan: Plan) => {
  try {
    subscribing.value = plan.id
    await memberApi.subscribe(plan.id)
    selectedPlan.value = plan
    showSuccessModal.value = true
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to subscribe'
  } finally {
    subscribing.value = null
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  selectedPlan.value = null
}

const goToSubscription = () => {
  closeSuccessModal()
  router.push('/subscription')
}

onMounted(() => {
  loadPlans()
})
</script>
