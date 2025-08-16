<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <!-- Page Header -->
    <PageHeader
      title="Feature Management"
      :primary-action="{
        text: 'Add Feature',
        icon: 'plus',
        disabled: isLoading,
        onClick: navigateToCreate,
      }"
    />

    <!-- Error Toast -->
    <ErrorToast
      :show="hasErrors"
      :type="
        latestError?.type === 'network'
          ? 'error'
          : latestError?.type === 'validation'
            ? 'warning'
            : 'error'
      "
      :title="getErrorTitle(latestError?.type)"
      :message="latestError?.message"
      :duration="latestError?.type === 'validation' ? 10 : 15"
      @dismiss="clearAllErrors"
    />

    <!-- Success Toast -->
    <ErrorToast
      :show="showSuccessToast"
      type="success"
      :title="successMessage.title"
      :message="successMessage.text"
      :duration="5"
      @dismiss="showSuccessToast = false"
    />

    <!-- Loading State -->
    <LoadingSpinner
      v-if="isLoading && features.length === 0"
      text="Loading features..."
      subtitle="Please wait while we fetch your features"
      color="blue"
    />

    <!-- Features Table -->
    <DataTable
      v-else-if="features.length > 0"
      :data="features"
      :columns="tableColumns"
      :loading="isLoading"
      loading-text="Processing..."
      row-key="feature_id"
      :disabled-rows="(item) => deletingIds.includes(item.feature_id)"
    >
      <!-- Custom column for name with icon -->
      <template #column-name="{ item }">
        <div class="flex items-center">
          <FontAwesomeIcon icon="cog" class="w-4 h-4 text-blue-600 mr-2" />
          <span class="font-medium text-gray-900">{{ item.name }}</span>
        </div>
      </template>

      <!-- Custom column for description with truncation -->
      <template #column-description="{ item }">
        <div class="max-w-md text-gray-600">
          <span class="line-clamp-2">{{ item.description }}</span>
        </div>
      </template>

      <!-- Custom column for actions -->
      <template #column-actions="{ item }">
        <ActionButtons
          :actions="getRowActions(item)"
          container-class="justify-end"
          @action="handleRowAction"
        />
      </template>
    </DataTable>

    <!-- Empty State -->
    <EmptyState
      v-else-if="!isLoading"
      title="No features yet"
      description="Create your first feature to assign to plans."
      icon="cog"
      :primary-action="{
        text: 'Add Feature',
        icon: 'plus',
        onClick: navigateToCreate,
      }"
    />

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showDeleteModal"
      type="danger"
      title="Delete Feature"
      message="Are you sure you want to delete this feature? This action cannot be undone and will remove the feature from all plans that currently include it."
      :item-name="featureToDelete?.name"
      confirm-text="Delete Feature"
      cancel-text="Cancel"
      loading-text="Deleting..."
      :loading="isDeleting"
      @confirm="handleDeleteFeature"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { featuresService, type Feature } from '../../service/featuresService'
import { useErrorHandler } from '../../composables/useErrorHandler'

// Import reusable components
import PageHeader from '../../components/common/PageHeader.vue'
import DataTable, { type TableColumn } from '../../components/common/DataTable.vue'
import ActionButtons, { type ActionButton } from '../../components/common/ActionButtons.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import ConfirmationModal from '../../components/common/ConfirmationModal.vue'
import ErrorToast from '../../components/common/ErrorToast.vue'
import LoadingSpinner from '../../components/common/LoadingSpinner.vue'

const router = useRouter()

// Error handling
const { hasErrors, latestError, clearAllErrors, withErrorHandling, isLoading } = useErrorHandler()

// Data
const features = ref<Feature[]>([])
const deletingIds = ref<string[]>([])
const isDeleting = ref(false)

// Modal state
const showDeleteModal = ref(false)
const featureToDelete = ref<Feature | null>(null)

// Success state
const showSuccessToast = ref(false)
const successMessage = ref({ title: '', text: '' })

// Table configuration
const tableColumns: TableColumn[] = [
  { key: 'name', title: 'Feature Name' },
  { key: 'description', title: 'Description' },
  { key: 'create_at', title: 'Created Date', type: 'date' },
  { key: 'actions', title: 'Actions', align: 'right' },
]

// Computed
const getErrorTitle = (type?: string) => {
  switch (type) {
    case 'network':
      return 'Connection Error'
    case 'validation':
      return 'Validation Error'
    case 'auth':
      return 'Authentication Error'
    case 'server':
      return 'Server Error'
    default:
      return 'Error'
  }
}

// Methods
const getRowActions = (feature: Feature): ActionButton[] => [
  {
    key: 'view',
    text: 'View',
    icon: 'eye',
    variant: 'secondary',
    size: 'sm',
    disabled: isLoading.value,
    onClick: () => navigateToDetails(feature.feature_id),
  },
  {
    key: 'edit',
    text: 'Edit',
    icon: 'edit',
    variant: 'secondary',
    size: 'sm',
    disabled: isLoading.value,
    onClick: () => navigateToEdit(feature.feature_id),
  },
  {
    key: 'delete',
    icon: 'trash',
    variant: 'danger',
    size: 'sm',
    disabled: isLoading.value || deletingIds.value.includes(feature.feature_id),
    loading: deletingIds.value.includes(feature.feature_id),
    onClick: () => confirmDeleteFeature(feature),
  },
]

const handleRowAction = (action: ActionButton) => {
  // Actions are handled by individual onClick handlers
}

const loadFeatures = async () => {
  const result = await withErrorHandling(() => featuresService.getFeatures(), 'Loading features', {
    showLoading: true,
    clearPreviousErrors: true,
  })

  if (result) {
    features.value = result
  }
}

const confirmDeleteFeature = (feature: Feature) => {
  featureToDelete.value = feature
  showDeleteModal.value = true
}

const handleDeleteFeature = async () => {
  if (!featureToDelete.value) return

  const featureId = featureToDelete.value.feature_id
  const featureName = featureToDelete.value.name

  // Add to deleting list
  deletingIds.value.push(featureId)
  isDeleting.value = true

  const result = await withErrorHandling(
    () => featuresService.deleteFeature(featureId),
    'Deleting feature',
    { showLoading: false, clearPreviousErrors: false },
  )

  if (result) {
    // Remove from local state
    features.value = features.value.filter((f) => f.feature_id !== featureId)

    // Show success message
    showSuccess('Feature Deleted', `"${featureName}" has been successfully deleted.`)

    // Close modal
    showDeleteModal.value = false
    featureToDelete.value = null
  }

  // Remove from deleting list
  deletingIds.value = deletingIds.value.filter((id) => id !== featureId)
  isDeleting.value = false
}

const cancelDelete = () => {
  showDeleteModal.value = false
  featureToDelete.value = null
}

const showSuccess = (title: string, text: string) => {
  successMessage.value = { title, text }
  showSuccessToast.value = true
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

// Lifecycle
onMounted(() => {
  loadFeatures()
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
