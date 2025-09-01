<template>
  <div class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">My Subscriptions</h1>
      <p class="text-gray-600">Manage your active subscriptions and view your history</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center">
        <FontAwesomeIcon icon="exclamation-circle" class="w-5 h-5 text-red-500 mr-2" />
        <h3 class="text-lg font-medium text-red-800">Error Loading Subscriptions</h3>
      </div>
      <p class="text-red-600 mt-2">{{ error }}</p>
      <button
        @click="loadSubscriptions"
        class="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Content -->
    <div v-else class="space-y-8">
      <!-- Stats Cards -->
      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div class="flex items-center">
            <FontAwesomeIcon icon="layer-group" class="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p class="text-sm text-gray-500">Total Subscriptions</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalSubscriptions }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div class="flex items-center">
            <FontAwesomeIcon icon="check-circle" class="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p class="text-sm text-gray-500">Active Plans</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.activeSubscriptions }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div class="flex items-center">
            <FontAwesomeIcon icon="clock" class="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p class="text-sm text-gray-500">Expired Plans</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.expiredSubscriptions }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div class="flex items-center">
            <FontAwesomeIcon icon="money-bill" class="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p class="text-sm text-gray-500">Total Spent</p>
              <p class="text-2xl font-bold text-gray-900">฿{{ stats.totalSpent.toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Subscriptions -->
      <div v-if="activeSubscriptions.length > 0" class="bg-white rounded-lg shadow border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Active Subscriptions</h2>
        </div>
        <div class="divide-y divide-gray-200">
          <div
            v-for="subscription in activeSubscriptions"
            :key="subscription.id"
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900">{{ subscription.planName }}</h3>
                    <p class="text-sm text-gray-600">{{ subscription.organization }}</p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>

                <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Price</p>
                    <p class="font-semibold text-gray-900">฿{{ subscription.price.toLocaleString() }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Duration</p>
                    <p class="font-semibold text-gray-900">{{ subscription.duration }} days</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Days Remaining</p>
                    <p class="font-semibold" :class="subscription.daysRemaining <= 7 ? 'text-red-600' : 'text-green-600'">
                      {{ subscription.daysRemaining }} days
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">End Date</p>
                    <p class="font-semibold text-gray-900">{{ formatDate(subscription.endDate) }}</p>
                  </div>
                </div>

                <div v-if="subscription.features.length > 0" class="mt-4">
                  <p class="text-sm text-gray-500 mb-2">Features:</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="feature in subscription.features.slice(0, 3)"
                      :key="feature.id"
                      class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {{ feature.name }}
                    </span>
                    <span
                      v-if="subscription.features.length > 3"
                      class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      +{{ subscription.features.length - 3 }} more
                    </span>
                  </div>
                </div>
              </div>

              <div class="ml-6 flex space-x-2">
                <button
                  @click="viewSubscriptionDetails(subscription)"
                  class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <FontAwesomeIcon icon="eye" class="w-4 h-4 mr-1" />
                  View Details
                </button>
                <button
                  @click="confirmCancelSubscription(subscription)"
                  class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  <FontAwesomeIcon icon="times" class="w-4 h-4 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Expired/Cancelled Subscriptions -->
      <div v-if="inactiveSubscriptions.length > 0" class="bg-white rounded-lg shadow border border-gray-200">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Subscription History</h2>
        </div>
        <div class="divide-y divide-gray-200">
          <div
            v-for="subscription in inactiveSubscriptions"
            :key="subscription.id"
            class="p-6"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <div class="flex-1">
                    <h3 class="text-lg font-medium text-gray-700">{{ subscription.planName }}</h3>
                    <p class="text-sm text-gray-500">{{ subscription.organization }}</p>
                  </div>
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-medium',
                      subscription.status === 'expired'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) }}
                  </span>
                </div>

                <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Price</p>
                    <p class="font-semibold text-gray-700">฿{{ subscription.price.toLocaleString() }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Duration</p>
                    <p class="font-semibold text-gray-700">{{ subscription.duration }} days</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Start Date</p>
                    <p class="font-semibold text-gray-700">{{ formatDate(subscription.startDate) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">End Date</p>
                    <p class="font-semibold text-gray-700">{{ formatDate(subscription.endDate) }}</p>
                  </div>
                </div>
              </div>

              <div class="ml-6">
                <button
                  @click="viewSubscriptionDetails(subscription)"
                  class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
                >
                  <FontAwesomeIcon icon="eye" class="w-4 h-4 mr-1" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Subscriptions -->
      <div v-if="subscriptions.length === 0" class="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
        <FontAwesomeIcon icon="layer-group" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Subscriptions Yet</h3>
        <p class="text-gray-500 mb-6">You haven't subscribed to any plans yet.</p>
        <router-link
          to="/homepage"
          class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
        >
          <FontAwesomeIcon icon="search" class="w-4 h-4 mr-2" />
          Browse Organizations
        </router-link>
      </div>
    </div>

    <!-- Subscription Details Modal -->
    <div
      v-if="showDetailsModal && selectedSubscription"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
      @click.self="closeDetailsModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900">Subscription Details</h2>
            <button
              @click="closeDetailsModal"
              class="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <FontAwesomeIcon icon="times" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Plan Info -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Plan Information</h3>
            <div class="bg-gray-50 rounded-lg p-4 space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Plan Name:</span>
                <span class="font-medium">{{ selectedSubscription.planName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Organization:</span>
                <span class="font-medium">{{ selectedSubscription.organization }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Price:</span>
                <span class="font-medium">฿{{ selectedSubscription.price.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Duration:</span>
                <span class="font-medium">{{ selectedSubscription.duration }} days</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Status:</span>
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    selectedSubscription.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : selectedSubscription.status === 'expired'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ selectedSubscription.status.charAt(0).toUpperCase() + selectedSubscription.status.slice(1) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Subscription Period -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Subscription Period</h3>
            <div class="bg-gray-50 rounded-lg p-4 space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Start Date:</span>
                <span class="font-medium">{{ formatDate(selectedSubscription.startDate) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">End Date:</span>
                <span class="font-medium">{{ formatDate(selectedSubscription.endDate) }}</span>
              </div>
              <div v-if="selectedSubscription.isActive" class="flex justify-between">
                <span class="text-gray-600">Days Remaining:</span>
                <span
                  :class="[
                    'font-medium',
                    selectedSubscription.daysRemaining <= 7 ? 'text-red-600' : 'text-green-600'
                  ]"
                >
                  {{ selectedSubscription.daysRemaining }} days
                </span>
              </div>
            </div>
          </div>

          <!-- Features -->
          <div v-if="selectedSubscription.features.length > 0">
            <h3 class="text-lg font-medium text-gray-900 mb-3">Included Features</h3>
            <div class="space-y-2">
              <div
                v-for="feature in selectedSubscription.features"
                :key="feature.id"
                class="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
              >
                <FontAwesomeIcon icon="check" class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p class="font-medium text-blue-900">{{ feature.name }}</p>
                  <p class="text-sm text-blue-700">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Info -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Payment Information</h3>
            <div class="bg-gray-50 rounded-lg p-4 space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Amount Paid:</span>
                <span class="font-medium">฿{{ selectedSubscription.payment.amount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Payment Method:</span>
                <span class="font-medium capitalize">{{ selectedSubscription.payment.method }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Payment Date:</span>
                <span class="font-medium">{{ formatDate(selectedSubscription.payment.paidAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Confirmation Modal -->
    <div
      v-if="showCancelModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <FontAwesomeIcon icon="exclamation-triangle" class="w-8 h-8 text-red-600 mr-3" />
            <h3 class="text-lg font-medium text-gray-900">Cancel Subscription</h3>
          </div>

          <p class="text-gray-600 mb-6">
            Are you sure you want to cancel your subscription to
            <strong>{{ subscriptionToCancel?.planName }}</strong>?
            This action cannot be undone and you will lose access to all features immediately.
          </p>

          <div class="flex space-x-3">
            <button
              @click="closeCancelModal"
              :disabled="isCancelling"
              class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Keep Subscription
            </button>
            <button
              @click="cancelSubscription"
              :disabled="isCancelling"
              class="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <div v-if="isCancelling" class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cancelling...
              </div>
              <span v-else>Yes, Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { subscriptionApi, type Subscription, type SubscriptionStats } from '../api/subscription'

// State
const loading = ref(false)
const error = ref('')
const subscriptions = ref<Subscription[]>([])
const stats = ref<SubscriptionStats | null>(null)
const selectedSubscription = ref<Subscription | null>(null)
const subscriptionToCancel = ref<Subscription | null>(null)
const showDetailsModal = ref(false)
const showCancelModal = ref(false)
const isCancelling = ref(false)

// Computed properties
const activeSubscriptions = computed(() =>
  subscriptions.value.filter(sub => sub.isActive)
)

const inactiveSubscriptions = computed(() =>
  subscriptions.value.filter(sub => !sub.isActive)
)

// Methods
const loadSubscriptions = async () => {
  try {
    loading.value = true
    error.value = ''

    const [subscriptionsData, statsData] = await Promise.all([
      subscriptionApi.getSubscriptions(),
      subscriptionApi.getSubscriptionStats()
    ])

    subscriptions.value = subscriptionsData
    stats.value = statsData

    console.log('Subscriptions loaded:', subscriptionsData.length)
    console.log('Stats loaded:', statsData)
  } catch (err) {
    console.error('Failed to load subscriptions:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load subscriptions'
  } finally {
    loading.value = false
  }
}

const viewSubscriptionDetails = (subscription: Subscription) => {
  selectedSubscription.value = subscription
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedSubscription.value = null
}

const confirmCancelSubscription = (subscription: Subscription) => {
  subscriptionToCancel.value = subscription
  showCancelModal.value = true
}

const closeCancelModal = () => {
  showCancelModal.value = false
  subscriptionToCancel.value = null
}

const cancelSubscription = async () => {
  if (!subscriptionToCancel.value) return

  try {
    isCancelling.value = true

    await subscriptionApi.cancelSubscription(subscriptionToCancel.value.id)

    // Update local state
    const index = subscriptions.value.findIndex(sub => sub.id === subscriptionToCancel.value!.id)
    if (index !== -1) {
      subscriptions.value[index].status = 'cancelled'
      subscriptions.value[index].isActive = false
    }

    // Refresh stats
    stats.value = await subscriptionApi.getSubscriptionStats()

    closeCancelModal()
  } catch (err) {
    console.error('Failed to cancel subscription:', err)
    error.value = err instanceof Error ? err.message : 'Failed to cancel subscription'
  } finally {
    isCancelling.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  loadSubscriptions()
})
</script>
