<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
    <div class="flex items-center space-x-2">
      <h1 class="text-3xl font-bold tracking-tight">Profile</h1>
    </div>

    <div class="grid gap-6 md:grid">
      <!-- Profile Image Section - FIXED -->
      <div class="rounded-lg border bg-white shadow-sm">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold flex items-center">
            <User class="w-5 h-5 mr-2" />
            Profile Image
          </h2>
        </div>
        <div class="p-6 text-center space-y-4">
          <!-- Image Display Container -->
          <div
            class="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 relative"
          >
            <!-- Loading State -->
            <div v-if="isUploading || isRemoving" class="flex flex-col items-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <span class="text-xs text-gray-500">
                {{ isUploading ? 'Uploading...' : 'Removing...' }}
              </span>
            </div>

            <!-- Profile Image or Fallback -->
            <div v-else class="w-full h-full relative">
              <!-- Image Loading State -->
              <div
                v-if="isImageLoading && currentImageUrl"
                class="absolute inset-0 flex items-center justify-center bg-gray-100"
              >
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
              </div>

              <!-- Actual Profile Image -->
              <img
                v-if="currentImageUrl && !imageLoadError"
                :src="currentImageUrl"
                :alt="authStore.user?.org_name || 'Profile'"
                class="w-full h-full object-cover transition-opacity duration-300"
                :class="{ 'opacity-0': isImageLoading, 'opacity-100': !isImageLoading }"
                @load="onImageLoad"
                @error="onImageError"
                :key="imageKey"
              />

              <!-- Fallback: Initials -->
              <div
                v-if="!currentImageUrl || imageLoadError"
                class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white"
              >
                <span class="text-xl font-semibold">
                  {{ getInitials(authStore.user?.org_name || 'ORG') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Debug Info (Development Only) -->
          <div v-if="isDev" class="text-xs text-gray-500 space-y-1 p-2 bg-gray-50 rounded">
            <p class="font-mono break-all">Current: {{ currentImageUrl || 'None' }}</p>
            <p class="font-mono break-all">Store: {{ authStore.user?.logo || 'None' }}</p>
            <p class="flex items-center justify-center gap-2">
              Status:
              <span
                v-if="!isImageLoading && !imageLoadError && currentImageUrl"
                class="text-green-600"
                >✅ Loaded</span
              >
              <span v-else-if="imageLoadError" class="text-red-600">❌ Failed</span>
              <span v-else-if="isImageLoading" class="text-yellow-600">⏳ Loading</span>
              <span v-else class="text-gray-600">⚪ No Image</span>
            </p>
            <button
              v-if="currentImageUrl"
              @click="testImageDirectly"
              class="text-blue-600 hover:text-blue-700 underline text-xs"
            >
              Test URL in new tab
            </button>
          </div>

          <!-- Error Message -->
          <div
            v-if="imageLoadError && !isUploading && !isRemoving && currentImageUrl"
            class="text-xs text-red-500 bg-red-50 border border-red-200 rounded p-3"
          >
            <p class="font-medium">⚠️ Image failed to load</p>
            <p class="mt-1">
              The image file may not be accessible or the bucket might not be public.
            </p>
            <button
              @click="refreshImage"
              class="mt-2 text-blue-600 hover:text-blue-700 underline text-xs"
            >
              Try to reload image
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-center space-x-2">
            <button
              @click="triggerFileInput"
              :disabled="isUploading || isRemoving"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-10 px-4 py-2"
            >
              <Camera class="w-4 h-4 mr-2" />
              {{ isUploading ? 'Uploading...' : 'Upload' }}
            </button>

            <button
              v-if="currentImageUrl && !isUploading"
              @click="handleRemoveImage"
              :disabled="isRemoving"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-red-300 bg-white text-red-600 hover:bg-red-50 h-10 px-4 py-2"
            >
              {{ isRemoving ? 'Removing...' : 'Remove' }}
            </button>
          </div>

          <!-- File Input -->
          <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
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
    <div
      v-if="isEditingProfile"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white"
      >
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Profile</h3>
          <p class="text-sm text-gray-500 mb-6">
            Update your organization information and contact details.
          </p>

          <!-- Error Message -->
          <div v-if="profileError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-600">{{ profileError }}</p>
          </div>

          <form @submit.prevent="handleUpdateProfile" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="orgName" class="text-sm font-medium leading-none"
                  >Organization Name</label
                >
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
    <div
      v-if="isChangingPassword"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white"
      >
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
          <p class="text-sm text-gray-500 mb-6">
            Enter your current password and choose a new one.
          </p>

          <!-- Error Message -->
          <div v-if="passwordError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-600">{{ passwordError }}</p>
          </div>

          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <div class="space-y-2">
              <label for="currentPassword" class="text-sm font-medium leading-none"
                >Current Password</label
              >
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
              <label for="confirmPassword" class="text-sm font-medium leading-none"
                >Confirm New Password</label
              >
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
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
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
  LogOut,
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'
import { profileService } from '../../service/profileService'
import ConfirmationModal from '../../components/common/ConfirmationModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const fileInputRef = ref<HTMLInputElement>()

// Image state
const currentImageUrl = ref('')
const isImageLoading = ref(false)
const imageLoadError = ref(false)
const imageKey = ref(0) // Force refresh image
const lastKnownImageUrl = ref('')

const isDev = computed(() => import.meta.env.DEV)

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
  website: '',
})

// Password form data
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
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

const onImageLoad = () => {
  console.log('✅ Profile image loaded successfully:', currentImageUrl.value)
  isImageLoading.value = false
  imageLoadError.value = false

  // Update last known URL
  lastKnownImageUrl.value = currentImageUrl.value
}

const onImageError = (event: Event) => {
  console.error('❌ Profile image failed to load:', currentImageUrl.value)
  isImageLoading.value = false
  imageLoadError.value = true

  const img = event.target as HTMLImageElement
  console.error('Image error details:', {
    src: img.src,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
  })
}

const testImageDirectly = () => {
  if (currentImageUrl.value) {
    window.open(currentImageUrl.value, '_blank')
  }
}

// Update image URL
const updateImageUrl = (newUrl: string | null | undefined) => {
  console.log('🔄 Updating image URL:', {
    from: currentImageUrl.value,
    to: newUrl,
    storeValue: authStore.user?.logo,
  })

  const finalUrl = newUrl || ''

  // Check that URL change or not?
  if (finalUrl !== currentImageUrl.value) {
    currentImageUrl.value = finalUrl
    imageKey.value++ // Force Vue to re-render image
    isImageLoading.value = !!finalUrl
    imageLoadError.value = false

    console.log('✅ Image URL updated successfully:', finalUrl)
  }
}

// Refresh image function
const refreshImage = () => {
  console.log('🔄 Manually refreshing image...')
  imageKey.value++
  isImageLoading.value = !!currentImageUrl.value
  imageLoadError.value = false
}

// Watch for authStore.user?.logo
watch(
  () => authStore.user?.logo,
  (newLogo) => {
    console.log('👀 Auth store logo changed:', newLogo)
    updateImageUrl(newLogo)
  },
  { immediate: true },
)

// Watch for user object
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser?.logo !== lastKnownImageUrl.value) {
      console.log('👤 User object changed, updating image URL')
      updateImageUrl(newUser?.logo)
    }
  },
  { deep: true, immediate: true },
)

// Upload Function
const handleImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    console.log('📤 Starting profile image upload:', {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Client-side validation
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB')
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please select an image file (JPEG, JPG, PNG, GIF, OR WebP)')
    }

    // Reset states
    isUploading.value = true
    imageLoadError.value = false

    // Call upload service
    const response = await profileService.uploadProfileImage(file)

    if (response.user) {
      console.log('✅ Upload successful, new logo URL:', response.user.logo)

      // Update auth store
      Object.assign(authStore.user!, response.user)

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.user))

      // Update current image URL
      await nextTick()
      updateImageUrl(response.user.logo)

      showSuccessToast('Profile image updated successfully')
    } else {
      throw new Error('Upload succeeded but no user data returned')
    }
  } catch (error: any) {
    console.error('❌ Error updating profile image:', error)
    showErrorToast(error.message || 'Failed to upload profile image')
  } finally {
    isUploading.value = false

    // Clear the file input
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

// Remove Function
const handleRemoveImage = async () => {
  try {
    console.log('🗑️ Starting profile image removal')

    isRemoving.value = true
    imageLoadError.value = false

    // Call remove service
    const response = await profileService.removeProfileImage()

    if (response.user) {
      console.log('✅ Remove successful')

      // Update auth store
      Object.assign(authStore.user!, response.user)

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.user))

      // Update current image URL
      await nextTick()
      updateImageUrl(response.user.logo)

      showSuccessToast('Profile image removed successfully')
    } else {
      throw new Error('Remove succeeded but no user data returned')
    }
  } catch (error: any) {
    console.error('❌ Error removing profile image:', error)
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
    website: contact?.website || '',
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
        website: profileForm.value.website.trim(),
      }),
    }

    console.log('📝 Submitting profile update:', updateData)

    const response = await profileService.updateProfile(updateData)

    // Update auth store with new data
    if (response.user) {
      Object.assign(authStore.user!, response.user)

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.user))
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

    if (passwordForm.value.newPassword.length < 8) {
      passwordError.value = 'Password must be at least 8 characters long'
      return
    }

    console.log('🔐 Submitting password change...')

    await profileService.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
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
    confirmPassword: '',
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

    // Small delay
    setTimeout(() => {
      router.push('/login')
    }, 500)
  } catch (error) {
    console.error('❌ Logout error:', error)
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
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 5000)
}

// Load profile function
const loadProfile = async () => {
  try {
    console.log('🔄 Loading fresh profile data...')
    const response = await profileService.getProfile()

    if (response.user) {
      // Update auth store
      Object.assign(authStore.user!, response.user)

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.user))

      // Update logo
      updateImageUrl(response.user.logo)

      console.log('✅ Profile loaded successfully')
    }
  } catch (error) {
    console.error('❌ Failed to load profile:', error)
  }
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 Profile component mounted')
  console.log('👤 Current user:', authStore.user)

  initializeProfileForm()

  // loaded new profile to make sure the profile is lastest
  await loadProfile()

  // check that user have logo or nor?
  if (authStore.user?.logo) {
    updateImageUrl(authStore.user.logo)
  }
})
</script>
