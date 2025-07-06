import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/components/auth/LoginView.vue'
import RegisterView from '@/components/auth/RegisterView.vue'
import AuthCallback from '@/components/auth/AuthCallback.vue'
import DashboardView from '@/views/Dashboard.vue'
import { useAuthStore } from '@/stores/auth'
import Features from '../views/Features.vue'
import CreateFeature from '@/views/CreateFeature.vue'
import FeatureDetails from '@/views/FeatureDetails.vue'
import EditFeature from '@/views/EditFeature.vue'
import Plans from '../views/Plans.vue'
import CreatePlan from '../views/CreatePlan.vue'
import PlanDetails from '../views/PlanDetails.vue'
import EditPlan from '../views/EditPlan.vue'
import Profile from '../views/Profile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        requiresAuth: false,
        redirectIfAuth: true, // Redirect to dashboard if already authenticated
      },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        requiresAuth: false,
        redirectIfAuth: true, // Redirect to dashboard if already authenticated
      },
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: AuthCallback,
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/features',
      name: 'features',
      component: Features,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/features/create',
      name: 'create-feature',
      component: CreateFeature,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/features/:id',
      name: 'feature-details',
      component: FeatureDetails,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/features/:id/edit',
      name: 'edit-feature',
      component: EditFeature,
      meta: {
        requiresAuth: true,
      },
    },
    // Plans routes
    {
      path: '/plans',
      name: 'plans',
      component: Plans,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/plans/create',
      name: 'create-plan',
      component: CreatePlan,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/plans/:id',
      name: 'plan-details',
      component: PlanDetails,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/plans/:id/edit',
      name: 'edit-plan',
      component: EditPlan,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth state from localStorage
  authStore.initAuth()

  const isAuthenticated = authStore.isAuthenticated
  const requiresAuth = to.meta.requiresAuth
  const redirectIfAuth = to.meta.redirectIfAuth

  if (requiresAuth && !isAuthenticated) {
    // Route requires auth but user is not authenticated
    next('/login')
  } else if (redirectIfAuth && isAuthenticated) {
    // User is authenticated but trying to access login/register
    next('/dashboard')
  } else {
    // Allow navigation
    next()
  }
})

export default router
