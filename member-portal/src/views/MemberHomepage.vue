<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Organizations & Plans</h1>
      <p class="text-gray-600 mb-6">Discover organizations and their available plans</p>

      <!-- Auth Buttons for Non-Authenticated Users -->
      <div v-if="!authStore.isAuthenticated" class="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div class="text-center">
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Join Membella Today!</h2>
          <p class="text-gray-600 mb-6">Sign up to access exclusive plans and manage your subscriptions</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <router-link
              to="/login"
              class="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FontAwesomeIcon icon="sign-in-alt" class="w-4 h-4 mr-2" />
              Sign In
            </router-link>
            <router-link
              to="/register"
              class="w-full sm:w-auto bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center"
            >
              <FontAwesomeIcon icon="user-plus" class="w-4 h-4 mr-2" />
              Create Account
            </router-link>
          </div>
          <p class="text-sm text-gray-500 mt-4">
            Already have an account?
            <router-link to="/login" class="text-blue-600 hover:underline">Sign in here</router-link>
          </p>
        </div>
      </div>
    </div>

    <!-- Organizations Table -->
    <SimpleTable
      :data="owners"
      :columns="tableColumns"
      :loading="loading"
      :error="error"
      :title="authStore.isAuthenticated ? 'Organizations' : 'Browse Organizations'"
      :subtitle="authStore.isAuthenticated ? 'Browse available organizations and their plans' : 'Sign in to subscribe to plans and manage your subscriptions'"
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
              v-if="asOwner(item).logo"
              :src="asOwner(item).logo"
              :alt="asOwner(item).orgName"
              class="w-10 h-10 rounded-lg object-cover"
              @error="handleImageError"
            />
            <div
              v-else
              class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
            >
              <span class="text-white font-bold text-sm">
                {{ asOwner(item).orgName.charAt(0).toUpperCase() }}
              </span>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900">{{ asOwner(item).orgName }}</div>
            <div class="text-sm text-gray-500">{{ asOwner(item).email }}</div>
          </div>
        </div>
      </template>

      <!-- Custom Description Column -->
      <template #column-description="{ item }">
        <div class="max-w-xs">
          <p
            class="text-sm text-gray-900"
            :title="asOwner(item).description"
          >
            {{ asOwner(item).description || 'No description available' }}
          </p>
        </div>
      </template>

      <!-- Custom Plans Column -->
      <template #column-planCount="{ item }">
        <div class="text-center">
          <div class="text-lg font-bold text-blue-600">{{ asOwner(item).planCount }}</div>
          <div class="text-xs text-gray-500">{{ asOwner(item).planCount === 1 ? 'Plan' : 'Plans' }}</div>
        </div>
      </template>

      <!-- Custom Price Range Column -->
      <template #column-priceRange="{ item }">
        <div class="text-sm">
          <div v-if="asOwner(item).planCount > 0" class="text-center">
            <div class="font-medium text-gray-900">
              ฿{{ asOwner(item).minPrice }}
              <span v-if="asOwner(item).maxPrice !== asOwner(item).minPrice">
                - ฿{{ asOwner(item).maxPrice }}
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

            <!-- Plans Table -->
            <div v-else-if="ownerPlans.length > 0">
              <SimpleTable
                :data="plansTableData"
                :columns="plansTableColumns"
                :loading="false"
                :error="''"
                title=""
                subtitle=""
                :show-actions="false"
                :clickable="true"
                empty-title="No Plans Found"
                empty-message="This organization doesn't have any plans yet."
                empty-icon="inbox"
                @row-click="viewPlanDetails"
              >
                <!-- Custom Plan Name Column -->
                <template #column-name="{ item }">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon icon="crown" class="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">{{ asPlan(item).name }}</div>
                      <div class="text-xs text-gray-500">{{ asPlan(item).organization }}</div>
                    </div>
                  </div>
                </template>

                <!-- Custom Description Column -->
                <template #column-description="{ item }">
                  <div class="max-w-xs">
                    <p class="text-sm text-gray-900 line-clamp-2" :title="asPlan(item).description">
                      {{ asPlan(item).description || 'No description available' }}
                    </p>
                  </div>
                </template>

                <!-- Custom Price Column -->
                <template #column-price="{ item }">
                  <div class="text-center">
                    <div class="text-lg font-bold text-green-600">฿{{ asPlan(item).price }}</div>
                    <div class="text-xs text-gray-500">{{ asPlan(item).duration }} days</div>
                  </div>
                </template>

                <!-- Custom Features Column -->
                <template #column-features="{ item }">
                  <div class="text-center">
                    <div class="text-sm font-medium text-gray-900">{{ item.features }}</div>
                    <div class="text-xs text-gray-500">features</div>
                  </div>
                </template>



                <!-- Custom Action Column -->
                <template #column-actions="{ item }">
                  <button
                    @click="subscribeToPlan(asPlan(item))"
                    :disabled="subscribing === asPlan(item).id"
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    <div v-if="subscribing === asPlan(item).id" class="flex items-center">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                    <span v-else class="flex items-center">
                      <FontAwesomeIcon icon="credit-card" class="w-4 h-4 mr-2" />
                      {{ authStore.isAuthenticated ? 'Subscribe' : 'Sign In' }}
                    </span>
                  </button>
                </template>
              </SimpleTable>
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

    <!-- Plan Details Modal -->
    <div
      v-if="showPlanModal && selectedPlan"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
      @click.self="closePlanModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon="crown" class="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 class="text-2xl font-bold text-white">{{ selectedPlan.name }}</h2>
                <p class="text-blue-100">{{ selectedPlan.organization }}</p>
              </div>
            </div>
            <button
              @click="closePlanModal"
              class="text-white hover:text-gray-200 transition-colors"
            >
              <FontAwesomeIcon icon="times" class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="p-6">
          <!-- Loading State -->
          <div v-if="loadingPlanDetails" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading plan details...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="planDetailsError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div class="flex items-center">
              <FontAwesomeIcon icon="exclamation-circle" class="w-5 h-5 text-red-500 mr-2" />
              <div>
                <h4 class="text-sm font-medium text-red-800">Error Loading Plan Details</h4>
                <p class="text-sm text-red-600 mt-1">{{ planDetailsError }}</p>
              </div>
            </div>
            <button
              @click="loadPlanDetails(selectedPlan.id)"
              class="mt-3 text-sm text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>

          <!-- Plan Content -->
          <div v-else>
            <!-- Plan Overview -->
            <div class="mb-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Price Card -->
              <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <div class="text-center">
                  <FontAwesomeIcon icon="dollar-sign" class="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Price</h3>
                  <div class="text-3xl font-bold text-green-600 mb-1">฿{{ selectedPlan.price }}</div>
                  <p class="text-sm text-gray-600">{{ selectedPlan.duration }} days</p>
                </div>
              </div>

              <!-- Duration Card -->
              <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <div class="text-center">
                  <FontAwesomeIcon icon="clock" class="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Duration</h3>
                  <div class="text-3xl font-bold text-blue-600 mb-1">{{ selectedPlan.duration }}</div>
                  <p class="text-sm text-gray-600">days</p>
                </div>
              </div>

              <!-- Features Card -->
              <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <div class="text-center">
                  <FontAwesomeIcon icon="star" class="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Features</h3>
                  <div class="text-3xl font-bold text-purple-600 mb-1">{{ selectedPlan.features?.length || 0 }}</div>
                  <p class="text-sm text-gray-600">included</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-gray-700 leading-relaxed">
                {{ selectedPlan.description || 'No description available for this plan.' }}
              </p>
            </div>
          </div>

          <!-- Features List -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Features Included</h3>
            <div v-if="selectedPlan.features && selectedPlan.features.length > 0" class="space-y-3">
              <div
                v-for="feature in selectedPlan.features"
                :key="feature.id"
                class="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <div class="flex-shrink-0">
                  <FontAwesomeIcon icon="check-circle" class="w-5 h-5 text-green-600 mt-0.5" />
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">{{ feature.name }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ feature.description }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <FontAwesomeIcon icon="inbox" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500">No features listed for this plan.</p>
            </div>
          </div>

            <!-- Organization Information -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Organization Information</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span class="font-medium text-gray-700">Organization:</span>
                    <p class="text-gray-900">{{ selectedPlan.organization }}</p>
                  </div>
                  <div v-if="selectedPlan.organizationEmail">
                    <span class="font-medium text-gray-700">Email:</span>
                    <p class="text-gray-900">{{ selectedPlan.organizationEmail }}</p>
                  </div>
                  <div v-if="selectedPlan.organizationContact" class="md:col-span-2">
                    <span class="font-medium text-gray-700">Contact:</span>
                    <p class="text-gray-900">{{ selectedPlan.organizationContact }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                @click="closePlanModal"
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                @click="subscribeToPlan(selectedPlan)"
                :disabled="subscribing === selectedPlan.id"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <div v-if="subscribing === selectedPlan.id" class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
                <span v-else class="flex items-center">
                  <FontAwesomeIcon icon="credit-card" class="w-4 h-4 mr-2" />
                  {{ authStore.isAuthenticated ? 'Subscribe Now' : 'Sign In to Subscribe' }}
                </span>
              </button>
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
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { memberApi } from '../api/member'
// @ts-expect-error - Vue component import
import SimpleTable from '../components/common/SimpleTable.vue'
// @ts-expect-error - Vue component import
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
  organizationEmail?: string
  organizationContact?: string
  createdAt?: string
  updatedAt?: string
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
const showPlanModal = ref(false)
const showPaymentModal = ref(false)
const showSuccessModal = ref(false)
const loadingPlanDetails = ref(false)
const planDetailsError = ref('')

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

// Plans Table Configuration
const plansTableColumns = [
  {
    key: 'name',
    title: 'Plan Name',
    width: '250'
  },
  {
    key: 'description',
    title: 'Description',
    width: '350'
  },
  {
    key: 'price',
    title: 'Price & Duration',
    align: 'center' as const,
    width: '150'
  },
  {
    key: 'features',
    title: 'Features Count',
    align: 'center' as const,
    width: '120'
  },
  {
    key: 'actions',
    title: 'Action',
    align: 'center' as const,
    width: '150'
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
    // Show a more user-friendly message and redirect to login
    if (confirm('Please sign in first to subscribe to plans. Would you like to go to the login page?')) {
      window.location.href = '/login'
    }
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

const viewPlanDetails = async (item: TableRecord): Promise<void> => {
  const plan = item as unknown as Plan
  selectedPlan.value = plan
  showPlanModal.value = true

  // Load detailed plan information with features
  await loadPlanDetails(plan.id)
}

const loadPlanDetails = async (planId: string): Promise<void> => {
  try {
    loadingPlanDetails.value = true
    planDetailsError.value = ''

    console.log('Loading plan details for:', planId)
    const planDetails = await memberApi.getPlanDetails(planId)
    console.log('Plan details received:', planDetails)

    // Update selected plan with detailed information
    if (selectedPlan.value) {
      selectedPlan.value = {
        ...selectedPlan.value,
        ...planDetails
      }
    }
  } catch (err) {
    console.error('Failed to load plan details:', err)
    planDetailsError.value = err instanceof Error ? err.message : 'Failed to load plan details'
  } finally {
    loadingPlanDetails.value = false
  }
}

const closePlanModal = (): void => {
  showPlanModal.value = false
  selectedPlan.value = null
  planDetailsError.value = ''
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

// Type assertion helpers for template
const asOwner = (item: TableRecord): Owner => item as unknown as Owner
const asPlan = (item: TableRecord): Plan => item as unknown as Plan

// Convert plans to table records
const plansTableData = computed(() => {
  return ownerPlans.value.map(plan => ({
    ...plan,
    features: plan.features?.length || 0 // Convert features array to count for table compatibility
  }))
})

onMounted(() => {
  loadOwners()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
