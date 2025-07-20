import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/components/auth/LoginView.vue'),
    meta: { requiresAuth: false, redirectIfAuth: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/components/auth/RegisterView.vue'),
    meta: { requiresAuth: false, redirectIfAuth: true },
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('@/components/auth/AuthCallback.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/features',
    name: 'features',
    component: () => import('@/views/features/Features.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/features/create',
    name: 'create-feature',
    component: () => import('@/views/features/CreateFeature.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/features/:id',
    name: 'feature-details',
    component: () => import('@/views/features/FeatureDetails.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/features/:id/edit',
    name: 'edit-feature',
    component: () => import('@/views/features/EditFeature.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/plans',
    name: 'plans',
    component: () => import('@/views/plans/Plans.vue'),
  },
  {
    path: '/plans/create',
    name: 'create-plan',
    component: () => import('@/views/plans/CreatePlan.vue'),
  },
  {
    path: '/plans/:id',
    name: 'plans-details',
    component: () => import('@/views/plans/PlanDetails.vue'),
  },
  {
    path: '/plans/:id/edit',
    name: 'plans-edit',
    component: () => import('@/views/plans/EditPlan.vue'),
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/dashboard/Profile.vue'),
    meta: { requireAuth: true },
  },
]
