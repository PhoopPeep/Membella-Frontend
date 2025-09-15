<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/20">
    <!-- Hero Header Section -->
    <div
      class="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 px-6 py-12 md:px-8"
    >
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-secondary-400/20 rounded-full -translate-y-48 translate-x-48"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-64 h-64 bg-primary-300/20 rounded-full translate-y-32 -translate-x-32"
      ></div>

      <div class="relative max-w-7xl mx-auto">
        <div class="text-center">
          <h1 class="text-3xl md:text-4xl font-black text-white mb-4 drop-shadow-lg">
            Plan Management 📋
          </h1>
          <p class="text-lg text-white/90 font-medium max-w-2xl mx-auto">
            Create and manage your subscription plans
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 md:px-8 -mt-4 relative z-10">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 mt-8">
        <div class="mb-4 sm:mb-0">
          <h2 class="text-xl font-bold text-primary-700 mb-2">Your Plans</h2>
          <p class="text-primary-600 text-sm">Manage your subscription plans and pricing</p>
        </div>
        <button
          @click="navigateToCreate"
          :disabled="loading"
          class="inline-flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-xl font-semibold text-base hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-primary-800"
        >
          <FontAwesomeIcon icon="plus" class="w-5 h-5 mr-3" />
          Create New Plan
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-16">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin"></div>
          <div
            class="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"
          ></div>
        </div>
        <h3 class="text-lg font-bold text-primary-700 mt-4">Loading Plans</h3>
        <p class="text-primary-600 text-sm">Fetching your subscription plans...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-2xl border border-error-200 shadow-soft p-8">
        <div class="text-center">
          <div
            class="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FontAwesomeIcon icon="exclamation-triangle" class="w-8 h-8 text-error-500" />
          </div>
          <h3 class="text-xl font-bold text-error-700 mb-2">Oops! Something went wrong</h3>
          <p class="text-error-600 mb-6">{{ error }}</p>
          <button
            @click="loadPlans"
            class="inline-flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-bold hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FontAwesomeIcon icon="refresh" class="w-5 h-5 mr-2" />
            Try Again
          </button>
        </div>
      </div>

      <!-- Plans Table -->
      <div
        v-else-if="plans.length > 0"
        class="bg-white rounded-2xl border border-primary-200 shadow-soft overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-primary-50 to-secondary-50">
              <tr>
                <th class="text-left py-4 px-6 font-semibold text-primary-700">
                  <div class="flex items-center">
                    <FontAwesomeIcon icon="credit-card" class="w-4 h-4 mr-2 text-secondary-500" />
                    Plan Details
                  </div>
                </th>
                <th class="text-left py-4 px-6 font-semibold text-primary-700">
                  <div class="flex items-center">
                    <FontAwesomeIcon icon="dollar-sign" class="w-4 h-4 mr-2 text-secondary-500" />
                    Price
                  </div>
                </th>
                <th class="text-left py-4 px-6 font-semibold text-primary-700">
                  <div class="flex items-center">
                    <FontAwesomeIcon icon="calendar" class="w-4 h-4 mr-2 text-secondary-500" />
                    Duration
                  </div>
                </th>
                <th class="text-left py-4 px-6 font-semibold text-primary-700">
                  <div class="flex items-center">
                    <FontAwesomeIcon icon="star" class="w-4 h-4 mr-2 text-secondary-500" />
                    Features
                  </div>
                </th>
                <th class="text-left py-4 px-6 font-semibold text-primary-700">
                  <div class="flex items-center">
                    <FontAwesomeIcon icon="clock" class="w-4 h-4 mr-2 text-secondary-500" />
                    Created
                  </div>
                </th>
                <th class="text-right py-4 px-6 font-semibold text-primary-700">
                  <div class="flex items-center justify-end">
                    <FontAwesomeIcon icon="cog" class="w-4 h-4 mr-2 text-secondary-500" />
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-100">
              <tr
                v-for="plan in plans"
                :key="plan.id"
                class="hover:bg-primary-50/50 transition-colors duration-200"
                :class="{ 'opacity-50': deleting === plan.id }"
              >
                <!-- Plan Details -->
                <td class="py-6 px-6">
                  <div class="flex items-center space-x-4">
                    <div
                      class="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-md"
                    >
                      <FontAwesomeIcon icon="credit-card" class="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 class="text-lg font-bold text-primary-700 mb-1">{{ plan.name }}</h3>
                      <p class="text-sm text-primary-600 line-clamp-2 max-w-xs">
                        {{ plan.description }}
                      </p>
                    </div>
                  </div>
                </td>

                <!-- Price -->
                <td class="py-6 px-6">
                  <div class="text-2xl font-black text-primary-700">฿{{ plan.price }}</div>
                  <div class="text-sm text-primary-500">per plan</div>
                </td>

                <!-- Duration -->
                <td class="py-6 px-6">
                  <div
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-700"
                  >
                    <FontAwesomeIcon icon="calendar" class="w-3 h-3 mr-1" />
                    {{ plan.duration }} days
                  </div>
                </td>

                <!-- Features -->
                <td class="py-6 px-6">
                  <div class="max-w-xs">
                    <div class="flex flex-wrap gap-1 mb-2">
                      <span
                        v-for="featureName in getFeatureNames(plan.features).slice(0, 2)"
                        :key="featureName"
                        class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700"
                      >
                        {{ featureName }}
                      </span>
                      <span
                        v-if="getFeatureNames(plan.features).length > 2"
                        class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-200 text-primary-600"
                      >
                        +{{ getFeatureNames(plan.features).length - 2 }} more
                      </span>
                    </div>
                    <div class="text-xs text-primary-500">
                      {{ getFeatureNames(plan.features).length }} features total
                    </div>
                  </div>
                </td>

                <!-- Created Date -->
                <td class="py-6 px-6">
                  <div class="text-sm text-primary-600">
                    {{ formatDate(plan.createdAt) }}
                  </div>
                </td>

                <!-- Actions -->
                <td class="py-6 px-6">
                  <div class="flex space-x-2 justify-end">
                    <button
                      @click="navigateToDetails(plan.id)"
                      class="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-100 rounded-lg transition-all duration-200"
                      title="View Details"
                      :disabled="deleting === plan.id"
                    >
                      <FontAwesomeIcon icon="eye" class="w-4 h-4" />
                    </button>
                    <button
                      @click="confirmDeletePlan(plan)"
                      class="p-2 text-error-600 hover:text-error-700 hover:bg-error-100 rounded-lg transition-all duration-200"
                      title="Delete Plan"
                      :disabled="deleting === plan.id"
                    >
                      <FontAwesomeIcon
                        :icon="deleting === plan.id ? 'spinner' : 'trash'"
                        class="w-4 h-4"
                        :class="{ 'animate-spin': deleting === plan.id }"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-2xl border border-primary-200 shadow-soft p-12">
        <div class="text-center">
          <h3 class="text-3xl font-black text-primary-700 mb-4">No Plans Yet! 🚀</h3>
          <p class="text-lg text-primary-600 mb-8 font-medium max-w-md mx-auto">
            Create your first subscription plan and start attracting members to your business.
          </p>
          <button
            @click="navigateToCreate"
            class="inline-flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FontAwesomeIcon icon="plus" class="w-5 h-5 mr-3" />
            Create Your First Plan
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteModal"
      type="danger"
      title="Delete Plan"
      message="Are you sure you want to delete this plan? This action cannot be undone. If this plan has active members, you will need to cancel their subscriptions first."
      :item-name="planToDelete?.name"
      confirm-text="Delete Plan"
      cancel-text="Cancel"
      loading-text="Deleting..."
      :loading="deleting !== null"
      @confirm="handleDeletePlan"
      @cancel="cancelDelete"
    />

    <!-- Toast Notification -->
    <Toast
      :show="showToast"
      :type="toastType"
      :title="toastTitle"
      :message="toastMessage"
      @close="showToast = false"
    />

    <!-- Error Modal -->
    <ErrorModal
      :show="showErrorModal"
      :title="errorTitle"
      :message="errorMessage"
      :details="errorDetails"
      :active-members="activeMembers"
      :suggestions="suggestions"
      confirm-text="I Understand"
      @confirm="closeErrorModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { plansService, type Plan } from '../../service/plansService'
import { featuresService, type Feature } from '../../service/featuresService'
import ConfirmationModal from '../../components/common/ConfirmationModal.vue'
import Toast from '../../components/common/Toast.vue'
import ErrorModal from '../../components/common/ErrorModal.vue'

// Define component name
defineOptions({
  name: 'PlansView',
})

const router = useRouter()

const plans = ref<Plan[]>([])
const features = ref<Feature[]>([])
const loading = ref(false)
const error = ref('')
const deleting = ref<string | null>(null)

// Modal state
const showDeleteModal = ref(false)
const planToDelete = ref<Plan | null>(null)

// Toast state
const showToast = ref(false)
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info')
const toastTitle = ref('')
const toastMessage = ref('')

// Error modal state
const showErrorModal = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')
const errorDetails = ref('')
const activeMembers = ref<{ name: string; email: string }[]>([])
const suggestions = ref<string[]>([])

const loadPlans = async () => {
  try {
    loading.value = true
    error.value = ''
    const [plansData, featuresData] = await Promise.all([
      plansService.getPlans(),
      featuresService.getFeatures(),
    ])
    plans.value = plansData
    features.value = featuresData
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load plans'
  } finally {
    loading.value = false
  }
}

const getFeatureNames = (featureIds: string[]) => {
  return features.value
    .filter((feature) => featureIds.includes(feature.feature_id))
    .map((feature) => feature.name)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const confirmDeletePlan = (plan: Plan) => {
  planToDelete.value = plan
  showDeleteModal.value = true
}

const handleDeletePlan = async () => {
  if (!planToDelete.value) return

  try {
    deleting.value = planToDelete.value.id
    await plansService.deletePlan(planToDelete.value.id)

    // Remove from local state
    plans.value = plans.value.filter((p) => p.id !== planToDelete.value!.id)

    // Close modal and reset state
    showDeleteModal.value = false
    planToDelete.value = null

    // Show success toast
    showSuccessToast('Plan deleted successfully!')
  } catch (err: unknown) {
    console.error('Error deleting plan:', err)

    // Handle specific error cases
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as {
        response?: {
          status?: number
          data?: {
            message?: string
            details?: string
            activeMembers?: { name: string; email: string }[]
          }
        }
      }

      if (axiosError.response?.status === 400) {
        const errorData = axiosError.response.data
        if (errorData?.activeMembers && errorData.activeMembers.length > 0) {
          // Show detailed error modal for active members
          showDetailedErrorModal(
            errorData.message || 'Cannot delete plan',
            errorData.details || '',
            errorData.activeMembers,
          )
        } else {
          // Show simple error toast
          showErrorToast(errorData?.message || 'Cannot delete plan', errorData?.details || '')
        }
      } else {
        showErrorToast('Failed to delete plan', 'Please try again later.')
      }
    } else {
      showErrorToast('Failed to delete plan', 'Please try again later.')
    }
  } finally {
    deleting.value = null
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  planToDelete.value = null
}

// Toast functions
const showSuccessToast = (title: string, message?: string) => {
  toastType.value = 'success'
  toastTitle.value = title
  toastMessage.value = message || ''
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const showErrorToast = (title: string, message?: string) => {
  toastType.value = 'error'
  toastTitle.value = title
  toastMessage.value = message || ''
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 5000)
}

// Error modal functions
const showDetailedErrorModal = (
  title: string,
  message: string,
  members: { name: string; email: string }[],
) => {
  errorTitle.value = title
  errorMessage.value = message
  errorDetails.value = `This plan has ${members.length} active member(s).`
  activeMembers.value = members
  suggestions.value = [
    'Go to the Members section and cancel their subscriptions',
    'Wait for their subscriptions to expire naturally',
    'Contact the members directly to inform them about the plan changes',
  ]
  showErrorModal.value = true
}

const closeErrorModal = () => {
  showErrorModal.value = false
  errorTitle.value = ''
  errorMessage.value = ''
  errorDetails.value = ''
  activeMembers.value = []
  suggestions.value = []
}

const navigateToCreate = () => {
  router.push('/plans/create')
}

const navigateToDetails = (id: string) => {
  router.push(`/plans/${id}`)
}

onMounted(() => {
  loadPlans()
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
