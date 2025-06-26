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
        <Plus class="w-4 h-4 mr-2" />
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
      <button
        @click="loadPlans"
        class="mt-2 text-sm text-red-700 hover:text-red-900 underline"
      >
        Try again
      </button>
    </div>

    <!-- Plans Grid -->
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="relative rounded-lg border bg-white shadow-sm"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xl font-semibold">{{ plan.name }}</h3>
            <span class="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded">
              ${{ plan.price }}
            </span>
          </div>
          <p class="text-gray-600 mb-4 line-clamp-2">
            {{ plan.description }}
          </p>

          <div class="mb-3">
            <p class="text-sm text-gray-600">Duration: {{ plan.duration }} days</p>
          </div>

          <div class="mb-4">
            <p class="text-sm font-medium text-gray-700 mb-1">Features:</p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="featureName in getFeatureNames(plan.features)"
                :key="featureName"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ featureName }}
              </span>
              <span
                v-if="plan.features.length === 0"
                class="text-xs text-gray-500"
              >
                No features assigned
              </span>
            </div>
          </div>

          <div class="flex space-x-2 pt-2">
            <button
              @click="navigateToDetails(plan.id)"
              class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-9 px-3"
            >
              <Eye class="w-3 h-3 mr-1" />
              View
            </button>
            <button
              @click="navigateToEdit(plan.id)"
              class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-9 px-3"
            >
              <Edit class="w-3 h-3 mr-1" />
              Edit
            </button>
            <button
              @click="handleDeletePlan(plan.id, plan.name)"
              :disabled="deleting === plan.id"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 h-9 px-3"
            >
              <Trash2 class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && plans.length === 0" class="text-center py-12">
      <div class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <CreditCard class="w-6 h-6 text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No plans yet</h3>
      <p class="text-gray-500 mb-4">Create your first subscription plan to get started.</p>
      <button
        @click="navigateToCreate"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
      >
        <Plus class="w-4 h-4 mr-2" />
        Create Plan
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Eye, Edit, Trash2, CreditCard } from 'lucide-vue-next'
import { plansService, type Plan } from '../service/plansService'
import { featuresService, type Feature } from '../service/featuresService'

const router = useRouter()

const plans = ref<Plan[]>([])
const features = ref<Feature[]>([])
const loading = ref(false)
const error = ref('')
const deleting = ref<string | null>(null)

const loadPlans = async () => {
  try {
    loading.value = true
    error.value = ''
    const [plansData, featuresData] = await Promise.all([
      plansService.getPlans(),
      featuresService.getFeatures()
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
    .filter(feature => featureIds.includes(feature.feature_id))
    .map(feature => feature.name)
}

const handleDeletePlan = async (planId: string, planName: string) => {
  if (!confirm(`Are you sure you want to delete "${planName}"?`)) {
    return
  }

  try {
    deleting.value = planId
    await plansService.deletePlan(planId)

    // Remove from local state
    plans.value = plans.value.filter(p => p.id !== planId)

    console.log('Plan deleted successfully')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete plan'
  } finally {
    deleting.value = null
  }
}

const navigateToCreate = () => {
  router.push('/plans/create')
}

const navigateToDetails = (id: string) => {
  router.push(`/plans/${id}`)
}

const navigateToEdit = (id: string) => {
  router.push(`/plans/${id}/edit`)
}

onMounted(() => {
  loadPlans()
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