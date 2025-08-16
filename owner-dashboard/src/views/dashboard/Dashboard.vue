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
          <div class="w-full h-350">
            <canvas ref="revenueChart" class="w-full h-full"></canvas>
          </div>
        </Card>

        <!-- Members by Plan -->
        <Card
          title="Members by Plan"
          subtitle="Distribution of members across plans"
          card-class="col-span-3"
        >
          <div class="space-y-4">
            <div v-for="plan in membersByPlan" :key="plan.planName" class="flex items-center">
              <div class="w-2 h-2 rounded-full bg-blue-600 mr-3"></div>
              <div class="flex-1">
                <p class="text-sm font-medium">{{ plan.planName }}</p>
                <p class="text-xs text-gray-500">{{ plan.memberCount }} members</p>
              </div>
              <div class="text-sm font-medium">{{ plan.memberCount }}</div>
            </div>

            <EmptyState
              v-if="plans.length === 0"
              title="No plans created"
              description="Create your first plan to see member distribution"
              size="sm"
              container-class="py-8"
              icon="credit-card"
            />
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { dashboardService } from '../../service/dashboardService'
import type { Plan, Member, RevenueData, DashboardStats } from '../../type'

// Import reusable components
import PageHeader from '../../components/common/PageHeader.vue'
import Card from '../../components/common/Card.vue'
import StatCard from '../../components/common/StatCard.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import LoadingSpinner from '../../components/common/LoadingSpinner.vue'

const authStore = useAuthStore()

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

    dashboardStats.value = statsData
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
