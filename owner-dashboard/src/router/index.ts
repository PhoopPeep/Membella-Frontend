import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth state from localStorage
  authStore.initAuth()

  const isAuthenticated = authStore.isAuthenticated
  const requiresAuth = to.meta.requiresAuth
  const redirectIfAuth = to.meta.redirectIfAuth

  console.log('🔧 Navigation Guard Debug:', {
    to: to.name,
    path: to.path,
    fullPath: to.fullPath,
    query: to.query,
    hash: to.hash,
    isAuthenticated,
    requiresAuth,
    redirectIfAuth
  })

  // Allow reset password, test reset password, and auth callback pages without authentication
  // They have their own token verification
  if (to.name === 'reset-password' || to.name === 'test-reset-password' || to.name === 'auth-callback') {
    console.log('🔧 Allowing auth page access:', to.name)
    next()
    return
  }

  if (requiresAuth && !isAuthenticated) {
    // Route requires auth but user is not authenticated
    console.log('🔧 Redirecting to login - requires auth but not authenticated')
    next('/login')
  } else if (redirectIfAuth && isAuthenticated) {
    // User is authenticated but trying to access login/register
    console.log('🔧 Redirecting to dashboard - authenticated user accessing auth page')
    next('/dashboard')
  } else {
    // Allow navigation
    console.log('🔧 Allowing navigation')
    next()
  }
})

export default router
