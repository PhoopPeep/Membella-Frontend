import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();

  // Initialize auth state
  authStore.initAuth();

  const requiresAuth = to.meta.requiresAuth;
  const redirectIfAuth = to.meta.redirectIfAuth;
  const isAuthenticated = authStore.isAuthenticated;

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (redirectIfAuth && isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
};
