import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const MemberHomepage = () => import('@/views/MemberHomepage.vue')
const MySubscription = () => import('@/views/MySubscription.vue')
const PaymentHistory = () => import('@/views/PaymentHistory.vue')
const MemberProfile = () => import('@/views/MemberProfile.vue')
const MemberLogin = () => import('@/views/auth/MemberLogin.vue')
const MemberRegister = () => import('@/views/auth/MemberRegister.vue')
const MemberForgotPassword = () => import('@/views/auth/MemberForgotPassword.vue')
const MemberResetPassword = () => import('@/views/auth/MemberResetPassword.vue')
const MemberAuthCallback = () => import('@/components/auth/MemberAuthCallback.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/homepage',
    },
    {
      path: '/homepage',
      name: 'homepage',
      component: MemberHomepage,
      meta: {
        requiresAuth: false, // Allow guests to view homepage
      },
    },
    {
      path: '/dashboard',
      redirect: '/homepage',
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
      path: '/forgot-password',
      name: 'forgot-password',
      component: MemberForgotPassword,
      meta: {
        requiresAuth: false,
        redirectIfAuth: true,
      },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: MemberResetPassword,
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
      path: '/subscriptions',
      name: 'my-subscriptions',
      component: MySubscription,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/payments',
      name: 'payment-history',
      component: PaymentHistory,
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
      redirect: '/homepage',
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

  // Allow reset password page without authentication (it has its own token verification)
  if (to.name === 'reset-password') {
    next()
    return
  }

  if (requiresAuth && !isAuthenticated) {
    // Route requires auth but user is not authenticated
    next('/login')
  } else if (redirectIfAuth && isAuthenticated) {
    // User is authenticated but trying to access login/register
    next('/homepage')
  } else {
    // Allow navigation
    next()
  }
})

export default router
