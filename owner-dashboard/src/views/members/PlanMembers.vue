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
            Plan Members 👥
          </h1>
          <p class="text-lg text-white/90 font-medium max-w-2xl mx-auto">
            {{ selectedPlan?.planName || 'Loading...' }}
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 md:px-8 -mt-4 relative z-10 pb-12">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-8 mt-8">
        <div class="flex items-center space-x-4">
          <button
            @click="goBack"
            class="p-3 text-primary-600 hover:text-primary-700 hover:bg-primary-100 rounded-xl transition-all duration-200"
            title="Back to Dashboard"
          >
            <FontAwesomeIcon icon="arrow-left" class="w-5 h-5" />
          </button>
          <div>
            <h2 class="text-xl font-bold text-primary-700">Plan Members</h2>
            <p class="text-primary-600 text-sm">{{ selectedPlan?.planName || 'Loading...' }}</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-16">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin"></div>
          <div
            class="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"
          ></div>
        </div>
        <h3 class="text-lg font-bold text-primary-700 mt-4">Loading Members</h3>
        <p class="text-primary-600 text-sm">Please wait while we fetch member data</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-white/80 backdrop-blur-sm rounded-3xl border border-error-200 shadow-xl p-12"
      >
        <div class="text-center max-w-lg mx-auto">
          <div
            class="w-20 h-20 bg-gradient-to-r from-error-500 to-error-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <FontAwesomeIcon icon="exclamation-triangle" class="w-10 h-10 text-white" />
          </div>
          <h3 class="text-xl font-bold text-error-800 mb-3">Error Loading Members</h3>
          <p class="text-error-600 mb-6 font-medium text-sm">{{ error }}</p>
          <button
            @click="loadPlanMembers"
            class="inline-flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-semibold text-base hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FontAwesomeIcon icon="refresh" class="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>

      <!-- Members Content -->
      <div v-else class="space-y-8">
        <!-- Plan Info Card -->
        <div class="bg-white rounded-2xl border border-primary-200 shadow-soft overflow-hidden">
          <div
            class="p-8 border-b border-primary-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50"
          >
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-primary-700 flex items-center">
                  <FontAwesomeIcon icon="users" class="w-6 h-6 mr-3 text-secondary-500" />
                  {{ selectedPlan?.planName }}
                </h2>
                <p class="text-primary-600 mt-1">{{ planMembers.length }} members</p>
              </div>
              <div class="text-right">
                <div class="bg-primary-100 rounded-xl p-4">
                  <p class="text-sm text-primary-600 font-semibold">Plan ID</p>
                  <p class="text-lg font-bold text-primary-700">{{ selectedPlan?.planId }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Members List -->
        <div class="bg-white rounded-2xl border border-primary-200 shadow-soft overflow-hidden">
          <div
            class="p-8 border-b border-primary-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50"
          >
            <h3 class="text-2xl font-bold text-primary-700 flex items-center">
              <FontAwesomeIcon icon="list" class="w-6 h-6 mr-3 text-secondary-500" />
              Members List
            </h3>
            <p class="text-primary-600 mt-1">Manage your plan members</p>
          </div>

          <!-- Members Table -->
          <div v-if="planMembers.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-primary-100">
              <thead class="bg-gradient-to-r from-primary-50 to-secondary-50">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                    <FontAwesomeIcon icon="user" class="w-4 h-4 mr-2" />
                    Member
                  </th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                    <FontAwesomeIcon icon="circle" class="w-4 h-4 mr-2" />
                    Status
                  </th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                    <FontAwesomeIcon icon="calendar" class="w-4 h-4 mr-2" />
                    Subscription Period
                  </th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                    <FontAwesomeIcon icon="clock" class="w-4 h-4 mr-2" />
                    Joined
                  </th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-primary-700">
                    <FontAwesomeIcon icon="cog" class="w-4 h-4 mr-2" />
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-primary-100">
                <tr
                  v-for="member in planMembers"
                  :key="member.id"
                  class="hover:bg-primary-50/50 transition-colors"
                >
                  <td class="px-6 py-6 whitespace-nowrap">
                    <div class="flex items-center">
                      <div
                        class="w-12 h-12 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center mr-4 shadow-sm"
                      >
                        <FontAwesomeIcon icon="user" class="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <div class="text-base font-semibold text-primary-700">
                          {{ member.fullName || member.email }}
                        </div>
                        <div class="text-sm text-primary-600">{{ member.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-6 whitespace-nowrap">
                    <span
                      class="inline-flex px-3 py-1 text-xs font-bold rounded-full"
                      :class="{
                        'bg-success-100 text-success-800': member.status === 'active',
                        'bg-error-100 text-error-800': member.status === 'cancelled',
                        'bg-warning-100 text-warning-800': member.status === 'inactive',
                      }"
                    >
                      {{ member.status }}
                    </span>
                  </td>
                  <td class="px-6 py-6 whitespace-nowrap text-sm text-primary-700">
                    <div>
                      <div class="font-semibold">{{ formatDate(member.subscriptionStart) }}</div>
                      <div class="text-xs text-primary-500">
                        to {{ member.subscriptionEnd ? formatDate(member.subscriptionEnd) : 'N/A' }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-6 whitespace-nowrap text-sm text-primary-600">
                    {{ formatDate(member.createdAt) }}
                  </td>
                  <td class="px-6 py-6 whitespace-nowrap">
                    <button
                      @click="viewMemberDetails(member)"
                      class="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-100 rounded-lg transition-all duration-200"
                      title="View Details"
                    >
                      <FontAwesomeIcon icon="eye" class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-16">
            <div
              class="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <FontAwesomeIcon icon="users" class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-xl font-bold text-primary-700 mb-3">No Members Found</h3>
            <p class="text-primary-600 mb-6 text-sm">
              No members in this plan yet. Members will appear here once they subscribe.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Member Details Modal -->
    <Transition name="modal">
      <div
        v-if="showMemberDetailsModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
        @click="closeMemberDetailsModal"
      >
        <div
          class="relative top-20 mx-auto p-8 border w-11/12 max-w-3xl shadow-2xl rounded-2xl bg-white"
          @click.stop
        >
          <div
            class="flex items-center justify-between p-8 border-b border-primary-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50"
          >
            <h3 class="text-2xl font-bold text-primary-700 flex items-center">
              <FontAwesomeIcon icon="user" class="w-6 h-6 mr-3 text-secondary-500" />
              Member Details
            </h3>
            <button
              @click="closeMemberDetailsModal"
              class="p-2 text-primary-400 hover:text-primary-600 hover:bg-primary-100 rounded-xl transition-all duration-200"
            >
              <FontAwesomeIcon icon="times" class="w-5 h-5" />
            </button>
          </div>
          <div class="p-8 overflow-y-auto max-h-[65vh]">
            <div v-if="selectedMember" class="space-y-8">
              <!-- Member Profile -->
              <div
                class="flex items-center p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl"
              >
                <div
                  class="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg"
                >
                  <FontAwesomeIcon icon="user" class="w-10 h-10 text-white" />
                </div>
                <div>
                  <h4 class="text-2xl font-bold text-primary-700">
                    {{ selectedMember.fullName || selectedMember.email }}
                  </h4>
                  <p class="text-primary-600 text-lg">{{ selectedMember.email }}</p>
                </div>
              </div>

              <!-- Member Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white rounded-xl border border-primary-200 p-6 shadow-sm">
                  <div class="flex items-center mb-4">
                    <FontAwesomeIcon icon="circle" class="w-5 h-5 text-primary-600 mr-2" />
                    <h5 class="text-lg font-bold text-primary-700">Status</h5>
                  </div>
                  <span
                    class="inline-flex px-4 py-2 text-sm font-bold rounded-full"
                    :class="{
                      'bg-success-100 text-success-800': selectedMember.status === 'active',
                      'bg-error-100 text-error-800': selectedMember.status === 'cancelled',
                      'bg-warning-100 text-warning-800': selectedMember.status === 'inactive',
                    }"
                  >
                    {{ selectedMember.status }}
                  </span>
                </div>

                <div class="bg-white rounded-xl border border-primary-200 p-6 shadow-sm">
                  <div class="flex items-center mb-4">
                    <FontAwesomeIcon icon="tag" class="w-5 h-5 text-primary-600 mr-2" />
                    <h5 class="text-lg font-bold text-primary-700">Plan ID</h5>
                  </div>
                  <p class="text-primary-700 font-semibold text-lg">{{ selectedMember.planId }}</p>
                </div>

                <div class="bg-white rounded-xl border border-primary-200 p-6 shadow-sm">
                  <div class="flex items-center mb-4">
                    <FontAwesomeIcon icon="calendar-plus" class="w-5 h-5 text-primary-600 mr-2" />
                    <h5 class="text-lg font-bold text-primary-700">Subscription Start</h5>
                  </div>
                  <p class="text-primary-700 font-semibold text-lg">
                    {{ formatDate(selectedMember.subscriptionStart) }}
                  </p>
                </div>

                <div class="bg-white rounded-xl border border-primary-200 p-6 shadow-sm">
                  <div class="flex items-center mb-4">
                    <FontAwesomeIcon icon="calendar-minus" class="w-5 h-5 text-primary-600 mr-2" />
                    <h5 class="text-lg font-bold text-primary-700">Subscription End</h5>
                  </div>
                  <p class="text-primary-700 font-semibold text-lg">
                    {{
                      selectedMember.subscriptionEnd
                        ? formatDate(selectedMember.subscriptionEnd)
                        : 'N/A'
                    }}
                  </p>
                </div>

                <div
                  class="bg-white rounded-xl border border-primary-200 p-6 shadow-sm md:col-span-2"
                >
                  <div class="flex items-center mb-4">
                    <FontAwesomeIcon icon="clock" class="w-5 h-5 text-primary-600 mr-2" />
                    <h5 class="text-lg font-bold text-primary-700">Created At</h5>
                  </div>
                  <p class="text-primary-700 font-semibold text-lg">
                    {{ formatDate(selectedMember.createdAt) }}
                  </p>
                </div>
              </div>

              <!-- Payment History Section -->
              <div
                v-if="selectedMember.paymentHistory && selectedMember.paymentHistory.length > 0"
                class="mt-8"
              >
                <div
                  class="bg-white rounded-2xl border border-primary-200 shadow-soft overflow-hidden"
                >
                  <div
                    class="p-6 border-b border-primary-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50"
                  >
                    <div class="flex items-center justify-between">
                      <h5 class="text-xl font-bold text-primary-700 flex items-center">
                        <FontAwesomeIcon
                          icon="credit-card"
                          class="w-5 h-5 mr-3 text-secondary-500"
                        />
                        Payment History
                      </h5>
                      <div class="text-sm text-primary-600">
                        Total Spent:
                        <span class="font-bold text-success-600 text-lg"
                          >฿{{ selectedMember.totalSpent?.toFixed(2) || '0.00' }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <div class="p-6 max-h-64 overflow-y-auto">
                    <div class="space-y-4">
                      <div
                        v-for="payment in selectedMember.paymentHistory"
                        :key="payment.id"
                        class="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50/30 to-secondary-50/30 rounded-xl border border-primary-100 hover:border-primary-200 transition-all duration-200"
                      >
                        <div class="flex-1">
                          <div class="flex items-center justify-between mb-2">
                            <p class="text-base font-semibold text-primary-700">
                              {{ payment.planName }}
                            </p>
                            <span
                              class="inline-flex px-3 py-1 text-xs font-bold rounded-full"
                              :class="{
                                'bg-success-100 text-success-800': payment.status === 'successful',
                                'bg-error-100 text-error-800': payment.status === 'failed',
                                'bg-warning-100 text-warning-800': payment.status === 'pending',
                              }"
                            >
                              {{ payment.status }}
                            </span>
                          </div>
                          <p class="text-sm text-primary-600">
                            {{ formatDate(payment.createdAt) }}
                          </p>
                        </div>
                        <div class="ml-4 text-right">
                          <p class="text-lg font-bold text-primary-700">
                            ฿{{ payment.amount.toFixed(2) }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Payment History -->
              <div v-else class="mt-8">
                <div
                  class="text-center py-12 bg-primary-50 rounded-2xl border-2 border-primary-200"
                >
                  <div
                    class="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <FontAwesomeIcon icon="credit-card" class="w-8 h-8 text-white" />
                  </div>
                  <h5 class="text-lg font-bold text-primary-700 mb-2">No Payment History</h5>
                  <p class="text-sm text-primary-600">
                    No payment records available for this member
                  </p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div
              class="flex justify-end p-8 border-t border-primary-100 bg-gradient-to-r from-primary-50/30 to-secondary-50/30"
            >
              <button
                @click="confirmDeleteMember"
                class="inline-flex items-center px-6 py-3 text-sm font-semibold text-error-600 bg-error-50 border-2 border-error-200 rounded-xl hover:bg-error-100 hover:border-error-300 focus:outline-none focus:ring-4 focus:ring-error-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isDeleting || selectedMember?.status === 'active'"
                :title="
                  selectedMember?.status === 'active'
                    ? 'Cannot remove member with active subscription'
                    : 'Remove member from your plans'
                "
              >
                <FontAwesomeIcon icon="trash" class="w-4 h-4 mr-2" />
                {{
                  isDeleting
                    ? 'Removing...'
                    : selectedMember?.status === 'active'
                      ? 'Cannot Remove (Active)'
                      : 'Remove Member'
                }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition name="modal">
      <div
        v-if="showDeleteConfirmModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
        @click="closeDeleteConfirmModal"
      >
        <div
          class="relative top-20 mx-auto p-8 border w-11/12 max-w-md shadow-2xl rounded-2xl bg-white"
          @click.stop
        >
          <div class="p-8">
            <div class="flex items-center mb-6">
              <div
                class="w-16 h-16 bg-gradient-to-r from-error-500 to-error-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg"
              >
                <FontAwesomeIcon icon="exclamation-triangle" class="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-error-800">Delete Member</h3>
                <p class="text-error-600 text-sm">This action cannot be undone</p>
              </div>
            </div>

            <div class="mb-8">
              <p class="text-primary-700 text-lg">
                Are you sure you want to remove
                <span class="font-bold text-error-700">{{
                  selectedMember?.fullName || selectedMember?.email
                }}</span>
                from your plans?
              </p>
              <p class="text-primary-600 mt-3 text-sm">
                This will remove the member from your plans. The member account will remain in the system but their subscription history with you will be deleted.
              </p>
              <div
                v-if="selectedMember?.status === 'active'"
                class="mt-4 p-4 bg-warning-50 border-l-4 border-warning-400 rounded-lg"
              >
                <div class="flex items-start">
                  <FontAwesomeIcon
                    icon="exclamation-triangle"
                    class="w-5 h-5 text-warning-600 mt-0.5 mr-3 flex-shrink-0"
                  />
                  <div>
                    <p class="text-warning-800 font-semibold text-sm">Active Subscription</p>
                    <p class="text-warning-700 text-xs mt-1">
                      This member has an active subscription and cannot be removed yet.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-4">
              <button
                @click="closeDeleteConfirmModal"
                class="px-6 py-3 text-sm font-semibold text-primary-600 bg-white border-2 border-primary-200 rounded-xl hover:bg-primary-50 hover:border-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                :disabled="isDeleting"
              >
                Cancel
              </button>
              <button
                @click="deleteMember"
                class="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-error-500 to-error-600 border border-transparent rounded-xl hover:from-error-600 hover:to-error-700 focus:outline-none focus:ring-4 focus:ring-error-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                :disabled="isDeleting || selectedMember?.status === 'active'"
              >
                <FontAwesomeIcon
                  v-if="isDeleting"
                  icon="spinner"
                  class="w-4 h-4 mr-2 animate-spin"
                />
                {{ isDeleting ? 'Removing...' : 'Remove Member' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Success/Error Toast Notification -->
    <Transition name="toast">
      <div
        v-if="showToast"
        class="fixed top-8 right-8 z-50 max-w-md bg-white rounded-2xl shadow-2xl border-2 overflow-hidden"
        :class="{
          'border-success-500': toastType === 'success',
          'border-error-500': toastType === 'error',
        }"
      >
        <div class="flex items-start p-6">
          <div
            class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-4"
            :class="{
              'bg-success-100': toastType === 'success',
              'bg-error-100': toastType === 'error',
            }"
          >
            <FontAwesomeIcon
              :icon="toastType === 'success' ? 'check-circle' : 'exclamation-triangle'"
              class="w-6 h-6"
              :class="{
                'text-success-600': toastType === 'success',
                'text-error-600': toastType === 'error',
              }"
            />
          </div>
          <div class="flex-1">
            <h4 class="text-lg font-bold text-primary-700 mb-1">{{ toastTitle }}</h4>
            <p class="text-sm text-primary-600">{{ toastMessage }}</p>
          </div>
          <button @click="showToast = false" class="ml-4 text-primary-400 hover:text-primary-600">
            <FontAwesomeIcon icon="times" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dashboardService } from '../../service/dashboardService'
import type { Member } from '../../service/dashboardService'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const route = useRoute()
const router = useRouter()

// Reactive data
const planMembers = ref<Member[]>([])
const selectedPlan = ref<{ planId: string; planName: string; memberCount: number } | null>(null)
const loading = ref(true)
const error = ref('')

// Modal states
const showMemberDetailsModal = ref(false)
const showDeleteConfirmModal = ref(false)
const selectedMember = ref<Member | null>(null)
const isDeleting = ref(false)

// Toast notification states
const showToast = ref(false)
const toastType = ref<'success' | 'error'>('success')
const toastTitle = ref('')
const toastMessage = ref('')

// Methods
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const loadPlanMembers = async () => {
  try {
    loading.value = true
    error.value = ''

    const planId = route.params.planId as string
    const planName = route.query.planName as string
    const memberCount = Number.parseInt(route.query.memberCount as string) || 0

    selectedPlan.value = { planId, planName, memberCount }

    // Get members for this specific plan
    planMembers.value = await dashboardService.getPlanMembers(planId)

    console.log('Plan members loaded:', {
      planId,
      planName,
      planMembers: planMembers.value.length,
    })
  } catch (err) {
    console.error('Error loading plan members:', err)
    error.value = 'Failed to load plan members'
  } finally {
    loading.value = false
  }
}

const viewMemberDetails = (member: Member) => {
  console.log('Viewing member details:', member)
  console.log('Payment history:', member.paymentHistory)
  console.log('Total spent:', member.totalSpent)
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
    error.value = ''

    // Call delete member API
    await dashboardService.deleteMember(selectedMember.value.id)

    // Remove member from local list
    planMembers.value = planMembers.value.filter((member) => member.id !== selectedMember.value!.id)

    // Close modals
    showDeleteConfirmModal.value = false
    showMemberDetailsModal.value = false

    const memberName = selectedMember.value.fullName || selectedMember.value.email
    selectedMember.value = null

    // Show success message
    console.log('Member removed successfully from owner plans')
    showSuccessNotification(`${memberName} has been removed from your plans successfully`)
  } catch (err: any) {
    console.error('Error removing member:', err)

    // Handle specific error messages
    if (err.response?.data?.message) {
      const errorMessage = err.response.data.message

      if (errorMessage.includes('active subscription')) {
        showErrorNotification(
          'Cannot Remove Member',
          'This member has an active subscription. Please wait for the subscription to expire before removing them.'
        )
      } else {
        showErrorNotification('Remove Failed', errorMessage)
      }
    } else {
      showErrorNotification('Remove Failed', 'Failed to remove member from your plans')
    }

    // Keep modals open to show the error
  } finally {
    isDeleting.value = false
  }
}

const goBack = () => {
  router.push('/dashboard')
}

// Notification functions
const showSuccessNotification = (message: string, title: string = 'Success') => {
  toastType.value = 'success'
  toastTitle.value = title
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

const showErrorNotification = (title: string, message: string) => {
  toastType.value = 'error'
  toastTitle.value = title
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 5000)
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

/* Toast notification transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-enter-to,
.toast-leave-from {
  transform: translateX(0);
  opacity: 1;
}
</style>
