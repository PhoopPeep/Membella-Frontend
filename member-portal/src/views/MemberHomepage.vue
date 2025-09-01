<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Organizations & Plans</h1>
      <p class="text-gray-600 mb-6">Discover organizations and their available plans</p>
    </div>

    <!-- Organizations Table -->
    <SimpleTable
      :data="owners"
      :columns="tableColumns"
      :loading="loading"
      :error="error"
      title="Organizations"
      subtitle="Browse available organizations and their plans"
      :show-actions="false"
      :clickable="true"
      empty-title="No Organizations Found"
      empty-message="There are currently no organizations with plans."
      empty-icon="building"
      @row-click="viewOwnerDetails"
      @retry="loadOwners"
    >
      <!-- Custom Organization Column -->
      <template #column-organization="{ item }">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <img
              v-if="(item as unknown as Owner).logo"
              :src="(item as unknown as Owner).logo"
              :alt="(item as unknown as Owner).orgName"
              class="w-10 h-10 rounded-lg object-cover"
              @error="handleImageError"
            />
            <div
              v-else
              class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
            >
              <span class="text-white font-bold text-sm">
                {{ (item as unknown as Owner).orgName.charAt(0).toUpperCase() }}
              </span>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900">{{ (item as unknown as Owner).orgName }}</div>
            <div class="text-sm text-gray-500">{{ (item as unknown as Owner).email }}</div>
          </div>
        </div>
      </template>

      <!-- Custom Description Column -->
      <template #column-description="{ item }">
        <div class="max-w-xs">
          <p
            class="text-sm text-gray-900"
            :title="(item as unknown as Owner).description"
          >
            {{ (item as unknown as Owner).description || 'No description available' }}
          </p>
        </div>
      </template>

      <!-- Custom Plans Column -->
      <template #column-planCount="{ item }">
        <div class="text-center">
          <div class="text-lg font-bold text-blue-600">{{ (item as unknown as Owner).planCount }}</div>
          <div class="text-xs text-gray-500">{{ (item as unknown as Owner).planCount === 1 ? 'Plan' : 'Plans' }}</div>
        </div>
      </template>

      <!-- Custom Price Range Column -->
      <template #column-priceRange="{ item }">
        <div class="text-sm">
          <div v-if="(item as unknown as Owner).planCount > 0" class="text-center">
            <div class="font-medium text-gray-900">
              ฿{{ (item as unknown as Owner).minPrice }}
              <span v-if="(item as unknown as Owner).maxPrice !== (item as unknown as Owner).minPrice">
                - ฿{{ (item as unknown as Owner).maxPrice }}
              </span>
            </div>
            <div class="text-xs text-gray-500">Price range</div>
          </div>
          <div v-else class="text-center">
            <div class="text-gray-400 text-sm">No plans</div>
          </div>
        </div>
      </template>

      <!-- Empty State Actions -->
      <template #empty-actions>
        <button
          @click="loadOwners"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <FontAwesomeIcon icon="refresh" class="w-4 h-4 mr-2" />
          Refresh
        </button>
      </template>
    </SimpleTable>

    <!-- Owner Details Modal -->
    <div
      v-if="showOwnerModal && selectedOwner"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
      @click.self="closeOwnerModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <img
                  v-if="selectedOwner.logo"
                  :src="selectedOwner.logo"
                  :alt="selectedOwner.orgName"
                  class="w-16 h-16 rounded-full object-cover"
                  @error="handleImageError"
                >
                <span v-else class="text-blue-600 font-bold text-xl">
                  {{ selectedOwner.orgName.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-white">{{ selectedOwner.orgName }}</h2>
                <p class="text-blue-100">{{ selectedOwner.email }}</p>
              </div>
            </div>
            <button
              @click="closeOwnerModal"
              class="text-white hover:text-gray-200 transition-colors"
            >
              <FontAwesomeIcon icon="times" class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="p-6">
          <!-- Organization Info -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Organization Information</h3>
            <div class="bg-gray-50 rounded-lg p-4 space-y-3">
              <div v-if="selectedOwner.description">
                <span class="font-medium text-gray-700">Description:</span>
                <p class="text-gray-600 mt-1">{{ selectedOwner.description }}</p>
              </div>
              <div v-if="selectedOwner.contactInfo">
                <span class="font-medium text-gray-700">Contact Information:</span>
                <div class="mt-2 flex items-center">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <FontAwesomeIcon icon="phone" class="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p class="text-gray-900 font-medium">{{ selectedOwner.contactInfo }}</p>
                    <p class="text-xs text-gray-500">Phone Number</p>
                  </div>
                </div>
              </div>
              <div>
                <span class="font-medium text-gray-700">Member since:</span>
                <div class="mt-2 flex items-center">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <FontAwesomeIcon icon="calendar" class="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p class="text-gray-900 font-medium">{{ formatDate(selectedOwner.createdAt) }}</p>
                    <p class="text-xs text-gray-500">Join Date</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Plans Section -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Available Plans
            </h3>

            <!-- Loading Plans -->
            <div v-if="loadingPlans" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p class="text-gray-600">Loading plans...</p>
            </div>

            <!-- Plans Error -->
            <div v-else-if="plansError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div class="flex items-center">
                <FontAwesomeIcon icon="exclamation-circle" class="w-5 h-5 text-red-500 mr-2" />
                <div>
                  <h4 class="text-sm font-medium text-red-800">Error Loading Plans</h4>
                  <p class="text-sm text-red-600 mt-1">{{ plansError }}</p>
                </div>
              </div>
              <button
                @click="retryLoadPlans"
                class="mt-3 text-sm text-red-600 hover:text-red-700 underline"
              >
                Try again
              </button>
            </div>

            <!-- Plans Grid -->
            <div v-else-if="ownerPlans.length > 0" class="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              <div
                v-for="plan in ownerPlans"
                :key="plan.id"
                class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start mb-4">
                  <h4 class="text-lg font-semibold text-gray-900">{{ plan.name }}</h4>
                  <span class="text-2xl font-bold text-green-600">฿{{ plan.price }}</span>
                </div>

                <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ plan.description }}</p>

                <div class="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <span>{{ plan.duration }} days</span>
                  <span>{{ plan.features?.length || 0 }} features</span>
                </div>

                <!-- Features Preview -->
                <div v-if="plan.features && plan.features.length > 0" class="mb-4">
                  <p class="text-xs text-gray-500 mb-2">Features include:</p>
                  <div class="space-y-1">
                    <div
                      v-for="feature in plan.features.slice(0, 2)"
                      :key="feature.id"
                      class="flex items-center text-xs text-gray-600"
                    >
                      <FontAwesomeIcon icon="check" class="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                      <span class="truncate">{{ feature.name }}</span>
                    </div>
                    <div v-if="plan.features.length > 2" class="text-xs text-gray-500">
                      +{{ plan.features.length - 2 }} more features
                    </div>
                  </div>
                </div>

                <!-- Subscribe Button -->
                <button
                  @click="subscribeToPlan(plan)"
                  :disabled="subscribing === plan.id"
                  class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <div v-if="subscribing === plan.id" class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                  <span v-else>
                    <FontAwesomeIcon icon="credit-card" class="w-4 h-4 mr-2" />
                    Subscribe Now
                  </span>
                </button>
              </div>
            </div>

            <!-- No Plans -->
            <div v-else class="text-center py-8">
              <FontAwesomeIcon icon="inbox" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500">This organization doesn't have any plans yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <PaymentModal
      v-if="showPaymentModal && selectedPlan"
      :plan="selectedPlan"
      @close="closePaymentModal"
      @success="handlePaymentSuccess"
    />

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
            You can view your subscription in "My Subscriptions".
          </p>
          <div class="flex space-x-3">
            <button
              @click="closeSuccessModal"
              class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            <router-link
              to="/subscriptions"
              class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center"
              @click="closeSuccessModal"
            >
              View Subscriptions
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { memberApi } from '../api/member'
import SimpleTable from '../components/common/SimpleTable.vue'
import PaymentModal from '../components/payment/paymentModal.vue'

const authStore = useAuthStore()

interface Owner {
  id: string
  orgName: string
  email: string
  description?: string
  contactInfo?: string
  logo?: string
  createdAt: string
  planCount: number
  featureCount: number
  minPrice: number
  maxPrice: number
}

interface PlanFeature {
  id: string
  name: string
  description: string
}

interface Plan {
  id: string
  name: string
  description: string
  price: number
  duration: number
  features: PlanFeature[]
  organization: string
}

type TableRecord = Record<string, string | number | boolean | Date | null | undefined>

const owners = ref<Owner[]>([])
const ownerPlans = ref<Plan[]>([])
const selectedOwner = ref<Owner | null>(null)
const selectedPlan = ref<Plan | null>(null)

const loading = ref(false)
const loadingPlans = ref(false)
const error = ref('')
const plansError = ref('')
const subscribing = ref<string | null>(null)
const showOwnerModal = ref(false)
const showPaymentModal = ref(false)
const showSuccessModal = ref(false)

// Main Table Configuration
const tableColumns = [
  {
    key: 'organization',
    title: 'Organization',
    width: '300'
  },
  {
    key: 'description',
    title: 'Description'
  },
  {
    key: 'planCount',
    title: 'Plans',
    align: 'center' as const
  },
  {
    key: 'priceRange',
    title: 'Price Range',
    align: 'center' as const
  },
  {
    key: 'createdAt',
    title: 'Member Since',
    type: 'date' as const
  }
]

const handleImageError = (event: Event): void => {
  const target = event.target as HTMLImageElement | null
  if (target) {
    target.style.display = 'none'
  }
}

const loadOwners = async (): Promise<void> => {
  try {
    loading.value = true
    error.value = ''

    console.log('Loading owners from API...')
    const data = await memberApi.getOwners()
    console.log('Owners data received:', data)

    owners.value = data
  } catch (err) {
    console.error('Failed to load owners:', err)
    error.value = err instanceof Error ? err.message : 'Unable to load organization data.'
  } finally {
    loading.value = false
  }
}

const viewOwnerDetails = async (item: TableRecord): Promise<void> => {
  const owner = item as unknown as Owner
  selectedOwner.value = owner
  showOwnerModal.value = true

  // Load plans for this owner
  await loadOwnerPlans(owner.id)
}

const loadOwnerPlans = async (ownerId: string): Promise<void> => {
  try {
    loadingPlans.value = true
    plansError.value = ''

    console.log('Loading plans for owner:', ownerId)

    // Validate owner ID
    if (!ownerId || ownerId.trim() === '') {
      throw new Error('Invalid owner ID')
    }

    const plans = await memberApi.getOwnerPlans(ownerId.trim())
    console.log('Owner plans received:', plans)

    // Add organization name to plans, always as a string
    ownerPlans.value = plans.map(plan => ({
      ...plan,
      organization: selectedOwner.value && selectedOwner.value.orgName ? selectedOwner.value.orgName : ''
    }))
  } catch (err) {
    console.error('Failed to load owner plans:', err)
    plansError.value = err instanceof Error ? err.message : 'Failed to load plans'
    ownerPlans.value = []
  } finally {
    loadingPlans.value = false
  }
}

const retryLoadPlans = (): void => {
  if (selectedOwner.value) {
    loadOwnerPlans(selectedOwner.value.id)
  }
}

const subscribeToPlan = (plan: Plan): void => {
  if (!authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    alert('Please login first to subscribe to plans.')
    return
  }

  selectedPlan.value = plan
  showPaymentModal.value = true
}

const closeOwnerModal = (): void => {
  showOwnerModal.value = false
  selectedOwner.value = null
  ownerPlans.value = []
  plansError.value = ''
}

const closePaymentModal = (): void => {
  showPaymentModal.value = false
  selectedPlan.value = null
  subscribing.value = null
}

const handlePaymentSuccess = (paymentId: string): void => {
  console.log('Payment successful:', paymentId)
  closePaymentModal()
  showSuccessModal.value = true
}

const closeSuccessModal = (): void => {
  showSuccessModal.value = false
  selectedPlan.value = null
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  loadOwners()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
