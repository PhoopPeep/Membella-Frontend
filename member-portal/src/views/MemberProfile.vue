<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/20">
    <!-- Hero Header Section -->
    <div
      class="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 px-6 py-16 md:px-8"
    >
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div
        class="absolute top-0 right-0 w-64 h-64 bg-secondary-400/20 rounded-full -translate-y-32 translate-x-32"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-48 h-48 bg-primary-300/20 rounded-full translate-y-24 -translate-x-24"
      ></div>

      <div class="relative max-w-4xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
          My Profile 👤
        </h1>
        <p class="text-xl text-white/90 font-medium max-w-2xl mx-auto">
          Manage your account information and preferences
        </p>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10 pb-12">
      <!-- Page Header -->
      <div class="mb-8 mt-8">
        <div class="text-center">
        </div>
      </div>

      <!-- Profile Card -->
      <div class="bg-gradient-to-br from-white to-primary-50/20 rounded-2xl shadow-soft border border-primary-200 overflow-hidden">
        <div class="p-8">
          <!-- Profile Header -->
          <div class="flex items-center space-x-6 mb-8 pb-8 border-b border-primary-200">
            <div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon="user" class="w-10 h-10 text-white" />
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-primary-700 mb-2">{{ authStore.user?.fullName }}</h2>
              <p class="text-lg text-primary-600 mb-1">{{ authStore.user?.email }}</p>
              <p class="text-sm text-primary-500 flex items-center">
                <FontAwesomeIcon icon="calendar" class="w-4 h-4 mr-2" />
                Member since {{ formatDate(authStore.user?.createdAt) }}
              </p>
            </div>
            <button
              @click="toggleEdit"
              class="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg flex items-center space-x-2"
            >
              <FontAwesomeIcon :icon="isEditing ? 'save' : 'edit'" class="w-5 h-5" />
              <span>{{ isEditing ? 'Save' : 'Edit' }}</span>
            </button>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-6 p-4 bg-gradient-to-r from-error-50 to-error-100 border border-error-200 rounded-xl">
            <div class="flex items-center space-x-3">
              <FontAwesomeIcon icon="exclamation-triangle" class="w-5 h-5 text-error-600" />
              <p class="text-sm font-semibold text-error-700">{{ errorMessage }}</p>
            </div>
          </div>

          <!-- Success Message -->
          <div
            v-if="successMessage"
            class="mb-6 p-4 bg-gradient-to-r from-success-50 to-success-100 border border-success-200 rounded-xl"
          >
            <div class="flex items-center space-x-3">
              <FontAwesomeIcon icon="check-circle" class="w-5 h-5 text-success-600" />
              <p class="text-sm font-semibold text-success-700">{{ successMessage }}</p>
            </div>
          </div>

          <!-- Profile Form -->
          <form @submit.prevent="handleSave" class="space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Full Name -->
              <div class="space-y-3">
                <label for="fullName" class="text-sm font-semibold text-primary-700 flex items-center">
                  <FontAwesomeIcon icon="user" class="w-4 h-4 mr-2" />
                  Full Name
                </label>
                <input
                  id="fullName"
                  v-model="profileForm.fullName"
                  type="text"
                  :disabled="!isEditing || isLoading"
                  class="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  :class="{ 'bg-primary-50': !isEditing, 'bg-white': isEditing }"
                />
              </div>

              <!-- Email (Read Only) -->
              <div class="space-y-3">
                <label for="email" class="text-sm font-semibold text-primary-700 flex items-center">
                  <FontAwesomeIcon icon="envelope" class="w-4 h-4 mr-2" />
                  Email
                </label>
                <input
                  id="email"
                  :value="authStore.user?.email"
                  type="email"
                  disabled
                  class="w-full px-4 py-3 border border-primary-200 rounded-xl bg-primary-50 text-primary-600 font-mono"
                />
                <p class="text-xs text-primary-500 flex items-center">
                  <FontAwesomeIcon icon="info-circle" class="w-3 h-3 mr-1" />
                  Email cannot be changed for security reasons
                </p>
              </div>


              <!-- Member ID (Read only) -->
              <div class="space-y-3">
                <label for="memberId" class="text-sm font-semibold text-primary-700 flex items-center">
                  <FontAwesomeIcon icon="id-card" class="w-4 h-4 mr-2" />
                  Member ID
                </label>
                <input
                  id="memberId"
                  :value="authStore.user?.id"
                  type="text"
                  disabled
                  class="w-full px-4 py-3 border border-primary-200 rounded-xl bg-primary-50 text-primary-600 font-mono"
                />
              </div>
            </div>

            <!-- Action Buttons (only shown when editing) -->
            <div v-if="isEditing" class="flex space-x-4 pt-8 border-t border-primary-200">
              <button
                type="submit"
                :disabled="isLoading"
                class="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div v-if="isLoading" class="flex items-center space-x-3">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
                <span v-else class="flex items-center space-x-3">
                  <FontAwesomeIcon icon="save" class="w-5 h-5" />
                  <span>Save Changes</span>
                </span>
              </button>
              <button
                type="button"
                @click="cancelEdit"
                :disabled="isLoading"
                class="px-8 py-4 bg-gradient-to-r from-neutral-200 to-neutral-300 text-neutral-700 rounded-xl font-semibold hover:from-neutral-300 hover:to-neutral-400 transition-all duration-200 shadow-lg flex items-center space-x-3"
              >
                <FontAwesomeIcon icon="times" class="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Account Settings -->
      <div class="mt-8 bg-gradient-to-br from-white to-secondary-50/20 rounded-2xl shadow-soft border border-secondary-200 overflow-hidden">
        <div class="p-8">
          <div class="flex items-center space-x-3 mb-8">
            <div class="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon="cog" class="w-5 h-5 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-secondary-700">Account Settings</h3>
          </div>

          <div class="space-y-6">
            <!-- Change Password -->
            <div class="flex items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon="key" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-primary-700">Password</h4>
                  <p class="text-sm text-primary-600">Change your account password</p>
                </div>
              </div>
              <button
                @click="openChangePasswordModal"
                class="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg flex items-center space-x-2"
              >
                <FontAwesomeIcon icon="edit" class="w-4 h-4" />
                <span>Change Password</span>
              </button>
            </div>

            <!-- Logout -->
            <div class="flex items-center justify-between p-6 bg-gradient-to-r from-error-50 to-error-100 rounded-xl border border-error-200">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-br from-error-500 to-error-600 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon="sign-out-alt" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-error-700">Sign Out</h4>
                  <p class="text-sm text-error-600">Sign out from your account</p>
                </div>
              </div>
              <button
                @click="handleLogout"
                class="px-6 py-3 bg-gradient-to-r from-error-500 to-error-600 text-white rounded-xl font-semibold hover:from-error-600 hover:to-error-700 transition-all duration-200 shadow-lg flex items-center space-x-2"
              >
                <FontAwesomeIcon icon="sign-out-alt" class="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Change Password Modal -->
      <div
        v-if="showChangePasswordModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center"
        @click.self="closeChangePasswordModal"
      >
        <div class="relative top-20 mx-auto p-8 border w-11/12 max-w-md shadow-2xl rounded-2xl bg-white">
          <div class="mb-8">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon="key" class="w-5 h-5 text-white" />
              </div>
              <h3 class="text-2xl font-bold text-primary-700">Change Password</h3>
            </div>
            <p class="text-primary-600">Enter your current password and choose a new one</p>
          </div>

          <!-- Password Change Error -->
          <div
            v-if="passwordChangeError"
            class="mb-6 p-4 bg-gradient-to-r from-error-50 to-error-100 border border-error-200 rounded-xl"
          >
            <div class="flex items-center space-x-3">
              <FontAwesomeIcon icon="exclamation-triangle" class="w-5 h-5 text-error-600" />
              <p class="text-sm font-semibold text-error-700">{{ passwordChangeError }}</p>
            </div>
          </div>

          <!-- Password Change Success -->
          <div
            v-if="passwordChangeSuccess"
            class="mb-6 p-4 bg-gradient-to-r from-success-50 to-success-100 border border-success-200 rounded-xl"
          >
            <div class="flex items-center space-x-3">
              <FontAwesomeIcon icon="check-circle" class="w-5 h-5 text-success-600" />
              <p class="text-sm font-semibold text-success-700">{{ passwordChangeSuccess }}</p>
            </div>
          </div>

          <form @submit.prevent="handleChangePassword" class="space-y-6">
            <!-- Current Password -->
            <div class="space-y-3">
              <label for="currentPassword" class="text-sm font-semibold text-primary-700 flex items-center">
                <FontAwesomeIcon icon="lock" class="w-4 h-4 mr-2" />
                Current Password
              </label>
              <div class="relative">
                <input
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  :disabled="isChangingPassword"
                  class="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 pr-12"
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  @click="showCurrentPassword = !showCurrentPassword"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-primary-400 hover:text-primary-600"
                  :disabled="isChangingPassword"
                >
                  <FontAwesomeIcon
                    :icon="showCurrentPassword ? 'eye-slash' : 'eye'"
                    class="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            <!-- New Password -->
            <div class="space-y-3">
              <label for="newPassword" class="text-sm font-semibold text-primary-700 flex items-center">
                <FontAwesomeIcon icon="key" class="w-4 h-4 mr-2" />
                New Password
              </label>
              <div class="relative">
                <input
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  :disabled="isChangingPassword"
                  class="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 pr-12"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-primary-400 hover:text-primary-600"
                  :disabled="isChangingPassword"
                >
                  <FontAwesomeIcon :icon="showNewPassword ? 'eye-slash' : 'eye'" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Confirm New Password -->
            <div class="space-y-3">
              <label for="confirmPassword" class="text-sm font-semibold text-primary-700 flex items-center">
                <FontAwesomeIcon icon="check-double" class="w-4 h-4 mr-2" />
                Confirm New Password
              </label>
              <div class="relative">
                <input
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :disabled="isChangingPassword"
                  class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 pr-12"
                  :class="passwordForm.confirmPassword && !passwordsMatch ? 'border-error-300 focus:ring-error-500' : 'border-primary-200'"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-primary-400 hover:text-primary-600"
                  :disabled="isChangingPassword"
                >
                  <FontAwesomeIcon
                    :icon="showConfirmPassword ? 'eye-slash' : 'eye'"
                    class="w-5 h-5"
                  />
                </button>
              </div>
              <div
                v-if="passwordForm.confirmPassword && !passwordsMatch"
                class="text-sm text-error-600 flex items-center space-x-2"
              >
                <FontAwesomeIcon icon="exclamation-circle" class="w-4 h-4" />
                <span>Passwords do not match</span>
              </div>
            </div>

            <!-- Password Requirements -->
            <div class="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200">
              <p class="text-sm font-semibold text-primary-700 mb-3">Password Requirements:</p>
              <ul class="space-y-2">
                <li class="flex items-center space-x-3" :class="passwordRequirements.length ? 'text-success-600' : 'text-primary-600'">
                  <FontAwesomeIcon
                    :icon="passwordRequirements.length ? 'check-circle' : 'circle'"
                    class="w-4 h-4"
                  />
                  <span class="text-sm">Be at least 8 characters long</span>
                </li>
              </ul>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-4 pt-6">
              <button
                type="button"
                @click="closeChangePasswordModal"
                :disabled="isChangingPassword"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-neutral-200 to-neutral-300 text-neutral-700 rounded-xl font-semibold hover:from-neutral-300 hover:to-neutral-400 transition-all duration-200 shadow-lg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isChangingPassword || !isPasswordFormValid"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div v-if="isChangingPassword" class="flex items-center justify-center space-x-3">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Changing...</span>
                </div>
                <span v-else class="flex items-center justify-center space-x-3">
                  <FontAwesomeIcon icon="key" class="w-5 h-5" />
                  <span>Change Password</span>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Logout Confirmation Modal -->
      <div
        v-if="showLogoutModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center"
      >
        <div class="relative top-20 mx-auto p-8 border w-11/12 max-w-md shadow-2xl rounded-2xl bg-white">
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-error-500 to-error-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FontAwesomeIcon icon="sign-out-alt" class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold text-error-700 mb-3">Confirm Logout</h3>
            <p class="text-error-600 mb-8">Are you sure you want to sign out from your account?</p>
            <div class="flex space-x-4">
              <button
                @click="cancelLogout"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-neutral-200 to-neutral-300 text-neutral-700 rounded-xl font-semibold hover:from-neutral-300 hover:to-neutral-400 transition-all duration-200 shadow-lg"
              >
                Cancel
              </button>
              <button
                @click="confirmLogout"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-error-500 to-error-600 text-white rounded-xl font-semibold hover:from-error-600 hover:to-error-700 transition-all duration-200 shadow-lg flex items-center justify-center space-x-3"
              >
                <FontAwesomeIcon icon="sign-out-alt" class="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { memberApi } from '../api/member'

const router = useRouter()
const authStore = useAuthStore()

const isEditing = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showLogoutModal = ref(false)

// Change Password State
const showChangePasswordModal = ref(false)
const isChangingPassword = ref(false)
const passwordChangeError = ref('')
const passwordChangeSuccess = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const profileForm = reactive({
  fullName: '',
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const originalForm = reactive({
  fullName: '',
})

// Password validation computed properties
const passwordRequirements = computed(() => ({
  length: passwordForm.newPassword.length >= 8,
}))

const passwordsMatch = computed(() => {
  return passwordForm.newPassword === passwordForm.confirmPassword
})

const isPasswordFormValid = computed(() => {
  return (
    passwordForm.currentPassword &&
    passwordForm.newPassword &&
    passwordForm.confirmPassword &&
    passwordRequirements.value.length &&
    passwordsMatch.value &&
    passwordForm.currentPassword !== passwordForm.newPassword
  )
})

const initializeForm = () => {
  const user = authStore.user
  if (user) {
    profileForm.fullName = user.fullName || ''

    // Save original values
    originalForm.fullName = profileForm.fullName
  }
}

const toggleEdit = () => {
  if (isEditing.value) {
    handleSave()
  } else {
    isEditing.value = true
  }
}

const handleSave = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // Validation
    if (!profileForm.fullName.trim()) {
      errorMessage.value = 'Full name is required'
      return
    }


    // Call API to update profile
    console.log('Updating profile:', profileForm)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update auth store (mockup)
    const updatedUser = {
      ...authStore.user!,
      fullName: profileForm.fullName.trim(),
    }
    authStore.updateUser(updatedUser)

    successMessage.value = 'Profile updated successfully!'
    isEditing.value = false

    // Update original form values
    originalForm.fullName = profileForm.fullName
  } catch (error: unknown) {
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to update profile'
    }
  } finally {
    isLoading.value = false
  }
}

const cancelEdit = () => {
  // Restore original values
  profileForm.fullName = originalForm.fullName

  isEditing.value = false
  errorMessage.value = ''
}

// Change Password Functions
const openChangePasswordModal = () => {
  showChangePasswordModal.value = true
  passwordChangeError.value = ''
  passwordChangeSuccess.value = ''

  // Reset form
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''

  // Reset visibility
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

const closeChangePasswordModal = () => {
  showChangePasswordModal.value = false
  isChangingPassword.value = false
  passwordChangeError.value = ''
  passwordChangeSuccess.value = ''

  // Reset form
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

const handleChangePassword = async () => {
  try {
    isChangingPassword.value = true
    passwordChangeError.value = ''
    passwordChangeSuccess.value = ''

    // Additional validation
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      passwordChangeError.value = 'New password must be different from current password'
      return
    }

    if (!isPasswordFormValid.value) {
      passwordChangeError.value = 'Please ensure all password requirements are met'
      return
    }

    console.log('Attempting to change password...')

    const result = await memberApi.changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword,
    )

    if (result.success) {
      passwordChangeSuccess.value = result.message || 'Password changed successfully!'

      // Clear form after success
      setTimeout(() => {
        closeChangePasswordModal()
      }, 2000)
    } else {
      passwordChangeError.value = result.message || 'Failed to change password'
    }
  } catch (error: unknown) {
    console.error('Password change error:', error)

    if (error instanceof Error) {
      passwordChangeError.value = error.message
    } else {
      passwordChangeError.value = 'An unexpected error occurred while changing password'
    }
  } finally {
    isChangingPassword.value = false
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Recently'
  return new Date(dateString).toLocaleDateString('en-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const handleLogout = () => {
  showLogoutModal.value = true
}

const cancelLogout = () => {
  showLogoutModal.value = false
}

const confirmLogout = async () => {
  try {
    authStore.clearAuth()
    showLogoutModal.value = false
    await router.push('/homepage')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const deleteAccount = () => {
  // Implement delete account functionality
  console.log('Delete account clicked')
}

// Initialize form data when component mounts
onMounted(() => {
  initializeForm()
})
</script>

