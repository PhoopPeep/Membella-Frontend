<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <h1 class="text-3xl font-bold tracking-tight">Plan Management</h1>
      </div>
      <button
        @click="navigateToCreate"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
      >
        <FontAwesomeIcon icon="plus" class="w-4 h-4 mr-2" />
        Create Plan
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-red-600">{{ error }}</p>
      <button @click="loadPlans" class="mt-2 text-sm text-red-700 hover:text-red-900 underline">
        Try again
      </button>
    </div>

    <!-- Plans Table -->
    <div v-else-if="plans.length > 0" class="rounded-lg border bg-white shadow-sm">
      <div class="p-6">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 font-medium text-gray-900">Plan Name</th>
                <th class="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                <th class="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                <th class="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                <th class="text-left py-3 px-4 font-medium text-gray-900">Features</th>
                <th class="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="plan in plans"
                :key="plan.id"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-4 px-4">
                  <div class="font-medium text-gray-900">{{ plan.name }}</div>
                </td>
                <td class="py-4 px-4">
                  <div class="max-w-xs truncate text-gray-600">{{ plan.description }}</div>
                </td>
                <td class="py-4 px-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    ฿{{ plan.price }}
                  </span>
                </td>
                <td class="py-4 px-4">
                  <span class="text-gray-900">{{ plan.duration }} days</span>
                </td>
                <td class="py-4 px-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="featureName in getFeatureNames(plan.features).slice(0, 3)"
                      :key="featureName"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {{ featureName }}
                    </span>
                    <span
                      v-if="plan.features.length > 3"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      +{{ plan.features.length - 3 }} more
                    </span>
                    <span v-if="plan.features.length === 0" class="text-xs text-gray-500">
                      No features
                    </span>
                  </div>
                </td>
                <td class="py-4 px-4">
                  <div class="flex space-x-2 justify-end">
                    <button
                      @click="navigateToDetails(plan.id)"
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-8 px-3"
                    >
                      <FontAwesomeIcon icon="eye" class="w-3 h-3 mr-1" />
                      View
                    </button>
                    <button
                      @click="navigateToEdit(plan.id)"
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-8 px-3"
                    >
                      <FontAwesomeIcon icon="edit" class="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      @click="confirmDeletePlan(plan)"
                      :disabled="deleting === plan.id"
                      class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-3"
                    >
                      <FontAwesomeIcon icon="trash" class="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="rounded-lg border bg-white shadow-sm">
      <div class="text-center py-12">
        <div
          class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4"
        >
          <FontAwesomeIcon icon="plus" class="w-6 h-6 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No plans yet</h3>
        <p class="text-gray-500 mb-4">Create your first subscription plan to get started.</p>
        <button
          @click="navigateToCreate"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
        >
          <FontAwesomeIcon icon="plus" class="w-4 h-4 mr-2" />
          Create Plan
        </button>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteModal"
      type="danger"
      title="Delete Plan"
      message="Are you sure you want to delete this plan? This action cannot be undone and will affect all subscribers currently using this plan."
      :item-name="planToDelete?.name"
      confirm-text="Delete Plan"
      cancel-text="Cancel"
      loading-text="Deleting..."
      :loading="deleting !== null"
      @confirm="handleDeletePlan"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { plansService, type Plan } from '../../service/plansService'
import { featuresService, type Feature } from '../../service/featuresService'
import ConfirmationModal from '../../components/common/ConfirmationModal.vue'

const router = useRouter()

const plans = ref<Plan[]>([])
const features = ref<Feature[]>([])
const loading = ref(false)
const error = ref('')
const deleting = ref<string | null>(null)

// Modal state
const showDeleteModal = ref(false)
const planToDelete = ref<Plan | null>(null)

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

    console.log('Plan deleted successfully')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete plan'
  } finally {
    deleting.value = null
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  planToDelete.value = null
}

const navigateToCreate = () => {
  router.push('/plans/create')
}

const navigateToDetails = (id: string) => {
  router.push(`/plans/฿{id}`)
}

const navigateToEdit = (id: string) => {
  router.push(`/plans/฿{id}/edit`)
}

onMounted(() => {
  loadPlans()
})
</script>
