<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Organizations & Plans</h1>
      <p class="text-gray-600 mb-6">Discover organizations and membership plans</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <FontAwesomeIcon icon="exclamation-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-red-800 mb-2">An error occurred while loading data.</h3>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        @click="loadOwners"
        class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>

    <!-- Owners Grid -->
    <div v-else-if="owners.length > 0" class="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
      <div
        v-for="owner in owners"
        :key="owner.id"
        class="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
        @click="viewOwnerDetails(owner)"
      >
        <!-- Owner Card Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center space-x-4 mb-4">
            <!-- Owner Logo/Avatar -->
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <img
                v-if="owner.logo"
                :src="owner.logo"
                :alt="owner.orgName"
                class="w-16 h-16 rounded-full object-cover"
                @error="handleImageError"
              >
              <span v-else class="text-white font-bold text-xl">
                {{ owner.orgName.charAt(0).toUpperCase() }}
              </span>
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="text-xl font-semibold text-gray-900 truncate">{{ owner.orgName }}</h3>
              <p class="text-sm text-gray-500 truncate">{{ owner.email }}</p>
              <div class="flex items-center mt-2">
                <FontAwesomeIcon icon="calendar" class="w-4 h-4 text-gray-400 mr-1" />
                <span class="text-xs text-gray-500">
                  Member since {{ formatDate(owner.createdAt) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Owner Description -->
          <p v-if="owner.description" class="text-gray-600 text-sm line-clamp-2 mb-4">
            {{ owner.description }}
          </p>

          <!-- Contact Info -->
          <div v-if="owner.contactInfo" class="flex items-center text-sm text-gray-500 mb-4">
            <FontAwesomeIcon icon="phone" class="w-4 h-4 mr-2" />
            <span>{{ owner.contactInfo }}</span>
          </div>
        </div>

        <!-- Owner Stats -->
        <div class="p-6 bg-gray-50">
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-blue-600">{{ owner.planCount }}</div>
              <div class="text-xs text-gray-500">The plan has</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">{{ owner.featureCount }}</div>
              <div class="text-xs text-gray-500">All features</div>
            </div>
          </div>

          <!-- Price Range -->
          <div v-if="owner.planCount > 0" class="mt-4 text-center">
            <div class="text-sm text-gray-600">
              แผนเริ่มต้น <span class="font-semibold text-blue-600">฿{{ owner.minPrice }}</span>
              <span v-if="owner.maxPrice !== owner.minPrice">
                ถึง <span class="font-semibold text-blue-600">฿{{ owner.maxPrice }}</span>
              </span>
            </div>
          </div>

          <!-- View Details Button -->
          <div class="mt-4">
            <button class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
              <FontAwesomeIcon icon="eye" class="w-4 h-4 mr-2" />
              See plans and details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <FontAwesomeIcon icon="building" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Organization not found</h3>
      <p class="text-gray-500">There are currently no organizations with membership plans.</p>
    </div>

    <!-- Owner Details Modal -->
    <div
      v-if="showOwnerModal && selectedOwner"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
      @click.self="closeOwnerModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Organization information</h3>
            <div class="bg-gray-50 rounded-lg p-4 space-y-3">
              <div v-if="selectedOwner.description">
                <span class="font-medium text-gray-700">description:</span>
                <p class="text-gray-600 mt-1">{{ selectedOwner.description }}</p>
              </div>
              <div v-if="selectedOwner.contactInfo">
                <span class="font-medium text-gray-700">contact:</span>
                <p class="text-gray-600">{{ selectedOwner.contactInfo }}</p>
              </div>
              <div>
                <span class="font-medium text-gray-700">Member since:</span>
                <p class="text-gray-600">{{ formatDate(selectedOwner.createdAt) }}</p>
              </div>
            </div>
          </div>

          <!-- Loading Plans -->
          <div v-if="loadingPlans" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading plans...</p>
          </div>

          <!-- Owner Plans -->
          <div v-else>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              แผนที่มี ({{ ownerPlans.length }})
            </h3>

            <div v-if="ownerPlans.length > 0" class="grid gap-4 md:grid-cols-2">
              <div
                v-for="plan in ownerPlans"
                :key="plan.id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start mb-3">
                  <h4 class="font-semibold text-gray-900">{{ plan.name }}</h4>
                  <div class="text-right">
                    <div class="text-xl font-bold text-blue-600">฿{{ plan.price }}</div>
                    <div class="text-xs text-gray-500">{{ plan.duration }} วัน</div>
                  </div>
                </div>

                <p class="text-gray-600 text-sm mb-4">{{ plan.description }}</p>

                <!-- Features -->
                <div v-if="plan.features.length > 0" class="mb-4">
                  <h5 class="text-sm font-medium text-gray-700 mb-2">feature:</h5>
                  <ul class="space-y-1">
                    <li
                      v-for="feature in plan.features"
                      :key="feature.id"
                      class="flex items-start text-sm"
                    >
                      <FontAwesomeIcon icon="check" class="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <span class="font-medium">{{ feature.name }}</span>
                        <p class="text-gray-500 text-xs">{{ feature.description }}</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <!-- Subscribe Button -->
                <button
                  @click="subscribeToPlan(plan)"
                  :disabled="subscribing === plan.id"
                  class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <div v-if="subscribing === plan.id" class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Applying...
                  </div>
                  <span v-else>Apply for this plan</span>
                </button>
              </div>
            </div>

            <div v-else class="text-center py-8">
              <FontAwesomeIcon icon="inbox" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500">This organization does not have a membership plan yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
        <div class="text-center">
          <FontAwesomeIcon icon="check-circle" class="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Successfully applied for membership!</h3>
          <p class="text-gray-600 mb-6">
            You have successfully subscribed to the {{ selectedPlan?.name }} plan.
          </p>
          <button
            @click="closeSuccessModal"
            class="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { memberApi } from '../api/member'

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

interface Plan {
  id: string
  name: string
  description: string
  price: number
  duration: number
  features: Array<{
    id: string
    name: string
    description: string
  }>
}

const owners = ref<Owner[]>([])
const ownerPlans = ref<Plan[]>([])
const selectedOwner = ref<Owner | null>(null)
const selectedPlan = ref<Plan | null>(null)

const loading = ref(false)
const loadingPlans = ref(false)
const error = ref('')
const subscribing = ref<string | null>(null)
const showOwnerModal = ref(false)
const showSuccessModal = ref(false)

// Fixed error handling for images
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement | null
  if (target) {
    target.style.display = 'none'
  }
}

const loadOwners = async () => {
  try {
    loading.value = true
    error.value = ''

    const data = await memberApi.getOwners()
    owners.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load organization data.'
  } finally {
    loading.value = false
  }
}

const viewOwnerDetails = async (owner: Owner) => {
  selectedOwner.value = owner
  showOwnerModal.value = true

  try {
    loadingPlans.value = true
    const plans = await memberApi.getOwnerPlans(owner.id)
    ownerPlans.value = plans
  } catch (err) {
    console.error('Failed to load owner plans:', err)
    ownerPlans.value = []
  } finally {
    loadingPlans.value = false
  }
}

const closeOwnerModal = () => {
  showOwnerModal.value = false
  selectedOwner.value = null
  ownerPlans.value = []
}

const subscribeToPlan = async (plan: Plan) => {
  try {
    subscribing.value = plan.id
    await memberApi.subscribe(plan.id)
    selectedPlan.value = plan
    showSuccessModal.value = true
    closeOwnerModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to apply for membership'
  } finally {
    subscribing.value = null
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  selectedPlan.value = null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('th-TH', {
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
