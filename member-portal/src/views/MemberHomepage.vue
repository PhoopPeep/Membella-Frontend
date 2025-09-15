<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/20">
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

      <div class="relative max-w-7xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
          Organizations & Plans 🏢
        </h1>
        <p class="text-xl text-white/90 font-medium max-w-2xl mx-auto">
          Discover organizations and their available plans
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10 pb-12">
      <!-- Page Header -->
      <div class="mb-8 mt-8">
        <div class="text-center">
        </div>
      </div>

      <!-- Auth Buttons for Non-Authenticated Users -->
      <div
        v-if="!authStore.isAuthenticated"
        class="mb-12 p-8 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border border-primary-200 shadow-soft"
      >
        <div class="text-center">
          <div
            class="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-medium"
          >
            <FontAwesomeIcon icon="star" class="w-8 h-8 text-white" />
          </div>
          <h2 class="text-2xl font-bold text-neutral-800 mb-3">Join Membella Today!</h2>
          <p class="text-neutral-600 mb-8 text-lg font-medium">
            Sign up to access exclusive plans and manage your subscriptions
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <router-link
              to="/login"
              class="w-full sm:w-auto bg-gradient-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-gradient-secondary transition-all duration-200 flex items-center justify-center shadow-medium hover:shadow-glow"
            >
              <FontAwesomeIcon icon="sign-in-alt" class="w-5 h-5 mr-2" />
              Log In
            </router-link>
            <router-link
              to="/register"
              class="w-full sm:w-auto bg-white/80 text-primary-700 border-2 border-primary-200 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 flex items-center justify-center shadow-soft"
            >
              <FontAwesomeIcon icon="user-plus" class="w-5 h-5 mr-2" />
              Create Account
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Organizations Table -->
    <div class="mt-8">
      <SimpleTable
        :data="owners"
        :columns="tableColumns"
        :loading="loading"
        :error="error"
        :title="''"
        :subtitle="''"
        :show-actions="false"
        :clickable="true"
        empty-title="No Organizations Found"
        empty-message="There are currently no organizations with plans."
        empty-icon="building"
        @row-click="navigateToOrganizationDetails"
        @retry="loadOwners"
      >
        <!-- Custom Organization Column -->
        <template #column-organization="{ item }">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <img
                v-if="asOwner(item).logo"
                :src="asOwner(item).logo"
                :alt="asOwner(item).orgName"
                class="w-12 h-12 rounded-xl object-cover shadow-sm border-2 border-primary-100"
                @error="handleImageError"
              />
              <div
                v-else
                class="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-sm border-2 border-primary-100"
              >
                <span class="text-white font-bold text-lg">
                  {{ asOwner(item).orgName.charAt(0).toUpperCase() }}
                </span>
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-base font-bold text-primary-700 truncate">
                {{ asOwner(item).orgName }}
              </div>
              <div class="text-sm text-primary-600 truncate">{{ asOwner(item).email }}</div>
            </div>
          </div>
        </template>

        <!-- Custom Description Column -->
        <template #column-description="{ item }">
          <div class="max-w-sm">
            <p
              class="text-sm text-neutral-700 leading-relaxed line-clamp-2"
              :title="asOwner(item).description"
            >
              {{ asOwner(item).description || 'No description available' }}
            </p>
          </div>
        </template>

        <!-- Custom Plans Column -->
        <template #column-planCount="{ item }">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-2">
              <span class="text-xl font-bold text-primary-700">{{ asOwner(item).planCount }}</span>
            </div>
            <div class="text-xs font-semibold text-primary-600">
              {{ asOwner(item).planCount === 1 ? 'Plan' : 'Plans' }}
            </div>
          </div>
        </template>

        <!-- Custom Price Range Column -->
        <template #column-priceRange="{ item }">
          <div class="text-center">
            <div v-if="asOwner(item).planCount > 0">
              <div class="inline-flex items-center justify-center w-16 h-10 rounded-lg mb-2">
                <span class="text-sm font-bold text-success-700">
                  ฿{{ asOwner(item).minPrice }}
                  <span v-if="asOwner(item).maxPrice !== asOwner(item).minPrice">
                    - ฿{{ asOwner(item).maxPrice }}
                  </span>
                </span>
              </div>
              <div class="text-xs font-semibold text-success-600">Price range</div>
            </div>
            <div v-else>
              <div
                class="inline-flex items-center justify-center w-16 h-10 bg-gray-100 rounded-lg mb-2"
              >
                <span class="text-xs font-semibold text-gray-500">No plans</span>
              </div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { memberApi } from '../api/member'
// @ts-expect-error - Vue component import
import SimpleTable from '../components/common/SimpleTable.vue'

const router = useRouter()
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
    width: '300',
  },
  {
    key: 'description',
    title: 'Description',
  },
  {
    key: 'planCount',
    title: 'Plans',
    align: 'center' as const,
  },
  {
    key: 'priceRange',
    title: 'Price Range',
    align: 'center' as const,
  },
]

// Plans Table Configuration
const plansTableColumns = [
  {
    key: 'name',
    title: 'Plan Name',
    width: '250',
  },
  {
    key: 'description',
    title: 'Description',
    width: '350',
  },
  {
    key: 'price',
    title: 'Price & Duration',
    align: 'center' as const,
    width: '150',
  },
  {
    key: 'features',
    title: 'Features Count',
    align: 'center' as const,
    width: '120',
  },
  {
    key: 'actions',
    title: 'Action',
    align: 'center' as const,
    width: '150',
  },
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

const navigateToOrganizationDetails = async (item: TableRecord): Promise<void> => {
  const owner = item as unknown as Owner
  router.push(`/organization/${owner.id}`)
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
    ownerPlans.value = plans.map((plan) => ({
      ...plan,
      organization:
        selectedOwner.value && selectedOwner.value.orgName ? selectedOwner.value.orgName : '',
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
    if (
      confirm('Please sign in first to subscribe to plans. Would you like to go to the login page?')
    ) {
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
        ...planDetails,
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
  return ownerPlans.value.map((plan) => ({
    ...plan,
    features: plan.features?.length || 0, // Convert features array to count for table compatibility
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
