<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center space-x-2">
      <button
        @click="goBack"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-9 px-3 mr-2"
      >
        <ArrowLeft class="w-4 h-4 mr-1" />
        Back
      </button>
      <h1 class="text-3xl font-bold tracking-tight">Edit Plan</h1>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingPlan" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading plan...</p>
    </div>

    <!-- Plan Not Found -->
    <div
      v-else-if="!plan && !isLoadingPlan"
      class="bg-white rounded-lg border border-gray-200 shadow-sm max-w-2xl"
    >
      <div class="text-center py-12">
        <p class="text-gray-500">Plan not found</p>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-else-if="plan" class="max-w-2xl rounded-lg border bg-white shadow-sm">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold">Plan Details</h2>
      </div>
      <div class="p-6">
        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <label for="name" class="text-sm font-medium leading-none">Plan Name *</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Enter plan name"
              required
              :disabled="isLoading"
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div class="space-y-2">
            <label for="description" class="text-sm font-medium leading-none">Description *</label>
            <textarea
              id="description"
              v-model="formData.description"
              placeholder="Enter plan description"
              rows="3"
              required
              :disabled="isLoading"
              class="flex min-h-20 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label for="price" class="text-sm font-medium leading-none">Price ($) *</label>
              <input
                id="price"
                v-model.number="formData.price"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
                :disabled="isLoading"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div class="space-y-2">
              <label for="duration" class="text-sm font-medium leading-none"
                >Duration (days) *</label
              >
              <input
                id="duration"
                v-model.number="formData.duration"
                type="number"
                placeholder="30"
                required
                :disabled="isLoading"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div class="space-y-4">
            <label class="text-sm font-medium leading-none">Features</label>
            <div
              v-if="features.length > 0"
              class="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3"
            >
              <div
                v-for="feature in features"
                :key="feature.feature_id"
                class="flex items-center space-x-2"
              >
                <input
                  :id="feature.feature_id"
                  v-model="selectedFeatures"
                  :value="feature.feature_id"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label :for="feature.feature_id" class="text-sm font-normal cursor-pointer">
                  <div>
                    <p class="font-medium">{{ feature.name }}</p>
                    <p class="text-xs text-gray-500">{{ feature.description }}</p>
                  </div>
                </label>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 bg-gray-50 p-4 rounded-md">
              No features available.
            </div>
          </div>

          <div class="flex space-x-2 pt-4">
            <button
              type="submit"
              :disabled="isLoading"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
            >
              {{ isLoading ? 'Updating...' : 'Update Plan' }}
            </button>
            <button
              type="button"
              @click="goBack"
              :disabled="isLoading"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-10 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { plansService, type Plan, type UpdatePlanData } from '../service/plansService'
import { featuresService, type Feature } from '../service/featuresService'

const router = useRouter()
const route = useRoute()

const plan = ref<Plan | null>(null)
const features = ref<Feature[]>([])
const isLoadingPlan = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const formData = ref<UpdatePlanData>({
  name: '',
  description: '',
  price: 0,
  duration: 30,
  features: [],
})

const selectedFeatures = ref<string[]>([])
const planId = route.params.id as string

const loadPlan = async () => {
  if (!planId) return

  try {
    isLoadingPlan.value = true
    const [planData, featuresData] = await Promise.all([
      plansService.getPlanById(planId),
      featuresService.getFeatures(),
    ])

    plan.value = planData
    features.value = featuresData

    // Populate form data
    formData.value = {
      name: planData.name,
      description: planData.description,
      price: planData.price,
      duration: planData.duration,
      features: planData.features,
    }
    selectedFeatures.value = [...planData.features]
  } catch (error) {
    errorMessage.value = 'Failed to load plan'
    console.error('Error loading plan:', error)
  } finally {
    isLoadingPlan.value = false
  }
}

const handleSubmit = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    if (
      !formData.value.name ||
      !formData.value.description ||
      !formData.value.price ||
      !formData.value.duration
    ) {
      throw new Error('Please fill in all required fields')
    }

    await plansService.updatePlan(planId, {
      name: formData.value.name.trim(),
      description: formData.value.description.trim(),
      price: formData.value.price,
      duration: formData.value.duration,
      features: selectedFeatures.value,
    })

    router.push(`/plans/${planId}`)
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to update plan. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push(`/plans/${planId}`)
}

onMounted(() => {
  loadPlan()
})
</script>
