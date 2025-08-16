<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">My Subscription</h1>
      <p class="text-gray-600">Manage your subscription and view your benefits</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center">
        <FontAwesomeIcon icon="exclamation-circle" class="w-5 h-5 text-red-500 mr-2" />
        <h3 class="text-lg font-medium text-red-800">Error</h3>
      </div>
      <p class="text-red-600 mt-2">{{ error }}</p>
      <button
        @click="loadSubscription"
        class="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Subscription Content -->
    <div v-else class="space-y-6">
      <!-- Current Subscription Card -->
      <div class="bg-white rounded-lg shadow border border-gray-200">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Current Subscription</h2>
            <span
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="getStatusClass(subscription?.status)"
            >
              {{ subscription?.status || 'No Active Subscription' }}
            </span>
          </div>

          <div v-if="subscription" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p class="text-sm text-gray-500">Plan Name</p>
                <p class="text-lg font-medium text-gray-900">{{ subscription.planName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Start Date</p>
                <p class="text-lg font-medium text-gray-900">
                  {{ formatDate(subscription.startDate) }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500">End Date</p>
                <p class="text-lg font-medium text-gray-900">
                  {{ formatDate(subscription.endDate) }}
                </p>
              </div>
            </div>

            <!-- Days Remaining -->
            <div
              v-if="subscription.status === 'active'"
              class="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div class="flex items-center">
                <FontAwesomeIcon icon="clock" class="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p class="text-sm font-medium text-blue-800">Days Remaining</p>
                  <p class="text-lg font-bold text-blue-900">
                    {{ subscription.daysRemaining }} days
                  </p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                @click="goToBrowsePlans"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <FontAwesomeIcon icon="search" class="w-4 h-4 mr-2" />
                Browse Other Plans
              </button>
              <button
                v-if="subscription.status === 'active'"
                @click="cancelSubscription"
                class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                <FontAwesomeIcon icon="times" class="w-4 h-4 mr-2" />
                Cancel Subscription
              </button>
            </div>
          </div>

          <!-- No Subscription State -->
          <div v-else class="text-center py-8">
            <FontAwesomeIcon icon="credit-card" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
            <p class="text-gray-500 mb-6">
              You don't have an active subscription. Browse our plans to get started.
            </p>
            <button
              @click="goToBrowsePlans"
              class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              <FontAwesomeIcon icon="search" class="w-4 h-4 mr-2" />
              Browse Plans
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div v-if="subscription" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div class="flex items-center">
            <FontAwesomeIcon icon="calendar" class="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p class="text-sm text-gray-500">Subscription ID</p>
              <p class="text-lg font-medium text-gray-900">{{ subscription.id }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div class="flex items-center">
            <FontAwesomeIcon icon="check-circle" class="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p class="text-sm text-gray-500">Status</p>
              <p class="text-lg font-medium text-gray-900 capitalize">{{ subscription.status }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div class="flex items-center">
            <FontAwesomeIcon icon="clock" class="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p class="text-sm text-gray-500">Time Left</p>
              <p class="text-lg font-medium text-gray-900">{{ subscription.daysRemaining }} days</p>
            </div>
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

interface Subscription {
  id: string
  status: 'active' | 'expired' | 'cancelled'
  planName: string
  startDate: string
  endDate: string
  daysRemaining: number
}

const subscription = ref<Subscription | null>(null)
const loading = ref(false)
const error = ref('')

const loadSubscription = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await memberApi.getSubscription()
    subscription.value = data.subscription
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load subscription'
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status?: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'expired':
      return 'bg-red-100 text-red-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const goToBrowsePlans = () => {
  router.push('/browse')
}

const cancelSubscription = () => {
  // TODO: Implement cancel subscription
  alert('Cancel subscription functionality would be implemented here')
}

onMounted(() => {
  loadSubscription()
})
</script>
