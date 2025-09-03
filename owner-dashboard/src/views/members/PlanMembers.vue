<template>
  <div class="flex-1 gap-4 space-y-4 p-4 md:p-8 pt-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Plan Members</h1>
        <p class="text-gray-600 mt-1">{{ selectedPlan?.planName || 'Loading...' }}</p>
      </div>
      <button
        @click="goBack"
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FontAwesomeIcon icon="arrow-left" class="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>
    </div>

    <!-- Loading State -->
    <LoadingSpinner
      v-if="loading"
      text="Loading members..."
      subtitle="Please wait while we fetch member data"
      full-screen
    />

    <!-- Error State -->
    <Card v-else-if="error">
      <div class="bg-red-50 border border-red-200 rounded-md p-4">
        <p class="text-red-600">{{ error }}</p>
        <button
          @click="loadPlanMembers"
          class="mt-2 text-sm text-red-700 hover:text-red-900 underline"
        >
          Try again
        </button>
      </div>
    </Card>

    <!-- Members Content -->
    <div v-else>
      <!-- Plan Info Card -->
      <Card class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">{{ selectedPlan?.planName }}</h2>
            <p class="text-sm text-gray-500">{{ planMembers.length }} members</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Plan ID</p>
            <p class="text-sm font-medium text-gray-900">{{ selectedPlan?.planId }}</p>
          </div>
        </div>
      </Card>

      <!-- Members List -->
      <Card>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Members List</h3>
          <div class="flex items-center space-x-2">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search members..."
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FontAwesomeIcon icon="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
        </div>

        <!-- Members Table -->
        <div v-if="filteredMembers.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription Period
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="member in filteredMembers" :key="member.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <FontAwesomeIcon icon="user" class="w-5 h-5 text-blue-600" />
                    </div>
                                         <div>
                       <div class="text-sm font-medium text-gray-900">{{ member.fullName || member.email }}</div>
                       <div class="text-sm text-gray-500">{{ member.email }}</div>
                     </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': member.status === 'active',
                      'bg-red-100 text-red-800': member.status === 'cancelled',
                      'bg-yellow-100 text-yellow-800': member.status === 'inactive'
                    }"
                  >
                    {{ member.status }}
                  </span>
                </td>
                                 <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   <div>
                     <div>{{ formatDate(member.subscriptionStart) }}</div>
                     <div class="text-xs text-gray-500">to {{ member.subscriptionEnd ? formatDate(member.subscriptionEnd) : 'N/A' }}</div>
                   </div>
                 </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(member.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewMemberDetails(member)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <EmptyState
          v-else
          title="No Members Found"
          :description="searchQuery ? 'No members match your search criteria' : 'No members in this plan yet'"
          size="lg"
          icon="users"
        />
      </Card>
    </div>

    <!-- Member Details Modal -->
    <Transition name="modal">
      <div v-if="showMemberDetailsModal" class="fixed inset-0 bg-gray-100 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50" @click="closeMemberDetailsModal">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden transform transition-all duration-300 ease-out scale-100" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Member Details</h3>
          <button
            @click="closeMemberDetailsModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FontAwesomeIcon icon="times" class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div v-if="selectedMember" class="space-y-4">
            <div class="flex items-center">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <FontAwesomeIcon icon="user" class="w-8 h-8 text-blue-600" />
              </div>
                             <div>
                 <h4 class="text-lg font-medium text-gray-900">{{ selectedMember.fullName || selectedMember.email }}</h4>
                 <p class="text-sm text-gray-500">{{ selectedMember.email }}</p>
               </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="block text-sm font-medium text-gray-700">Status</div>
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1"
                  :class="{
                    'bg-green-100 text-green-800': selectedMember.status === 'active',
                    'bg-red-100 text-red-800': selectedMember.status === 'cancelled',
                    'bg-yellow-100 text-yellow-800': selectedMember.status === 'inactive'
                  }"
                >
                  {{ selectedMember.status }}
                </span>
              </div>
              <div>
                <div class="block text-sm font-medium text-gray-700">Plan ID</div>
                <p class="text-sm text-gray-900 mt-1">{{ selectedMember.planId }}</p>
              </div>
              <div>
                <div class="block text-sm font-medium text-gray-700">Subscription Start</div>
                <p class="text-sm text-gray-900 mt-1">{{ formatDate(selectedMember.subscriptionStart) }}</p>
              </div>
                             <div>
                 <div class="block text-sm font-medium text-gray-700">Subscription End</div>
                 <p class="text-sm text-gray-900 mt-1">{{ selectedMember.subscriptionEnd ? formatDate(selectedMember.subscriptionEnd) : 'N/A' }}</p>
               </div>
              <div>
                <div class="block text-sm font-medium text-gray-700">Created At</div>
                <p class="text-sm text-gray-900 mt-1">{{ formatDate(selectedMember.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            @click="confirmDeleteMember"
            class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            :disabled="isDeleting"
          >
            <FontAwesomeIcon icon="trash" class="w-4 h-4 mr-2" />
            {{ isDeleting ? 'Deleting...' : 'Delete Member' }}
          </button>
        </div>
      </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition name="modal">
      <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-gray-100 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50" @click="closeDeleteConfirmModal">
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out scale-100" @click.stop>
          <div class="p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <FontAwesomeIcon icon="exclamation-triangle" class="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Delete Member</h3>
                <p class="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <div class="mb-6">
              <p class="text-gray-700">
                Are you sure you want to delete
                <span class="font-semibold">{{ selectedMember?.fullName || selectedMember?.email }}</span>?
              </p>
              <p class="text-sm text-gray-500 mt-2">
                This will permanently remove the member and all their subscription data.
              </p>
            </div>

            <div class="flex justify-end space-x-3">
              <button
                @click="closeDeleteConfirmModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                :disabled="isDeleting"
              >
                Cancel
              </button>
              <button
                @click="deleteMember"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                :disabled="isDeleting"
              >
                <FontAwesomeIcon v-if="isDeleting" icon="spinner" class="w-4 h-4 mr-2 animate-spin" />
                {{ isDeleting ? 'Deleting...' : 'Delete Member' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dashboardService } from '../../service/dashboardService'
import type { Member } from '../../service/dashboardService'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Import reusable components
const Card = defineAsyncComponent(() => import('../../components/common/Card.vue'))
const EmptyState = defineAsyncComponent(() => import('../../components/common/EmptyState.vue'))
const LoadingSpinner = defineAsyncComponent(() => import('../../components/common/LoadingSpinner.vue'))

const route = useRoute()
const router = useRouter()

// Reactive data
const planMembers = ref<Member[]>([])
const selectedPlan = ref<{ planId: string; planName: string; memberCount: number } | null>(null)
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')

// Modal states
const showMemberDetailsModal = ref(false)
const showDeleteConfirmModal = ref(false)
const selectedMember = ref<Member | null>(null)
const isDeleting = ref(false)

// Computed
const filteredMembers = computed(() => {
  if (!searchQuery.value) return planMembers.value

  const query = searchQuery.value.toLowerCase()
  return planMembers.value.filter(member =>
    member.email.toLowerCase().includes(query) ||
    (member.fullName && member.fullName.toLowerCase().includes(query)) ||
    member.id.toLowerCase().includes(query) ||
    member.status.toLowerCase().includes(query)
  )
})

// Methods
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const loadPlanMembers = async () => {
  try {
    loading.value = true
    error.value = ''

    const planId = route.params.planId as string
    const planName = route.query.planName as string
    const memberCount = parseInt(route.query.memberCount as string) || 0

    selectedPlan.value = { planId, planName, memberCount }

    // Get members for this specific plan
    planMembers.value = await dashboardService.getPlanMembers(planId)

    console.log('Plan members loaded:', {
      planId,
      planName,
      planMembers: planMembers.value.length
    })
  } catch (err) {
    console.error('Error loading plan members:', err)
    error.value = 'Failed to load plan members'
  } finally {
    loading.value = false
  }
}

const viewMemberDetails = (member: Member) => {
  selectedMember.value = member
  showMemberDetailsModal.value = true
}

const closeMemberDetailsModal = () => {
  showMemberDetailsModal.value = false
  selectedMember.value = null
}

const confirmDeleteMember = () => {
  showDeleteConfirmModal.value = true
}

const closeDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = false
}

const deleteMember = async () => {
  if (!selectedMember.value) return

  try {
    isDeleting.value = true

    // Call delete member API
    await dashboardService.deleteMember(selectedMember.value.id)

    // Remove member from local list
    planMembers.value = planMembers.value.filter(member => member.id !== selectedMember.value!.id)

    // Close modals
    showDeleteConfirmModal.value = false
    showMemberDetailsModal.value = false
    selectedMember.value = null

    // Show success message (you can add a toast notification here)
    console.log('Member deleted successfully')

  } catch (err) {
    console.error('Error deleting member:', err)
    error.value = 'Failed to delete member'
  } finally {
    isDeleting.value = false
  }
}

const goBack = () => {
  router.push('/dashboard')
}

// Lifecycle
onMounted(() => {
  loadPlanMembers()
})
</script>

<style scoped>
/* Modal transition effects */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  backdrop-filter: blur(4px);
}

/* Modal content animation */
.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: all 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9) translateY(-20px);
  opacity: 0;
}

.modal-enter-to .bg-white,
.modal-leave-from .bg-white {
  transform: scale(1) translateY(0);
  opacity: 1;
}
</style>
