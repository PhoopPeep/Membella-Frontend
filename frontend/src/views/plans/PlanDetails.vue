<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <button
          @click="goBack"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-9 px-3"
        >
          <ArrowLeft class="w-4 h-4 mr-1" />
          Back
        </button>
        <h1 class="text-3xl font-bold tracking-tight">Plan Details</h1>
      </div>
      <div v-if="plan" class="flex space-x-2">
        <button
          @click="navigateToEdit"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
        >
          <Edit class="w-4 h-4 mr-2" />
          Edit Plan
        </button>
        <button
          @click="confirmDeletePlan"
          :disabled="isDeleting"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2"
        >
          <Trash2 class="w-4 h-4 mr-2" />
          Delete
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading plan...</p>
    </div>

    <!-- Plan Not Found -->
    <div
      v-else-if="!plan && !isLoading"
      class="bg-white rounded-lg border border-gray-200 shadow-sm"
    >
      <div class="text-center py-12">
        <div
          class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4"
        >
          <AlertCircle class="w-6 h-6 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Plan not found</h3>
        <p class="text-gray-500 mb-4">
          The plan you're looking for doesn't exist or has been deleted.
        </p>
        <button
          @click="goBack"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
        >
          Back to Plans
        </button>
      </div>
    </div>

    <!-- Plan Details -->
    <div v-else-if="plan" class="grid gap-6 md:grid-cols-2">
      <!-- Plan Info Card -->
      <div class="rounded-lg border bg-white shadow-sm">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">{{ plan.name }}</h2>
            <span class="bg-gray-100 text-gray-800 text-lg font-medium px-3 py-1 rounded">
              ${{ plan.price }}
            </span>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <h4 class="font-medium text-gray-900 mb-2">Description</h4>
            <p class="text-gray-600">{{ plan.description }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center space-x-2">
              <DollarSign class="w-4 h-4 text-gray-500" />
              <div>
                <p class="text-sm text-gray-500">Price</p>
                <p class="font-medium">${{ plan.price }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <Clock class="w-4 h-4 text-gray-500" />
              <div>
                <p class="text-sm text-gray-500">Duration</p>
                <p class="font-medium">{{ plan.duration }} days</p>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <Calendar class="w-4 h-4 text-gray-500" />
            <div>
              <p class="text-sm text-gray-500">Created</p>
              <p class="font-medium">
                {{ formatDate(plan.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Card -->
      <div class="rounded-lg border bg-white shadow-sm">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold">Features Unlocked</h2>
        </div>
        <div class="p-6">
          <div v-if="getPlanFeatures().length > 0" class="space-y-3">
            <div
              v-for="feature in getPlanFeatures()"
              :key="feature.feature_id"
              class="border rounded-lg p-3"
            >
              <div class="flex items-center justify-between mb-1">
                <h4 class="font-medium">{{ feature.name }}</h4>
                <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Feature
                </span>
              </div>
              <p class="text-sm text-gray-600">{{ feature.description }}</p>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <div
              class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4"
            >
              <Settings class="w-6 h-6 text-gray-400" />
            </div>
            <p class="text-gray-500 mb-2">No features assigned</p>
            <button
              @click="navigateToEdit"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-9 px-3"
            >
              Add Features
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteModal"
      type="danger"
      title="Delete Plan"
      message="Are you sure you want to delete this plan? This action cannot be undone and will affect all subscribers currently using this plan."
      :item-name="plan?.name"
      confirm-text="Delete Plan"
      cancel-text="Cancel"
      loading-text="Deleting..."
      :loading="isDeleting"
      @confirm="handleDeletePlan"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  Settings,
} from 'lucide-vue-next'
import { plansService, type Plan } from '../../service/plansService'
import { featuresService, type Feature } from '../../service/featuresService'
import ConfirmationModal from '../../components/common/ConfirmationModal.vue'

const router = useRouter()
const route = useRoute()

const plan = ref<Plan | null>(null)
const features = ref<Feature[]>([])
const isLoading = ref(false)
const isDeleting = ref(false)

// Modal state
const showDeleteModal = ref(false)

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
  } catch (error) {
    console.error('Error deleting plan:', error)
    // You could show an error message here
  } finally {
    isDeleting.value = false
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
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
