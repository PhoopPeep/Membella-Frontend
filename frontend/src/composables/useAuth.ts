import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import type { LoginData, RegisterData } from '@/types/auth'

export const useAuth = () => {
  const router = useRouter()
  const authStore = useAuthStore()

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)

  const login = async (credentials: LoginData) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authApi.login(credentials)

      if (response.success && response.token && response.user) {
        authStore.setAuth(response.token, response.user)
        await router.push('/dashboard')
        return { success: true, message: response.message }
      }

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await authApi.register(userData)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      authStore.clearAuth()
      await router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const refreshProfile = async () => {
    try {
      const response = await authApi.getProfile()
      if (response.user) {
        authStore.updateUser(response.user)
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err)
    }
  }

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    isAuthenticated,
    user,
    login,
    register,
    logout,
    refreshProfile,
  }
}
