import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export interface User {
  owner_id: string
  org_name: string
  email: string
  description?: string
  contact_info?: string
  logo?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Watch for changes in user data and sync to localStorage
  watch(
    user,
    (newUser) => {
      if (newUser) {
        console.log('🔄 Auth store: User data changed, syncing to localStorage')
        localStorage.setItem('user', JSON.stringify(newUser))
      }
    },
    { deep: true },
  )

  // Watch for changes in token and sync to localStorage
  watch(token, (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  })

  const setAuth = (newToken: string, userData: User) => {
    console.log('🔐 Auth store: Setting auth data', {
      token: !!newToken,
      user: userData.email,
      logo: userData.logo,
    })

    token.value = newToken
    user.value = userData

    // Force sync to localStorage
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      console.log('👤 Auth store: Updating user data', userData)

      // Merge the new data with existing user data
      Object.assign(user.value, userData)

      // Force reactivity update
      user.value = { ...user.value }

      // Sync to localStorage
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  const clearAuth = () => {
    console.log('🚪 Auth store: Clearing auth data')

    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const initAuth = () => {
    console.log('🚀 Auth store: Initializing auth from localStorage')

    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        token.value = savedToken
        user.value = parsedUser

        console.log('✅ Auth store: Successfully restored auth state', {
          user: parsedUser.email,
          logo: parsedUser.logo,
        })
      } catch (error) {
        console.error('❌ Auth store: Error parsing saved user data:', error)
        clearAuth()
      }
    } else {
      console.log('ℹ️ Auth store: No saved auth data found')
    }
  }

  // Method to refresh user data from server
  const refreshUserData = async () => {
    if (!token.value) return

    try {
      console.log('🔄 Auth store: Refreshing user data from server')

      // Import here to avoid circular dependency
      const { profileService } = await import('../service/profileService')
      const response = await profileService.getProfile()

      if (response.user) {
        updateUser(response.user)
        console.log('✅ Auth store: User data refreshed successfully')
      }
    } catch (error) {
      console.error('❌ Auth store: Failed to refresh user data:', error)
    }
  }

  // Method to sync data with localStorage manually
  const syncToStorage = () => {
    if (token.value) {
      localStorage.setItem('token', token.value)
    }
    if (user.value) {
      localStorage.setItem('user', JSON.stringify(user.value))
    }
    console.log('💾 Auth store: Manually synced to localStorage')
  }

  return {
    user: computed(() => user.value),
    token: computed(() => token.value),
    isAuthenticated,
    setAuth,
    updateUser,
    clearAuth,
    initAuth,
    refreshUserData,
    syncToStorage,
  }
})
