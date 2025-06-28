<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center space-x-2">
      <h1 class="text-3xl font-bold tracking-tight">Profile</h1>
    </div>

    <div class="grid gap-6 md:grid">
      <!-- Profile Image Section -->
      <div class="rounded-lg border bg-white shadow-sm">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold flex items-center">
            <User class="w-5 h-5 mr-2" />
            Profile Image
          </h2>
        </div>
        <div class="p-6 text-center space-y-4">
          <div class="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            <img
              v-if="authStore.user?.logo"
              :src="authStore.user.logo"
              :alt="authStore.user.org_name"
              class="w-full h-full object-cover"
            />
            <span
              v-else
              class="text-xl font-medium text-gray-600"
            >
              {{ getInitials(authStore.user?.org_name || 'ORG') }}
            </span>
          </div>

          <div class="flex justify-center space-x-2">
            <button
              @click="triggerFileInput"
              :disabled="isUploading"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-10 px-4 py-2"
            >
              <Camera class="w-4 h-4 mr-2" />
              {{ isUploading ? 'Uploading...' : 'Upload' }}
            </button>

            <button
              v-if="authStore.user?.logo"
              @click="handleRemoveImage"
              :disabled="isRemoving"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-10 px-4 py-2"
            >
              {{ isRemoving ? 'Removing...' : 'Remove' }}
            </button>
          </div>

          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            class="hidden"
          />
        </div>
      </div>

      <!-- Profile Information Display -->
      <div class="rounded-lg border bg-white shadow-sm">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold">Organization Information</h2>
        </div>
        <div class="p-6">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <Building class="w-5 h-5 text-gray-500" />
                <div>
                  <p class="text-sm text-gray-500">Organization</p>
                  <p class="font-medium">{{ authStore.user?.org_name || 'Not specified' }}</p>
                </div>
              </div>

              <div class="flex items-center space-x-3">
                <Mail class="w-5 h-5 text-gray-500" />
                <div>
                  <p class="text-sm text-gray-500">Email</p>
                  <p class="font-medium">{{ authStore.user?.email || 'Not specified' }}</p>
                </div>
              </div>

              <div v-if="contactInfo?.phone" class="flex items-center space-x-3">
                <Phone class="w-5 h-5 text-gray-500" />
                <div>
                  <p class="text-sm text-gray-500">Phone</p>
                  <p class="font-medium">{{ contactInfo.phone }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div v-if="contactInfo?.website" class="flex items-center space-x-3">
                <Globe class="w-5 h-5 text-gray-500" />
                <div>
                  <p class="text-sm text-gray-500">Website</p>
                  <p class="font-medium">{{ contactInfo.website }}</p>
                </div>
              </div>

              <div v-if="contactInfo?.address" class="flex items-start space-x-3">
                <MapPin class="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p class="text-sm text-gray-500">Address</p>
                  <p class="font-medium">{{ contactInfo.address }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="authStore.user?.description" class="mt-6 pt-6 border-t">
            <p class="text-sm text-gray-500 mb-2">Description</p>
            <p class="text-gray-700">{{ authStore.user.description }}</p>
          </div>
        </div>
      </div>

      <!-- Account Actions -->
      <div class="rounded-lg border bg-white shadow-sm">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold">Account Actions</h2>
        </div>
        <div class="p-6 space-y-4">
          <button
            @click="openEditProfile"
            class="w-full flex items-center justify-start px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Edit class="w-4 h-4 mr-2" />
            Edit Profile
          </button>

          <button
            @click="openChangePassword"
            class="w-full flex items-center justify-start px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Lock class="w-4 h-4 mr-2" />
            Change Password
          </button>

          <button
            @click="confirmLogout"
            :disabled="isLoggingOut"
            class="w-full flex items-center justify-start px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LogOut class="w-4 h-4 mr-2" />
            {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="isEditingProfile" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Profile</h3>
          <p class="text-sm text-gray-500 mb-6">Update your organization information and contact details.</p>

          <!-- Error Message -->
          <div v-if="profileError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-600">{{ profileError }}</p>
          </div>

          <form @submit.prevent="handleUpdateProfile" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="orgName" class="text-sm font-medium leading-none">Organization Name</label>
                <input
                  id="orgName"
                  v-model="profileForm.organizationName"
                  type="text"
                  :disabled="isUpdatingProfile"
                  class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div class="space-y-2">
                <label for="email" class="text-sm font-medium leading-none">Email Address</label>
                <input
                  id="email"
                  v-model="profileForm.email"
                  type="email"
                  :disabled="isUpdatingProfile"
                  class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label for="description" class="text-sm font-medium leading-none">Description</label>
              <textarea
                id="description"
                v-model="profileForm.description"
                placeholder="Tell us about your organization"
                rows="3"
                :disabled="isUpdatingProfile"
                class="flex min-h-20 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="phone" class="text-sm font-medium leading-none">Phone</label>
                <input
                  id="phone"
                  v-model="profileForm.phone"
                  type="text"
                  placeholder="+1 (555) 123-4567"
                  :disabled="isUpdatingProfile"
                  class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div class="space-y-2">
                <label for="website" class="text-sm font-medium leading-none">Website</label>
                <input
                  id="website"
                  v-model="profileForm.website"
                  type="text"
                  placeholder="https://example.com"
                  :disabled="isUpdatingProfile"
                  class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label for="address" class="text-sm font-medium leading-none">Address</label>
              <textarea
                id="address"
                v-model="profileForm.address"
                placeholder="Your business address"
                rows="2"
                :disabled="isUpdatingProfile"
                class="flex min-h-16 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div class="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                @click="cancelProfileEdit"
                :disabled="isUpdatingProfile"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isUpdatingProfile"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {{ isUpdatingProfile ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="isChangingPassword" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
          <p class="text-sm text-gray-500 mb-6">Enter your current password and choose a new one.</p>

          <!-- Error Message -->
          <div v-if="passwordError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-600">{{ passwordError }}</p>
          </div>

          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <div class="space-y-2">
              <label for="currentPassword" class="text-sm font-medium leading-none">Current Password</label>
              <input
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                type="password"
                required
                :disabled="isChangingPasswordLoading"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div class="space-y-2">
              <label for="newPassword" class="text-sm font-medium leading-none">New Password</label>
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                type="password"
                required
                :disabled="isChangingPasswordLoading"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div class="space-y-2">
              <label for="confirmPassword" class="text-sm font-medium leading-none">Confirm New Password</label>
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                :disabled="isChangingPasswordLoading"
                class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div class="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                @click="cancelPasswordChange"
                :disabled="isChangingPasswordLoading"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isChangingPasswordLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {{ isChangingPasswordLoading ? 'Changing...' : 'Change Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <ConfirmationModal
      :show="showLogoutModal"
      type="warning"
      title="Confirm Logout"
      message="Are you sure you want to logout? You will need to sign in again to access your account."
      confirm-text="Logout"
      cancel-text="Stay Logged In"
      loading-text="Logging out..."
      :loading="isLoggingOut"
      @confirm="handleLogout"
      @cancel="cancelLogout"
    />

    <!-- Success Toast -->
    <div
      v-if="showToast"
      class="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-md p-4 z-50"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">{{ toastMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Camera,
  Edit,
  User,
  Mail,
  Building,
  Phone,
  MapPin,
  Globe,
  Lock,
  LogOut
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { profileService } from '../service/profileService'
import ConfirmationModal from '../components/ConfirmationModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const fileInputRef = ref<HTMLInputElement>()

// Modal states
const isEditingProfile = ref(false)
const isChangingPassword = ref(false)

// Loading states
const isUpdatingProfile = ref(false)
const isChangingPasswordLoading = ref(false)
const isUploading = ref(false)
const isRemoving = ref(false)
const isLoggingOut = ref(false)

// Error states
const profileError = ref('')
const passwordError = ref('')

// Toast state
const showToast = ref(false)
const toastMessage = ref('')

// Logout confirmation state
const showLogoutModal = ref(false)

// Profile form data
const profileForm = ref({
  organizationName: '',
  email: '',
  description: '',
  phone: '',
  address: '',
  website: ''
})

// Password form data
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Computed properties
const contactInfo = computed(() => {
  try {
    return authStore.user?.contact_info ? JSON.parse(authStore.user.contact_info) : {}
  } catch {
    return {}
  }
})

// Methods
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    isUploading.value = true
    const response = await profileService.uploadProfileImage(file)

    // Update auth store with new user data
    if (response.user) {
      Object.assign(authStore.user!, response.user)
    }

    showSuccessToast('Profile image updated successfully')
  } catch (error: any) {
    console.error('Error updating profile image:', error)
    showErrorToast(error.message || 'Failed to upload profile image')
  } finally {
    isUploading.value = false
    // Clear the file input
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

const handleRemoveImage = async () => {
  try {
    isRemoving.value = true
    const response = await profileService.removeProfileImage()

    // Update auth store with new user data
    if (response.user) {
      Object.assign(authStore.user!, response.user)
    }

    showSuccessToast('Profile image removed successfully')
  } catch (error: any) {
    console.error('Error removing profile image:', error)
    showErrorToast(error.message || 'Failed to remove profile image')
  } finally {
    isRemoving.value = false
  }
}

const initializeProfileForm = () => {
  const user = authStore.user
  const contact = contactInfo.value

  profileForm.value = {
    organizationName: user?.org_name || '',
    email: user?.email || '',
    description: user?.description || '',
    phone: contact?.phone || '',
    address: contact?.address || '',
    website: contact?.website || ''
  }
}

const openEditProfile = () => {
  initializeProfileForm()
  isEditingProfile.value = true
  profileError.value = ''
}

const openChangePassword = () => {
  resetPasswordForm()
  isChangingPassword.value = true
  passwordError.value = ''
}

const handleUpdateProfile = async () => {
  try {
    isUpdatingProfile.value = true
    profileError.value = ''

    const updateData = {
      org_name: profileForm.value.organizationName.trim(),
      email: profileForm.value.email.trim(),
      description: profileForm.value.description.trim() || undefined,
      contact_info: JSON.stringify({
        phone: profileForm.value.phone.trim(),
        address: profileForm.value.address.trim(),
        website: profileForm.value.website.trim()
      })
    }

    console.log('🔄 Submitting profile update:', updateData)

    const response = await profileService.updateProfile(updateData)

    // Update auth store with new data
    if (response.user) {
      Object.assign(authStore.user!, response.user)
    }

    isEditingProfile.value = false
    showSuccessToast('Profile updated successfully')
  } catch (error: any) {
    console.error('❌ Profile update error:', error)
    profileError.value = error.message || 'Failed to update profile'
  } finally {
    isUpdatingProfile.value = false
  }
}

const handleChangePassword = async () => {
  try {
    isChangingPasswordLoading.value = true
    passwordError.value = ''

    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      passwordError.value = 'New passwords do not match'
      return
    }

    if (passwordForm.value.newPassword.length < 6) {
      passwordError.value = 'Password must be at least 6 characters long'
      return
    }

    console.log('🔐 Submitting password change...')

    await profileService.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })

    isChangingPassword.value = false
    resetPasswordForm()
    showSuccessToast('Password changed successfully')
  } catch (error: any) {
    console.error('❌ Password change error:', error)
    passwordError.value = error.message || 'Failed to change password'
  } finally {
    isChangingPasswordLoading.value = false
  }
}

const cancelProfileEdit = () => {
  isEditingProfile.value = false
  profileError.value = ''
  initializeProfileForm()
}

const cancelPasswordChange = () => {
  isChangingPassword.value = false
  passwordError.value = ''
  resetPasswordForm()
}

const resetPasswordForm = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const confirmLogout = () => {
  showLogoutModal.value = true
}

const handleLogout = async () => {
  try {
    isLoggingOut.value = true

    // Clear auth state
    authStore.clearAuth()

    // Close modal
    showLogoutModal.value = false

    // Small delay for better UX
    setTimeout(() => {
      router.push('/login')
    }, 500)
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    isLoggingOut.value = false
  }
}

const cancelLogout = () => {
  showLogoutModal.value = false
}

const showSuccessToast = (message: string) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const showErrorToast = (message: string) => {
  // For now, we'll use the same toast styling
  // You could create a separate error toast component
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 5000)
}

// Lifecycle
onMounted(() => {
  console.log('📋 Profile component mounted')
  console.log('👤 Current user:', authStore.user)
  initializeProfileForm()
})
</script>