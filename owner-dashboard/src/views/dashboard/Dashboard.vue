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
            Welcome Back! 👋
          </h1>
          <p class="text-lg text-white/90 font-medium max-w-2xl mx-auto">
            Monitor your business performance and track your success
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 md:px-8 -mt-8 relative z-10">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="relative">
            <div
              class="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mx-auto mb-6"
            ></div>
          </div>
          <h3 class="text-lg font-bold text-primary-700 mb-2">Loading Dashboard</h3>
          <p class="text-primary-600 text-sm">Fetching your business analytics...</p>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-white/80 backdrop-blur-sm rounded-3xl border border-error-200 shadow-xl p-8"
      >
        <div class="text-center max-w-md mx-auto">
          <div
            class="w-20 h-20 bg-gradient-to-r from-error-500 to-error-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <FontAwesomeIcon icon="exclamation-triangle" class="w-10 h-10 text-white" />
          </div>
          <h3 class="text-xl font-bold text-error-800 mb-3">Oops! Something went wrong</h3>
          <p class="text-error-600 mb-6 font-medium text-sm">{{ error }}</p>
          <button
            @click="loadDashboardData"
            class="bg-gradient-to-r from-error-500 to-error-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-error-600 hover:to-error-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FontAwesomeIcon icon="refresh" class="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="space-y-8 pb-8">
        <!-- Empty State for No Plans -->
        <div
          v-if="activePlans === 0"
          class="bg-white/80 backdrop-blur-sm rounded-3xl border border-primary-200 shadow-xl p-12"
        >
          <div class="text-center max-w-lg mx-auto">
            <h2 class="text-2xl font-black text-primary-700 mb-4">Welcome to your Dashboard! 🚀</h2>
            <p class="text-base text-primary-600 mb-8 font-medium">
              You haven't created any plans yet. Create your first plan and start attracting members
              to see your analytics here.
            </p>
            <router-link
              to="/plans/create"
              class="inline-flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-semibold text-base hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FontAwesomeIcon icon="plus" class="w-5 h-5 mr-3" />
              Create Your First Plan
            </router-link>
          </div>
        </div>

        <!-- Dashboard Content with Data -->
        <div v-else class="space-y-8">
          <!-- Stats Cards -->
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

          <!-- No Members State (when plans exist but no members) -->
          <div
            v-if="totalMembers === 0 && totalRevenue === 0 && activePlans > 0"
            class="bg-white/80 backdrop-blur-sm rounded-3xl border border-primary-200 shadow-xl p-12"
          >
            <div class="text-center max-w-lg mx-auto">
              <h2 class="text-2xl font-black text-primary-700 mb-4">Great! You have {{ activePlans }} plan(s) 🎉</h2>
              <p class="text-base text-primary-600 mb-8 font-medium">
                Your plans are ready! Now you need to attract members to see analytics and revenue data here.
                Share your plans with potential members to get started.
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <router-link
                  to="/plans"
                  class="inline-flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-xl font-semibold text-base hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FontAwesomeIcon icon="eye" class="w-5 h-5 mr-3" />
                  View Your Plans
                </router-link>
                <router-link
                  to="/plans/create"
                  class="inline-flex items-center justify-center bg-gradient-to-r from-secondary-500 to-accent-500 text-white px-6 py-3 rounded-xl font-semibold text-base hover:from-secondary-700 hover:to-accent-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FontAwesomeIcon icon="plus" class="w-5 h-5 mr-3" />
                  Create More Plans
                </router-link>
              </div>
            </div>
          </div>

          <!-- Charts Section (only show when there are members or revenue) -->
          <div v-if="totalMembers > 0 || totalRevenue > 0" class="grid gap-8 lg:grid-cols-3">
            <!-- Revenue Chart -->
            <Card
              title="📈 Revenue Trend"
              subtitle="Monthly revenue data for the last 12 months"
              card-class="lg:col-span-2"
              :hoverable="true"
            >
              <div
                v-if="revenueData.length > 0"
                class="w-full h-80 p-4 bg-gradient-to-br from-primary-50/30 to-secondary-50/20 rounded-2xl"
              >
                <canvas ref="revenueChart" class="w-full h-full"></canvas>
              </div>
              <div v-else class="text-center py-16">
                <div
                  class="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <FontAwesomeIcon icon="chart-line" class="w-10 h-10 text-white" />
                </div>
                <h3 class="text-xl font-bold text-primary-700 mb-2">No Revenue Data Yet</h3>
                <p class="text-primary-600 font-medium">
                  Revenue data will appear here once you have paying members
                </p>
              </div>
            </Card>

            <!-- Members by Plan -->
            <Card
              title="👥 Members by Plan"
              subtitle="Distribution of members across plans"
              :hoverable="true"
            >
              <div v-if="membersByPlan.length > 0" class="space-y-4">
                <div
                  v-for="(plan, index) in membersByPlan"
                  :key="plan.planName"
                  class="flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50/50 p-4 rounded-2xl transition-all duration-300 group transform hover:scale-105 border border-transparent hover:border-primary-200 hover:shadow-lg"
                  @click="viewPlanMembers(plan)"
                >
                  <div
                    :class="['w-4 h-4 rounded-full mr-4 shadow-md', getRandomColor(index)]"
                  ></div>
                  <div class="flex-1">
                    <p class="text-base font-bold text-primary-700 group-hover:text-primary-800">
                      {{ plan.planName }}
                    </p>
                    <p class="text-sm text-neutral-500 font-semibold">
                      {{ plan.memberCount }} members
                    </p>
                  </div>
                  <div class="text-lg font-black text-primary-600 mr-2">{{ plan.memberCount }}</div>
                  <FontAwesomeIcon
                    icon="chevron-right"
                    class="w-5 h-5 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-2 transition-all duration-300"
                  />
                </div>
              </div>
              <div v-else class="text-center py-12">
                <div
                  class="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <FontAwesomeIcon icon="users" class="w-8 h-8 text-white" />
                </div>
                <h3 class="text-lg font-bold text-primary-700 mb-2">No Members Yet</h3>
                <p class="text-primary-600 font-medium">
                  Member distribution will appear here once you have subscribers
                </p>
              </div>
            </Card>
          </div>

          <!-- Recent Members Section (only show when there are members) -->
          <div v-if="members.length > 0">
            <Card
              title="🆕 Recent Members"
              subtitle="Latest members who joined your plans"
              :hoverable="true"
            >
              <div class="space-y-4">
                <div
                  v-for="member in members.slice(0, 5)"
                  :key="member.id"
                  class="flex items-center justify-between p-6 bg-gradient-to-r from-primary-50/40 via-white/60 to-secondary-50/30 rounded-2xl border border-primary-200/50 hover:shadow-lg hover:scale-105 transition-all duration-300 group"
                >
                  <div class="flex items-center space-x-4">
                    <div
                      class="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-glow group-hover:scale-110 transition-all duration-300"
                    >
                      <FontAwesomeIcon icon="user" class="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p
                        class="text-lg font-bold text-primary-700 group-hover:text-primary-800 transition-colors"
                      >
                        {{ member.email }}
                      </p>
                      <p class="text-sm text-neutral-500 font-semibold">
                        Member ID: {{ member.id }}
                      </p>
                    </div>
                  </div>
                  <div class="text-right space-y-2">
                    <div class="flex justify-end">
                      <span
                        class="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-md"
                        :class="{
                          'bg-gradient-to-r from-success-100 to-success-200 text-success-800': member.status === 'active',
                          'bg-gradient-to-r from-error-100 to-error-200 text-error-800': member.status === 'cancelled',
                          'bg-gradient-to-r from-warning-100 to-warning-200 text-warning-800': member.status === 'inactive'
                        }"
                      >
                        <div
                          class="w-2 h-2 rounded-full mr-2"
                          :class="{
                            'bg-success-500 animate-pulse': member.status === 'active',
                            'bg-error-500': member.status === 'cancelled',
                            'bg-warning-500': member.status === 'inactive'
                          }"
                        ></div>
                        {{ member.status }}
                      </span>
                    </div>
                    <p class="text-sm text-neutral-500 font-semibold">
                      {{ formatDate(member.createdAt) }}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { dashboardService } from '../../service/dashboardService'
import type { RevenueData, DashboardStats } from '../../types/dashboard'
import type { Member } from '../../types/member'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { Chart } from 'chart.js'

// Define component name
defineOptions({
  name: 'DashboardView',
})

// Import reusable components
const Card = defineAsyncComponent(() => import('../../components/common/Card.vue'))
const StatCard = defineAsyncComponent(() => import('../../components/common/StatCard.vue'))

const router = useRouter()

// Reactive data
const members = ref<Member[]>([])
const revenueData = ref<RevenueData[]>([])
const membersByPlanData = ref<Array<{ planId: string; planName: string; memberCount: number }>>([])
const dashboardStats = ref<DashboardStats | null>(null)
const loading = ref(true)
const error = ref('')
const revenueChart = ref<HTMLCanvasElement>()
const chartInstance = ref<Chart | null>(null)

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
    day: 'numeric',
  })
}

const viewPlanMembers = (plan: { planId: string; planName: string; memberCount: number }) => {
  router.push({
    name: 'plan-members',
    params: { planId: plan.planId },
    query: {
      planName: plan.planName,
      memberCount: plan.memberCount.toString(),
    },
  })
}

const getRandomColor = (index: number): string => {
  const colors = [
    'bg-gradient-to-r from-primary-500 to-primary-600',
    'bg-gradient-to-r from-secondary-500 to-secondary-600',
    'bg-gradient-to-r from-success-500 to-success-600',
    'bg-gradient-to-r from-warning-500 to-warning-600',
    'bg-gradient-to-r from-error-500 to-error-600',
    'bg-gradient-to-r from-accent-500 to-accent-600',
  ]
  return colors[index % colors.length]
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

    // Destroy existing chart if it exists
    if (chartInstance.value) {
      chartInstance.value.destroy()
    }

    chartInstance.value = new Chart(ctx, {
      type: 'line',
      data: {
        labels: revenueData.value.map((item) => item.month),
        datasets: [
          {
            label: 'Revenue (฿)',
            data: revenueData.value.map((item) => item.revenue),
            borderColor: '#007BFF',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            borderWidth: 4,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#007BFF',
            pointBorderColor: '#FFD700',
            pointBorderWidth: 3,
            pointRadius: 8,
            pointHoverRadius: 10,
            pointHoverBackgroundColor: '#FFD700',
            pointHoverBorderColor: '#007BFF',
            pointHoverBorderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
                weight: 'bold',
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 123, 255, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#FFD700',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: function (context) {
                return `Revenue: ฿${context.parsed.y.toLocaleString()}`
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 11,
              },
              color: '#6b7280',
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(107, 114, 128, 0.1)',
            },
            ticks: {
              font: {
                size: 11,
              },
              color: '#6b7280',
              callback: function (value) {
                return '฿' + value.toLocaleString()
              },
            },
          },
        },
        elements: {
          point: {
            hoverBackgroundColor: '#2563eb',
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

onUnmounted(() => {
  // Clean up chart instance to prevent memory leaks
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
})
</script>
