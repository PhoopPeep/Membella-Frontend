<!-- frontend/src/views/Features.vue -->
<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <h1 class="text-3xl font-bold tracking-tight">Feature Management</h1>
      </div>
      <button
        @click="navigateToCreate"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
      >
        <Plus class="w-4 h-4 mr-2" />
        Add Feature
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-red-600">{{ error }}</p>
      <button @click="loadFeatures" class="mt-2 text-sm text-red-700 hover:text-red-900 underline">
        Try again
      </button>
    </div>

    <!-- Features Grid -->
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="feature in features"
        :key="feature.feature_id"
        class="relative rounded-lg border bg-white shadow-sm"
      >
        <div class="p-6">
          <div class="flex items-center space-x-2 mb-4">
            <Settings class="w-5 h-5 text-blue-600" />
            <h3 class="text-xl font-semibold">{{ feature.name }}</h3>
          </div>
          <p class="text-gray-600 mb-4 line-clamp-3">
            {{ feature.description }}
          </p>
          <div class="text-sm text-gray-500 mb-4">Created: {{ formatDate(feature.create_at) }}</div>
          <div class="flex space-x-2">
            <button
              @click="navigateToDetails(feature.feature_id)"
              class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-9 px-3"
            >
              <Eye class="w-3 h-3 mr-1" />
              View
            </button>
            <button
              @click="navigateToEdit(feature.feature_id)"
              class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-9 px-3"
            >
              <Edit class="w-3 h-3 mr-1" />
              Edit
            </button>
            <button
              @click="handleDeleteFeature(feature.feature_id, feature.name)"
              :disabled="deleting === feature.feature_id"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 h-9 px-3"
            >
              <Trash2 class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && features.length === 0" class="text-center py-12">
      <div class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Settings class="w-6 h-6 text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No features yet</h3>
      <p class="text-gray-500 mb-4">Create your first feature to assign to plans.</p>
      <button
        @click="navigateToCreate"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
      >
        <Plus class="w-4 h-4 mr-2" />
        Add Feature
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Eye, Edit, Trash2, Settings } from 'lucide-vue-next'
import { featuresService, type Feature } from '../service/featuresService'

const router = useRouter()

const features = ref<Feature[]>([])
const loading = ref(false)
const error = ref('')
const deleting = ref<string | null>(null)

const loadFeatures = async () => {
  try {
    loading.value = true
    error.value = ''
    features.value = await featuresService.getFeatures()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load features'
  } finally {
    loading.value = false
  }
}

const handleDeleteFeature = async (featureId: string, featureName: string) => {
  if (!confirm(`Are you sure you want to delete "${featureName}"?`)) {
    return
  }

  try {
    deleting.value = featureId
    await featuresService.deleteFeature(featureId)

    // Remove from local state
    features.value = features.value.filter((f) => f.feature_id !== featureId)

    // You could add a toast notification here
    console.log('Feature deleted successfully')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete feature'
  } finally {
    deleting.value = null
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const navigateToCreate = () => {
  router.push('/features/create')
}

const navigateToDetails = (id: string) => {
  router.push(`/features/${id}`)
}

const navigateToEdit = (id: string) => {
  router.push(`/features/${id}/edit`)
}

onMounted(() => {
  loadFeatures()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
