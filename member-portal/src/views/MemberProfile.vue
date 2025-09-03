<template>
  <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
      <p class="text-gray-600">Manage your account information and preferences</p>
    </div>

    <!-- Profile Card -->
    <div class="bg-white rounded-lg shadow border border-gray-200">
      <div class="p-6">
        <!-- Profile Header -->
        <div class="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon="user" class="w-8 h-8 text-blue-600" />
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-semibold text-gray-900">{{ authStore.user?.fullName }}</h2>
            <p class="text-gray-600">{{ authStore.user?.email }}</p>
            <p class="text-sm text-gray-500">
              Member since {{ formatDate(authStore.user?.createdAt) }}
            </p>
          </div>
          <button @click="toggleEdit" class="member-button">
            <FontAwesomeIcon :icon="isEditing ? 'save' : 'edit'" class="w-4 h-4 mr-2" />
            {{ isEditing ? 'Save' : 'Edit' }}
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p class="text-sm text-green-600">{{ successMessage }}</p>
        </div>

        <!-- Profile Form -->
        <form @submit.prevent="handleSave" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Full Name -->
            <div class="space-y-2">
              <label for="fullName" class="text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="fullName"
                v-model="profileForm.fullName"
                type="text"
                :disabled="!isEditing || isLoading"
                class="member-input"
                :class="{ 'bg-gray-50': !isEditing }"
              />
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <label for="email" class="text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                v-model="profileForm.email"
                type="email"
                :disabled="!isEditing || isLoading"
                class="member-input"
                :class="{ 'bg-gray-50': !isEditing }"
              />
            </div>

            <!-- Phone -->
            <div class="space-y-2">
              <label for="phone" class="text-sm font-medium text-gray-700">Phone</label>
              <input
                id="phone"
                v-model="profileForm.phone"
                type="tel"
                :disabled="!isEditing || isLoading"
                class="member-input"
                :class="{ 'bg-gray-50': !isEditing }"
                placeholder="Enter your phone number"
              />
            </div>

            <!-- Member ID (Read only) -->
            <div class="space-y-2">
              <label for="memberId" class="text-sm font-medium text-gray-700">Member ID</label>
              <input
                id="memberId"
                :value="authStore.user?.id"
                type="text"
                disabled
                class="member-input bg-gray-50"
              />
            </div>
          </div>

          <!-- Action Buttons (only shown when editing) -->
          <div v-if="isEditing" class="flex space-x-3 pt-6 border-t border-gray-200">
            <button type="submit" :disabled="isLoading" class="member-button">
              <div v-if="isLoading" class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
              <span v-else>
                <FontAwesomeIcon icon="save" class="w-4 h-4 mr-2" />
                Save Changes
              </span>
            </button>
            <button
              type="button"
              @click="cancelEdit"
              :disabled="isLoading"
              class="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Account Settings -->
    <div class="mt-8 bg-white rounded-lg shadow border border-gray-200">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>

        <div class="space-y-4">
          <!-- Change Password -->
          <div class="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h4 class="text-sm font-medium text-gray-900">Password</h4>
              <p class="text-sm text-gray-500">Change your account password</p>
            </div>
            <button
              @click="openChangePasswordModal"
              class="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Change Password
            </button>
          </div>

          <!-- Logout -->
          <div class="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h4 class="text-sm font-medium text-gray-900">Sign Out</h4>
              <p class="text-sm text-gray-500">Sign out from your account</p>
            </div>
            <button
              @click="handleLogout"
              class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <FontAwesomeIcon icon="sign-out-alt" class="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div
      v-if="showChangePasswordModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
      @click.self="closeChangePasswordModal"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Change Password</h3>
          <p class="text-sm text-gray-600">Enter your current password and choose a new one</p>
        </div>

        <!-- Password Change Error -->
        <div v-if="passwordChangeError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ passwordChangeError }}</p>
        </div>

        <!-- Password Change Success -->
        <div v-if="passwordChangeSuccess" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p class="text-sm text-green-600">{{ passwordChangeSuccess }}</p>
        </div>

        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <!-- Current Password -->
          <div class="space-y-2">
            <label for="currentPassword" class="text-sm font-medium text-gray-700">Current Password</label>
            <div class="relative">
              <input
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                :disabled="isChangingPassword"
                class="member-input pr-10"
                placeholder="Enter your current password"
                required
              />
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                :disabled="isChangingPassword"
              >
                <FontAwesomeIcon :icon="showCurrentPassword ? 'eye-slash' : 'eye'" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- New Password -->
          <div class="space-y-2">
            <label for="newPassword" class="text-sm font-medium text-gray-700">New Password</label>
            <div class="relative">
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                :disabled="isChangingPassword"
                class="member-input pr-10"
                placeholder="Enter your new password"
                required
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                :disabled="isChangingPassword"
              >
                <FontAwesomeIcon :icon="showNewPassword ? 'eye-slash' : 'eye'" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Confirm New Password -->
          <div class="space-y-2">
            <label for="confirmPassword" class="text-sm font-medium text-gray-700">Confirm New Password</label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                :disabled="isChangingPassword"
                class="member-input pr-10"
                :class="{ 'border-red-300': passwordForm.confirmPassword && !passwordsMatch }"
                placeholder="Confirm your new password"
                required
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                :disabled="isChangingPassword"
              >
                <FontAwesomeIcon :icon="showConfirmPassword ? 'eye-slash' : 'eye'" class="w-4 h-4" />
              </button>
            </div>
            <div v-if="passwordForm.confirmPassword && !passwordsMatch" class="text-xs text-red-600">
              Passwords do not match
            </div>
          </div>

          <!-- Password Requirements -->
          <div class="text-xs text-gray-500 space-y-1">
            <p>Password must:</p>
            <ul class="ml-4 space-y-0.5">
              <li :class="passwordRequirements.length ? 'text-green-600' : 'text-gray-500'">
                <FontAwesomeIcon :icon="passwordRequirements.length ? 'check' : 'times'" class="w-3 h-3 mr-1" />
                Be at least 8 characters long
              </li>
            </ul>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="closeChangePasswordModal"
              :disabled="isChangingPassword"
              class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isChangingPassword || !isPasswordFormValid"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div v-if="isChangingPassword" class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Changing...
              </div>
              <span v-else>
                <FontAwesomeIcon icon="key" class="w-4 h-4 mr-2" />
                Change Password
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <div
      v-if="showLogoutModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
        <div class="text-center">
          <FontAwesomeIcon icon="sign-out-alt" class="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Confirm Logout</h3>
          <p class="text-gray-600 mb-6">Are you sure you want to sign out from your account?</p>
          <div class="flex space-x-3">
            <button
              @click="cancelLogout"
              class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="confirmLogout"
              class="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              <FontAwesomeIcon icon="sign-out-alt" class="w-4 h-4 mr-2" />
              Logout
            </button>
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
  email: '',
  phone: '',
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const originalForm = reactive({
  fullName: '',
  email: '',
  phone: '',
})

// Password validation computed properties
const passwordRequirements = computed(() => ({
  length: passwordForm.newPassword.length >= 8
}))

const passwordsMatch = computed(() => {
  return passwordForm.newPassword === passwordForm.confirmPassword
})

const isPasswordFormValid = computed(() => {
  return passwordForm.currentPassword &&
         passwordForm.newPassword &&
         passwordForm.confirmPassword &&
         passwordRequirements.value.length &&
         passwordsMatch.value &&
         passwordForm.currentPassword !== passwordForm.newPassword
})

const initializeForm = () => {
  const user = authStore.user
  if (user) {
    profileForm.fullName = user.fullName || ''
    profileForm.email = user.email || ''
    profileForm.phone = user.phone || ''

    // Save original values
    originalForm.fullName = profileForm.fullName
    originalForm.email = profileForm.email
    originalForm.phone = profileForm.phone
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

    if (!profileForm.email.trim()) {
      errorMessage.value = 'Email is required'
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
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim() || undefined,
    }
    authStore.updateUser(updatedUser)

    successMessage.value = 'Profile updated successfully!'
    isEditing.value = false

    // Update original form values
    originalForm.fullName = profileForm.fullName
    originalForm.email = profileForm.email
    originalForm.phone = profileForm.phone
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
  profileForm.email = originalForm.email
  profileForm.phone = originalForm.phone

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
      passwordForm.newPassword
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

<style scoped>
/* Member-specific styles */
.member-button {
  background-color: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: background-color 0.15s ease-in-out;
  border: none;
  cursor: pointer;
}

.member-button:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.member-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.member-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  outline: none;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.member-input:focus {
  border-color: transparent;
  box-shadow: 0 0 0 2px #3b82f6;
}

.member-input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}
</style>
