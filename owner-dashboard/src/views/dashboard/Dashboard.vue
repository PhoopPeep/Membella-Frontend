<template>
  <div class="flex-1 gap-4 space-y-4 p-4 md:p-8 pt-6">
    <!-- Page Header -->
    <PageHeader title="Dashboard" />

    <!-- Loading State -->
    <LoadingSpinner
      v-if="loading"
      text="Loading dashboard data..."
      subtitle="Please wait while we fetch your analytics"
      full-screen
    />

    <!-- Error State -->
    <Card v-else-if="error">
      <div class="bg-red-50 border border-red-200 rounded-md p-4">
        <p class="text-red-600">{{ error }}</p>
        <button
          @click="loadDashboardData"
          class="mt-2 text-sm text-red-700 hover:text-red-900 underline"
        >
          Try again
        </button>
      </div>
    </Card>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Empty State for No Members -->
      <div v-if="totalMembers === 0 && totalRevenue === 0" class="text-center py-12">
        <EmptyState
          title="Welcome to your Dashboard!"
          description="You haven't had any members yet. Create your first plan and start attracting members to see your analytics here."
          size="lg"
          icon="users"
        >
          <template #actions>
            <router-link
              to="/plans/create"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
            >
              Create Your First Plan
            </router-link>
          </template>
        </EmptyState>
      </div>

      <!-- Dashboard Content with Data -->
      <div v-else>
        <!-- Stats Cards -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Revenue"
            :value="totalRevenue"
            description="Last 12 months"
            icon="baht-sign"
            prefix="฿"
            :format-value="(value) => Number(value).toLocaleString()"
          />

          <StatCard
            title="Total Members"
            :value="totalMembers"
            description="Active subscribers"
            icon="users"
          />

          <StatCard
            title="Active Plans"
            :value="activePlans"
            description="Available plans"
            icon="credit-card"
          />
        </div>

        <!-- Charts Section -->
        <div class="grid gap-2 md:grid-cols-2 lg:grid-cols-7 mt-4">
          <!-- Revenue Chart -->
          <Card
            title="Revenue Overview"
            subtitle="Last 12 months revenue data"
            card-class="col-span-4"
          >
            <div v-if="revenueData.length > 0" class="w-full h-350">
              <canvas ref="revenueChart" class="w-full h-full"></canvas>
            </div>
            <EmptyState
              v-else
              title="No Revenue Data"
              description="Revenue data will appear here once you have paying members"
              size="sm"
              container-class="py-8"
              icon="baht-sign"
            />
          </Card>

          <!-- Members by Plan -->
          <Card
            title="Members by Plan"
            subtitle="Distribution of members across plans"
            card-class="col-span-3"
          >
            <div v-if="membersByPlan.length > 0" class="space-y-4">
              <div
                v-for="plan in membersByPlan"
                :key="plan.planName"
                class="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                @click="viewPlanMembers(plan)"
              >
                <div class="w-2 h-2 rounded-full bg-blue-600 mr-3"></div>
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ plan.planName }}</p>
                  <p class="text-xs text-gray-500">{{ plan.memberCount }} members</p>
                </div>
                <div class="text-sm font-medium">{{ plan.memberCount }}</div>
                <FontAwesomeIcon icon="chevron-right" class="w-4 h-4 text-gray-400 ml-2" />
              </div>
            </div>
            <EmptyState
              v-else
              title="No Members Yet"
              description="Member distribution will appear here once you have subscribers"
              size="sm"
              container-class="py-8"
              icon="users"
            />
          </Card>
        </div>

        <!-- Recent Members Section -->
        <div v-if="members.length > 0" class="mt-6">
          <Card
            title="Recent Members"
            subtitle="Latest members who joined your plans"
            card-class="col-span-full"
          >
            <div class="space-y-3">
              <div
                v-for="member in members.slice(0, 5)"
                :key="member.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <FontAwesomeIcon icon="user" class="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p class="text-sm font-medium">{{ member.email }}</p>
                    <p class="text-xs text-gray-500">ID: {{ member.id }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium">{{ member.status }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(member.createdAt) }}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { dashboardService } from '../../service/dashboardService'
import type { Plan, RevenueData, DashboardStats } from '../../type'
import type { Member } from '../../service/dashboardService'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Import reusable components

const PageHeader = defineAsyncComponent(() => import('../../components/common/PageHeader.vue'))
const Card = defineAsyncComponent(() => import('../../components/common/Card.vue'))
const StatCard = defineAsyncComponent(() => import('../../components/common/StatCard.vue'))
const EmptyState = defineAsyncComponent(() => import('../../components/common/EmptyState.vue'))
const LoadingSpinner = defineAsyncComponent(() => import('../../components/common/LoadingSpinner.vue'))

const authStore = useAuthStore()
const router = useRouter()

// Reactive data
const plans = ref<Plan[]>([])
const members = ref<Member[]>([])
const revenueData = ref<RevenueData[]>([])
const membersByPlanData = ref<Array<{ planId: string; planName: string; memberCount: number }>>([])
const dashboardStats = ref<DashboardStats | null>(null)
const loading = ref(true)
const error = ref('')
const revenueChart = ref<HTMLCanvasElement>()



// Computed properties
const totalRevenue = computed(() => {
  return dashboardStats.value?.totalRevenue || 0
})

const totalMembers = computed(() => {
  return dashboardStats.value?.totalMembers || 0
})

const activePlans = computed(() => {
  return dashboardStats.value?.totalPlans || 0
})

const membersByPlan = computed(() => {
  return membersByPlanData.value || []
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

const viewPlanMembers = (plan: { planId: string; planName: string; memberCount: number }) => {
  router.push({
    name: 'plan-members',
    params: { planId: plan.planId },
    query: {
      planName: plan.planName,
      memberCount: plan.memberCount.toString()
    }
  })
}



const loadDashboardData = async () => {
  try {
    loading.value = true
    error.value = ''

    // Load all dashboard data in parallel
    const [statsData, revenueResponse, membersResponse, membersByPlanResponse] = await Promise.all([
      dashboardService.getDashboardStats(),
      dashboardService.getRevenueData(),
      dashboardService.getMembers(),
      dashboardService.getMembersByPlan(),
    ])

    dashboardStats.value = statsData as DashboardStats
    revenueData.value = revenueResponse
    members.value = membersResponse
    membersByPlanData.value = membersByPlanResponse

    console.log('Dashboard data loaded:', {
      stats: statsData,
      revenueDataPoints: revenueResponse.length,
      membersCount: membersResponse.length,
      planDistribution: membersByPlanResponse.length,
    })
  } catch (err) {
    console.error('Error loading dashboard data:', err)
    error.value = 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

const initializeChart = async () => {
  await nextTick()

  if (!revenueChart.value) return

  try {
    // Import Chart.js dynamically
    const { Chart, registerables } = await import('chart.js')
    Chart.register(...registerables)

    const ctx = revenueChart.value.getContext('2d')
    if (!ctx) return

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: revenueData.value.map((item) => item.month),
        datasets: [
          {
            label: 'Revenue',
            data: revenueData.value.map((item) => item.revenue),
            backgroundColor: '#3b82f6',
            borderColor: '#3b82f6',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return '' + value.toLocaleString()
              },
            },
          },
        },
      },
    })
  } catch (chartError) {
    console.error('Error initializing chart:', chartError)
  }
}

// Lifecycle
onMounted(async () => {
  await loadDashboardData()
  await initializeChart()
})
</script>
