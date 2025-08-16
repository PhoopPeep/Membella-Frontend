import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface MemberUser {
  id: string
  email: string
  fullName: string
  phone?: string
  role: 'member'
  createdAt?: string
  updatedAt?: string
}

export const useAuthStore = defineStore('memberAuth', () => {
  const user = ref<MemberUser | null>(null)
  const token = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const setAuth = (newToken: string, userData: MemberUser) => {
    token.value = newToken
    user.value = userData
    localStorage.setItem('member_token', newToken)
    localStorage.setItem('member_user', JSON.stringify(userData))
  }

  const updateUser = (userData: MemberUser) => {
    user.value = userData
    localStorage.setItem('member_user', JSON.stringify(userData))
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('member_token')
    localStorage.removeItem('member_user')
  }

  const initAuth = () => {
    const savedToken = localStorage.getItem('member_token')
    const savedUser = localStorage.getItem('member_user')

    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('Error parsing saved member data:', error)
        clearAuth()
      }
    }
  }

  return {
    user: computed(() => user.value),
    token: computed(() => token.value),
    isAuthenticated,
    setAuth,
    updateUser,
    clearAuth,
    initAuth,
  }
})
