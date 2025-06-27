<!-- frontend/src/views/CreateFeature.vue -->
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
      <h1 class="text-3xl font-bold tracking-tight">Add Feature</h1>
    </div>

    <div class="max-w-2xl rounded-lg border bg-white shadow-sm">
      <div class="p-6">
        <h2 class="text-lg font-semibold mb-6">Feature Details</h2>

        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-2">
            <label for="name" class="text-sm font-medium leading-none"> Feature Name * </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Enter feature name"
              required
              :disabled="loading"
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div class="space-y-2">
            <label for="description" class="text-sm font-medium leading-none">
              Description *
            </label>
            <textarea
              id="description"
              v-model="formData.description"
              placeholder="Enter feature description"
              rows="4"
              required
              :disabled="loading"
              class="flex min-h-20 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div class="flex space-x-2 pt-4">
            <button
              type="submit"
              :disabled="loading"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
            >
              {{ loading ? 'Creating...' : 'Add Feature' }}
            </button>
            <button
              type="button"
              @click="goBack"
              :disabled="loading"
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { featuresService, type CreateFeatureData } from '../service/featuresService'

const router = useRouter()

const formData = ref<CreateFeatureData>({
  name: '',
  description: '',
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    if (!formData.value.name.trim() || !formData.value.description.trim()) {
      throw new Error('Please fill in all required fields')
    }

    await featuresService.createFeature({
      name: formData.value.name.trim(),
      description: formData.value.description.trim(),
    })

    // Navigate back to features list
    router.push('/features')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create feature'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/features')
}
</script>
