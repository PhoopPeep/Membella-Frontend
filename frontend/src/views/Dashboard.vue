<template>
  <div class="flex-1 gap-4 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center justify-between space-y-2">
      <div class="flex items-center space-x-2">
        <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
      <p class="text-gray-600">Loading dashboard data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <p class="text-red-600">{{ error }}</p>
      <button
        @click="loadDashboardData"
        class="mt-2 text-sm text-red-700 hover:text-red-900 underline"
      >
        Try again
      </button>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Stats Cards -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-lg border bg-white shadow-sm">
          <div class="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 class="tracking-tight text-sm font-medium">Total Revenue</h3>
            <DollarSign class="h-4 w-4 text-gray-500" />
          </div>
          <div class="p-6 pt-0">
            <div class="text-2xl font-bold">${{ totalRevenue.toLocaleString() }}</div>
            <p class="text-xs text-gray-500">Last 12 months</p>
          </div>
        </div>

        <div class="rounded-lg border bg-white shadow-sm">
          <div class="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 class="tracking-tight text-sm font-medium">Total Members</h3>
            <Users class="h-4 w-4 text-gray-500" />
          </div>
          <div class="p-6 pt-0">
            <div class="text-2xl font-bold">{{ totalMembers }}</div>
            <p class="text-xs text-gray-500">Active subscribers</p>
          </div>
        </div>

        <div class="rounded-lg border bg-white shadow-sm">
          <div class="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 class="tracking-tight text-sm font-medium">Active Plans</h3>
            <CreditCard class="h-4 w-4 text-gray-500" />
          </div>
          <div class="p-6 pt-0">
            <div class="text-2xl font-bold">{{ activePlans }}</div>
            <p class="text-xs text-gray-500">Available plans</p>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid gap-2 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <div class="col-span-4 rounded-lg border bg-white shadow-sm">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold">Revenue Overview</h3>
            <p class="text-sm text-gray-500">Last 12 months revenue data</p>
          </div>
          <div class="p-6 pt-2">
            <div class="w-full h-350">
              <canvas ref="revenueChart" class="w-full h-full"></canvas>
            </div>
          </div>
        </div>

        <div class="col-span-3 rounded-lg border bg-white shadow-sm">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold">Members by Plan</h3>
            <p class="text-sm text-gray-500">Distribution of members across plans</p>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div v-for="plan in membersByPlan" :key="plan.planName" class="flex items-center">
                <div class="w-2 h-2 rounded-full bg-blue-600 mr-3"></div>
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ plan.planName }}</p>
                  <p class="text-xs text-gray-500">{{ plan.memberCount }} members</p>
                </div>
                <div class="text-sm font-medium">{{ plan.memberCount }}</div>
              </div>
              <div v-if="plans.length === 0" class="text-sm text-gray-500">
                No plans created yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Users, DollarSign, CreditCard, TrendingUp } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { dashboardService } from '../service/dashboardService'
import type { Plan, Member, RevenueData, DashboardStats } from '../type'

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

// const totalFeatures = computed(() => {
//   return dashboardStats.value?.totalFeatures || 0
// })

const growthPercentage = computed(() => {
  return dashboardStats.value?.growthPercentage || 0
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

    // Don't fallback to mock data, show the error
    // This way you can see what's actually happening with the API
  } finally {
    loading.value = false
  }
}

const loadMockData = () => {
  // Generate mock revenue data for the last 12 months
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  revenueData.value = months.map((month) => ({
    month,
    revenue: Math.floor(Math.random() * 10000) + 1000,
  }))

  // Mock plans and members data
  plans.value = []
  members.value = []
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
                return '$' + value.toLocaleString()
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
