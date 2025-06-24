import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/components/auth/LoginView.vue'
import RegisterView from '@/components/auth/RegisterView.vue'
import DashboardView from '@/views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        requiresAuth: false,
      }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        requiresAuth: false,
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        requiresAuth: true,
      }
    }
  ],
})

export default router
