import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const setAuth = (newToken: string, userData: User) => {
    token.value = newToken;
    user.value = userData;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const updateUser = (userData: User) => {
    user.value = userData;
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const initAuth = () => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        token.value = savedToken;
        user.value = JSON.parse(savedUser);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        clearAuth();
      }
    }
  };

  // Add refreshUserData method
  const refreshUserData = async () => {
    try {
      const { authApi } = await import('@/api/auth');
      const response = await authApi.getProfile();
      if (response.user) {
        updateUser(response.user);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  return {
    user: computed(() => user.value),
    token: computed(() => token.value),
    isAuthenticated,
    setAuth,
    updateUser,
    clearAuth,
    initAuth,
    refreshUserData,
  };
});
