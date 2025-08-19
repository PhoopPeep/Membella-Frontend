import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const MemberDashboard = () => import('@/views/MemberDashboard.vue')
const BrowsePlans = () => import('@/views/BrowsePlans.vue')
const MySubscription = () => import('@/views/MySubscription.vue')
const MemberProfile = () => import('@/views/MemberProfile.vue')
const MemberLogin = () => import('@/views/auth/MemberLogin.vue')
const MemberRegister = () => import('@/views/auth/MemberRegister.vue')
const MemberAuthCallback = () => import('@/components/auth/MemberAuthCallback.vue')

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
      component: MemberLogin,
      meta: {
        requiresAuth: false,
        redirectIfAuth: true,
      },
    },
    {
      path: '/register',
      name: 'register',
      component: MemberRegister,
      meta: {
        requiresAuth: false,
        redirectIfAuth: true,
      },
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: MemberAuthCallback,
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/browse',
      name: 'browse-plans',
      component: BrowsePlans,
      meta: {
        requiresAuth: false, // Allow guests to browse
      },
    },
    {
      path: '/subscription',
      name: 'my-subscription',
      component: MySubscription,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/profile',
      name: 'member-profile',
      component: MemberProfile,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/browse',
    },
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth state
  authStore.initAuth()

  const isAuthenticated = authStore.isAuthenticated
  const requiresAuth = to.meta.requiresAuth
  const redirectIfAuth = to.meta.redirectIfAuth

  if (requiresAuth && !isAuthenticated) {
    // Route requires auth but user is not authenticated
    next('/login')
  } else if (redirectIfAuth && isAuthenticated) {
    // User is authenticated but trying to access login/register
    next('/browse')
  } else {
    // Allow navigation
    next()
  }
})

export default router
