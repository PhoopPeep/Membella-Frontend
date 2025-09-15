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
            Plan Details 📋
          </h1>
          <p class="text-lg text-white/90 font-medium max-w-2xl mx-auto">
            View and manage your subscription plan
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-6 md:px-8 -mt-4 relative z-10 pb-12">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-8 mt-8">
        <div class="flex items-center space-x-4">
          <button
            @click="goBack"
            class="p-3 text-primary-600 hover:text-primary-700 hover:bg-primary-100 rounded-xl transition-all duration-200"
            title="Back to Plans"
          >
            <FontAwesomeIcon icon="arrow-left" class="w-5 h-5" />
          </button>
          <div>
            <h2 class="text-xl font-bold text-primary-700">Plan Details</h2>
            <p class="text-primary-600 text-sm">View and manage your subscription plan</p>
          </div>
        </div>
        <div v-if="plan" class="flex space-x-3">
          <button
            @click="navigateToEdit"
            class="inline-flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FontAwesomeIcon icon="edit" class="w-4 h-4 mr-2" />
            Edit Plan
          </button>
          <button
            @click="confirmDeletePlan"
            :disabled="isDeleting"
            class="inline-flex items-center justify-center bg-gradient-to-r from-error-500 to-error-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:from-error-600 hover:to-error-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <FontAwesomeIcon icon="trash" class="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-16">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin"></div>
          <div
            class="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"
          ></div>
        </div>
        <h3 class="text-lg font-bold text-primary-700 mt-4">Loading Plan</h3>
        <p class="text-primary-600 text-sm">Fetching plan details...</p>
      </div>

      <!-- Plan Not Found -->
      <div
        v-else-if="!plan && !isLoading"
        class="bg-white/80 backdrop-blur-sm rounded-3xl border border-error-200 shadow-xl p-12"
      >
        <div class="text-center max-w-lg mx-auto">
          <div
            class="w-20 h-20 bg-gradient-to-r from-error-500 to-error-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <FontAwesomeIcon icon="exclamation-triangle" class="w-10 h-10 text-white" />
          </div>
          <h3 class="text-xl font-bold text-error-800 mb-3">Plan Not Found</h3>
          <p class="text-error-600 mb-6 font-medium text-sm">
            The plan you're looking for doesn't exist or has been deleted.
          </p>
          <button
            @click="goBack"
            class="inline-flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-semibold text-base hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FontAwesomeIcon icon="arrow-left" class="w-4 h-4 mr-2" />
            Back to Plans
          </button>
        </div>
      </div>

      <!-- Plan Details -->
      <div v-else-if="plan" class="space-y-8">
        <!-- Plan Info Card -->
        <div class="bg-white rounded-2xl border border-primary-200 shadow-soft overflow-hidden">
          <div
            class="p-8 border-b border-primary-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50"
          >
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-primary-700 flex items-center">
                  <FontAwesomeIcon icon="credit-card" class="w-6 h-6 mr-3 text-secondary-500" />
                  {{ plan.name }}
                </h2>
                <p class="text-primary-600 mt-1">Plan Information</p>
              </div>
              <div class="text-right">
                <div class="text-3xl font-black text-primary-700">฿{{ plan.price }}</div>
                <div class="text-sm text-primary-600">per plan</div>
              </div>
            </div>
          </div>
          <div class="p-8 space-y-6">
            <div class="bg-primary-50 rounded-xl p-4">
              <h4 class="font-bold text-primary-700 mb-2 flex items-center">
                <FontAwesomeIcon icon="align-left" class="w-4 h-4 mr-2 text-secondary-500" />
                Description
              </h4>
              <p class="text-primary-600 leading-relaxed">{{ plan.description }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-primary-50 rounded-xl p-4">
                <div class="flex items-center space-x-3 mb-2">
                  <FontAwesomeIcon icon="dollar-sign" class="w-5 h-5 text-primary-600" />
                  <h5 class="font-bold text-primary-700">Price</h5>
                </div>
                <p class="text-primary-600 text-lg font-medium">฿{{ plan.price }}</p>
              </div>

              <div class="bg-secondary-50 rounded-xl p-4">
                <div class="flex items-center space-x-3 mb-2">
                  <FontAwesomeIcon icon="clock" class="w-5 h-5 text-secondary-600" />
                  <h5 class="font-bold text-secondary-700">Duration</h5>
                </div>
                <p class="text-secondary-600 text-lg font-medium">{{ plan.duration }} days</p>
              </div>
            </div>

            <div class="bg-primary-50 rounded-xl p-4">
              <div class="flex items-center space-x-3 mb-2">
                <FontAwesomeIcon icon="calendar" class="w-5 h-5 text-primary-600" />
                <h5 class="font-bold text-primary-700">Created Date</h5>
              </div>
              <p class="text-primary-600 text-lg font-medium">
                {{ formatDate(plan.createdAt) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Features Card -->
        <div class="bg-white rounded-2xl border border-primary-200 shadow-soft overflow-hidden">
          <div
            class="p-8 border-b border-primary-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50"
          >
            <h2 class="text-2xl font-bold text-primary-700 flex items-center">
              <FontAwesomeIcon icon="star" class="w-6 h-6 mr-3 text-secondary-500" />
              Features Unlocked
            </h2>
            <p class="text-primary-600 mt-1">Features included in this plan</p>
          </div>
          <div class="p-8">
            <div v-if="getPlanFeatures().length > 0" class="space-y-4">
              <div
                v-for="feature in getPlanFeatures()"
                :key="feature.feature_id"
                class="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4 border border-primary-100 hover:border-primary-300 transition-all duration-200"
              >
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-primary-700 flex items-center">
                    <FontAwesomeIcon icon="check-circle" class="w-4 h-4 mr-2 text-secondary-500" />
                    {{ feature.name }}
                  </h4>
                  <span
                    class="bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-bold px-3 py-1 rounded-full"
                  >
                    Feature
                  </span>
                </div>
                <p class="text-primary-600 text-sm leading-relaxed">{{ feature.description }}</p>
              </div>
            </div>
            <div v-else class="text-center py-12">
              <div
                class="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <FontAwesomeIcon icon="star" class="w-10 h-10 text-white" />
              </div>
              <h3 class="text-xl font-bold text-primary-700 mb-3">No Features Assigned</h3>
              <p class="text-primary-600 mb-6 text-sm">
                This plan doesn't have any features yet. Add some features to make it more
                attractive.
              </p>
              <button
                @click="navigateToEdit"
                class="inline-flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-semibold text-base hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FontAwesomeIcon icon="plus" class="w-4 h-4 mr-2" />
                Add Features
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteModal"
      type="danger"
      title="Delete Plan"
      message="Are you sure you want to delete this plan? This action cannot be undone. If this plan has active members, you will need to cancel their subscriptions first."
      :item-name="plan?.name"
      confirm-text="Delete Plan"
      cancel-text="Cancel"
      loading-text="Deleting..."
      :loading="isDeleting"
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
import { useRouter, useRoute } from 'vue-router'
import { plansService, type Plan } from '../../service/plansService'
import { featuresService, type Feature } from '../../service/featuresService'
import ConfirmationModal from '../../components/common/ConfirmationModal.vue'
import Toast from '../../components/common/Toast.vue'
import ErrorModal from '../../components/common/ErrorModal.vue'

const router = useRouter()
const route = useRoute()

const plan = ref<Plan | null>(null)
const features = ref<Feature[]>([])
const isLoading = ref(false)
const isDeleting = ref(false)

// Modal state
const showDeleteModal = ref(false)

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

const planId = route.params.id as string

const loadPlan = async () => {
  if (!planId) return

  try {
    isLoading.value = true
    const [planData, featuresData] = await Promise.all([
      plansService.getPlanById(planId),
      featuresService.getFeatures(),
    ])

    plan.value = planData
    features.value = featuresData
  } catch (error) {
    console.error('Error loading plan:', error)
  } finally {
    isLoading.value = false
  }
}

const getPlanFeatures = () => {
  if (!plan.value) return []
  return features.value.filter((feature) => plan.value!.features.includes(feature.feature_id))
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const confirmDeletePlan = () => {
  showDeleteModal.value = true
}

const handleDeletePlan = async () => {
  if (!plan.value) return

  try {
    isDeleting.value = true
    await plansService.deletePlan(plan.value.id)

    // Close modal and navigate back
    showDeleteModal.value = false
    router.push('/plans')
  } catch (error: unknown) {
    console.error('Error deleting plan:', error)

    // Handle specific error cases
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
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
    isDeleting.value = false
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
}

// Toast functions
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

const goBack = () => {
  router.push('/plans')
}

const navigateToEdit = () => {
  router.push(`/plans/${planId}/edit`)
}

onMounted(() => {
  loadPlan()
})
</script>
