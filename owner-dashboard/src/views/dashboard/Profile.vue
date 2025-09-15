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
          Your Profile 👤
        </h1>
        <p class="text-xl text-white/90 font-medium max-w-2xl mx-auto">
          Manage your account settings and business information
        </p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-6 md:px-8 -mt-4 relative z-10 pb-12">
      <div class="space-y-8">
        <!-- Profile Image Section -->
        <div class="bg-white rounded-2xl border border-primary-200 shadow-soft overflow-hidden">
          <div
            class="p-6 border-b border-primary-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50"
          >
            <h2 class="text-xl font-bold text-primary-700 flex items-center">
              <FontAwesomeIcon icon="camera" class="w-5 h-5 mr-3 text-secondary-500" />
              Profile Image
            </h2>
            <p class="text-primary-600 mt-1 text-sm">Update your profile picture</p>
          </div>
          <div class="p-6 text-center space-y-6">
            <!-- Image Display Container -->
            <div
              class="w-32 h-32 mx-auto bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl relative"
            >
              <!-- Loading State -->
              <div
                v-if="isUploading || isRemoving"
                class="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-3xl"
              >
                <div
                  class="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-500 mb-3"
                ></div>
                <span class="text-sm font-semibold text-primary-700">
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

            <!-- Error Message -->
            <div
              v-if="imageLoadError && !isUploading && !isRemoving && currentImageUrl"
              class="text-xs text-red-500 bg-red-50 border border-red-200 rounded p-3"
            >
              <p class="font-medium">Image failed to load</p>
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
            <div class="flex justify-center space-x-3">
              <button
                @click="triggerFileInput"
                :disabled="isUploading || isRemoving"
                class="inline-flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <FontAwesomeIcon icon="camera" class="w-4 h-4 mr-2" />
                {{ isUploading ? 'Uploading...' : 'Upload' }}
              </button>

              <button
                v-if="currentImageUrl && !isUploading"
                @click="handleRemoveImage"
                :disabled="isRemoving"
                class="inline-flex items-center justify-center bg-gradient-to-r from-error-500 to-error-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:from-error-600 hover:to-error-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <FontAwesomeIcon icon="trash" class="w-4 h-4 mr-2" />
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
        <div class="bg-white rounded-2xl border border-primary-200 shadow-soft overflow-hidden">
          <div
            class="p-6 border-b border-primary-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50"
          >
            <h2 class="text-xl font-bold text-primary-700 flex items-center">
              <FontAwesomeIcon icon="building" class="w-5 h-5 mr-3 text-secondary-500" />
              Organization Information
            </h2>
            <p class="text-primary-600 mt-1 text-sm">
              Your business details and contact information
            </p>
          </div>
          <div class="p-6">
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div class="bg-primary-50 rounded-xl p-4">
                <div class="flex items-center space-x-3 mb-2">
                  <FontAwesomeIcon icon="building" class="w-5 h-5 text-primary-600" />
                  <h5 class="font-semibold text-primary-700 text-sm">Organization</h5>
                </div>
                <p class="text-primary-600 text-base font-medium">
                  {{ authStore.user?.org_name || 'Not specified' }}
                </p>
              </div>

              <div class="bg-primary-50 rounded-xl p-4">
                <div class="flex items-center space-x-3 mb-2">
                  <FontAwesomeIcon icon="envelope" class="w-5 h-5 text-primary-600" />
                  <h5 class="font-semibold text-primary-700 text-sm">Email</h5>
                </div>
                <p class="text-primary-600 text-base font-medium">
                  {{ authStore.user?.email || 'Not specified' }}
                </p>
              </div>

              <div v-if="contactInfo?.phone" class="bg-secondary-50 rounded-xl p-4">
                <div class="flex items-center space-x-3 mb-2">
                  <FontAwesomeIcon icon="phone" class="w-5 h-5 text-secondary-600" />
                  <h5 class="font-semibold text-secondary-700 text-sm">Phone</h5>
                </div>
                <p class="text-secondary-600 text-base font-medium">{{ contactInfo.phone }}</p>
              </div>

              <div v-if="contactInfo?.website" class="bg-primary-50 rounded-xl p-4">
                <div class="flex items-center space-x-3 mb-2">
                  <FontAwesomeIcon icon="globe" class="w-5 h-5 text-primary-600" />
                  <h5 class="font-semibold text-primary-700 text-sm">Website</h5>
                </div>
                <p class="text-primary-600 text-base font-medium">{{ contactInfo.website }}</p>
              </div>

              <div
                v-if="contactInfo?.address"
                class="bg-secondary-50 rounded-xl p-4 md:col-span-2 lg:col-span-1"
              >
                <div class="flex items-start space-x-3 mb-2">
                  <FontAwesomeIcon icon="map-marker-alt" class="w-5 h-5 text-secondary-600 mt-1" />
                  <h5 class="font-semibold text-secondary-700 text-sm">Address</h5>
                </div>
                <p class="text-secondary-600 text-base font-medium">{{ contactInfo.address }}</p>
              </div>
            </div>

            <div v-if="authStore.user?.description" class="mt-8 pt-6 border-t border-primary-100">
              <h5 class="text-base font-semibold text-primary-700 mb-3 flex items-center">
                <FontAwesomeIcon icon="align-left" class="w-4 h-4 mr-2 text-secondary-500" />
                Description
              </h5>
              <div class="bg-primary-50 rounded-xl p-4">
                <p class="text-primary-600 leading-relaxed text-base">
                  {{ authStore.user.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Actions -->
        <div class="bg-white rounded-2xl border border-primary-200 shadow-soft overflow-hidden">
          <div
            class="p-6 border-b border-primary-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50"
          >
            <h2 class="text-xl font-bold text-primary-700 flex items-center">
              <FontAwesomeIcon icon="cog" class="w-5 h-5 mr-3 text-secondary-500" />
              Account Actions
            </h2>
            <p class="text-primary-600 mt-1 text-sm">Manage your account settings and security</p>
          </div>
          <div class="p-6 space-y-4">
            <button
              @click="openEditProfile"
              class="w-full flex items-center justify-start px-5 py-3 text-base font-semibold text-primary-700 bg-gradient-to-r from-primary-50 to-secondary-50 border-2 border-primary-200 rounded-xl hover:from-primary-100 hover:to-secondary-100 hover:border-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all duration-200 transform hover:scale-105"
            >
              <FontAwesomeIcon icon="edit" class="w-5 h-5 mr-3 text-primary-600" />
              Edit Profile
            </button>

            <button
              @click="openChangePassword"
              class="w-full flex items-center justify-start px-5 py-3 text-base font-semibold text-secondary-700 bg-gradient-to-r from-secondary-50 to-primary-50 border-2 border-secondary-200 rounded-xl hover:from-secondary-100 hover:to-primary-100 hover:border-secondary-300 focus:outline-none focus:ring-4 focus:ring-secondary-100 transition-all duration-200 transform hover:scale-105"
            >
              <FontAwesomeIcon icon="lock" class="w-5 h-5 mr-3 text-secondary-600" />
              Change Password
            </button>

            <button
              @click="confirmLogout"
              :disabled="isLoggingOut"
              class="w-full flex items-center justify-start px-5 py-3 text-base font-semibold text-white bg-gradient-to-r from-error-500 to-error-600 rounded-xl hover:from-error-600 hover:to-error-700 focus:outline-none focus:ring-4 focus:ring-error-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            >
              <FontAwesomeIcon icon="sign-out-alt" class="w-5 h-5 mr-3" />
              {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Profile Modal -->
      <div
        v-if="isEditingProfile"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
      >
        <div
          class="relative top-20 mx-auto p-8 border w-11/12 max-w-2xl shadow-2xl rounded-2xl bg-white"
        >
          <div class="mt-3">
            <div class="flex items-center mb-6">
              <div
                class="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4"
              >
                <FontAwesomeIcon icon="edit" class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-primary-700">Edit Profile</h3>
                <p class="text-primary-600">
                  Update your organization information and contact details
                </p>
              </div>
            </div>

            <!-- Error Message -->
            <div
              v-if="profileError"
              class="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl"
            >
              <div class="flex items-center">
                <FontAwesomeIcon icon="exclamation-triangle" class="w-5 h-5 text-error-500 mr-3" />
                <p class="text-sm text-error-600 font-medium">{{ profileError }}</p>
              </div>
            </div>

            <form @submit.prevent="handleUpdateProfile" class="space-y-6">
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
                    disabled
                    readonly
                    class="flex h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label for="description" class="text-sm font-medium leading-none"
                  >Description</label
                >
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

              <div class="flex justify-end space-x-4 pt-6 border-t border-primary-100">
                <button
                  type="button"
                  @click="cancelProfileEdit"
                  :disabled="isUpdatingProfile"
                  class="px-6 py-3 text-primary-600 bg-white border-2 border-primary-200 rounded-xl font-bold hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="isUpdatingProfile"
                  class="px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-bold hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div v-if="isUpdatingProfile" class="flex items-center">
                    <div
                      class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"
                    ></div>
                    Saving...
                  </div>
                  <div v-else class="flex items-center">
                    <FontAwesomeIcon icon="save" class="w-4 h-4 mr-2" />
                    Save Changes
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Change Password Modal -->
      <div
        v-if="isChangingPassword"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50"
      >
        <div
          class="relative top-20 mx-auto p-8 border w-11/12 max-w-md shadow-2xl rounded-2xl bg-white"
        >
          <div class="mt-3">
            <div class="flex items-center mb-6">
              <div
                class="w-12 h-12 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-xl flex items-center justify-center mr-4"
              >
                <FontAwesomeIcon icon="lock" class="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-primary-700">Change Password</h3>
                <p class="text-primary-600">Enter your current password and choose a new one</p>
              </div>
            </div>

            <!-- Error Message -->
            <div
              v-if="passwordError"
              class="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl"
            >
              <div class="flex items-center">
                <FontAwesomeIcon icon="exclamation-triangle" class="w-5 h-5 text-error-500 mr-3" />
                <p class="text-sm text-error-600 font-medium">{{ passwordError }}</p>
              </div>
            </div>

            <form @submit.prevent="handleChangePassword" class="space-y-6">
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
                <label for="newPassword" class="text-sm font-medium leading-none"
                  >New Password</label
                >
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
              <div class="flex justify-end space-x-4 pt-6 border-t border-primary-100">
                <button
                  type="button"
                  @click="cancelPasswordChange"
                  :disabled="isChangingPasswordLoading"
                  class="px-6 py-3 text-primary-600 bg-white border-2 border-primary-200 rounded-xl font-bold hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="isChangingPasswordLoading"
                  class="px-8 py-3 bg-gradient-to-r from-secondary-500 to-primary-500 text-white rounded-xl font-bold hover:from-secondary-600 hover:to-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <div v-if="isChangingPasswordLoading" class="flex items-center">
                    <div
                      class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"
                    ></div>
                    Changing...
                  </div>
                  <div v-else class="flex items-center">
                    <FontAwesomeIcon icon="lock" class="w-4 h-4 mr-2" />
                    Change Password
                  </div>
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
        message="Are you sure you want to logout? You will need to sign in again to access your account. Any unsaved changes will be lost."
        confirm-text="Yes, Logout"
        cancel-text="Stay Logged In"
        loading-text="Logging out..."
        :loading="isLoggingOut"
        @confirm="handleLogout"
        @cancel="cancelLogout"
      />

      <!-- Toast Notification -->
      <Toast
        :show="showToast"
        :type="toastType"
        :title="toastTitle"
        :message="toastMessage"
        @close="showToast = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { profileService } from '../../service/profileService'
import Toast from '../../components/common/Toast.vue'

// Define component name
defineOptions({
  name: 'ProfileView',
})

const ConfirmationModal = defineAsyncComponent(
  () => import('../../components/common/ConfirmationModal.vue'),
)

const router = useRouter()
const authStore = useAuthStore()
const fileInputRef = ref<HTMLInputElement>()

// Image state
const currentImageUrl = ref('')
const isImageLoading = ref(false)
const imageLoadError = ref(false)
const imageKey = ref(0) // Force refresh image
const lastKnownImageUrl = ref('')

// const isDev = computed(() => import.meta.env.DEV)

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
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('success')
const toastTitle = ref('')
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
  console.log('Profile image loaded successfully:', currentImageUrl.value)
  isImageLoading.value = false
  imageLoadError.value = false

  // Update last known URL
  lastKnownImageUrl.value = currentImageUrl.value
}

const onImageError = (event: Event) => {
  console.error('Profile image failed to load:', currentImageUrl.value)
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
  console.log('Updating image URL:', {
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

    console.log('Image URL updated successfully:', finalUrl)
  }
}

// Refresh image function
const refreshImage = () => {
  console.log('Manually refreshing image...')
  imageKey.value++
  isImageLoading.value = !!currentImageUrl.value
  imageLoadError.value = false
}

// Watch for authStore.user?.logo
watch(
  () => authStore.user?.logo,
  (newLogo) => {
    console.log('Auth store logo changed:', newLogo)
    updateImageUrl(newLogo)
  },
  { immediate: true },
)

// Watch for user object
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser?.logo !== lastKnownImageUrl.value) {
      console.log('User object changed, updating image URL')
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
    console.log('Starting profile image upload:', {
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
      console.log('Upload successful, new logo URL:', response.user.logo)

      // Update auth store
      Object.assign(authStore.user!, response.user)

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.user))

      // Update current image URL
      await nextTick()
      updateImageUrl(response.user.logo)

      showSuccessToast('Success!', 'Profile image uploaded successfully')
    } else {
      throw new Error('Upload succeeded but no user data returned')
    }
  } catch (error: any) {
    console.error('Error uploading profile image:', error)
    showErrorToast('Upload Failed', error.message || 'Failed to upload profile image')
  } finally {
    isUploading.value = false
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
      // Email is intentionally excluded from updates for security reasons
      description: profileForm.value.description.trim() || undefined,
      contact_info: JSON.stringify({
        phone: profileForm.value.phone.trim(),
        address: profileForm.value.address.trim(),
        website: profileForm.value.website.trim(),
      }),
    }

    console.log('Submitting profile update:', updateData)

    const response = await profileService.updateProfile(updateData)

    // Update auth store with new data
    if (response.user) {
      Object.assign(authStore.user!, response.user)

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.user))
    }

    isEditingProfile.value = false
    showSuccessToast('Success!', 'Profile updated successfully')
  } catch (error: any) {
    console.error('Profile update error:', error)
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

    console.log('Submitting password change...')

    await profileService.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })

    isChangingPassword.value = false
    resetPasswordForm()
    showSuccessToast('Success!', 'Password changed successfully')
  } catch (error: any) {
    console.error('Password change error:', error)
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

    // Show success toast
    showSuccessToast('Logged Out', 'You have been successfully logged out')

    // Small delay before redirect
    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (error) {
    console.error('❌ Logout error:', error)
    showErrorToast('Logout Failed', 'There was an error logging out. Please try again.')
  } finally {
    isLoggingOut.value = false
  }
}

const cancelLogout = () => {
  showLogoutModal.value = false
}

const showSuccessToast = (title: string, message?: string) => {
  toastType.value = 'success'
  toastTitle.value = title
  toastMessage.value = message || ''
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const showErrorToast = (title: string, message?: string) => {
  toastType.value = 'error'
  toastTitle.value = title
  toastMessage.value = message || ''
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 5000)
}

// Warning toast function (for future use)
// const showWarningToast = (title: string, message?: string) => {
//   toastType.value = 'warning'
//   toastTitle.value = title
//   toastMessage.value = message || ''
//   showToast.value = true
//   setTimeout(() => {
//     showToast.value = false
//   }, 4000)
// }

// Load profile function
const loadProfile = async () => {
  try {
    console.log('Loading fresh profile data...')
    const response = await profileService.getProfile()

    if (response.user) {
      // Update auth store
      Object.assign(authStore.user!, response.user)

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.user))

      // Update logo
      updateImageUrl(response.user.logo)

      console.log('Profile loaded successfully')
    }
  } catch (error) {
    console.error('Failed to load profile:', error)
  }
}

// Remove function
const handleRemoveImage = async () => {
  try {
    console.log('Starting profile image removal')

    isRemoving.value = true
    imageLoadError.value = false

    // Call remove service
    const response = await profileService.removeProfileImage()

    if (response.user) {
      console.log('Remove successful')

      // Update auth store
      Object.assign(authStore.user!, response.user)

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.user))

      // Update current image URL
      await nextTick()
      updateImageUrl(response.user.logo)

      showSuccessToast('Success!', 'Profile image removed successfully')
    } else {
      throw new Error('Remove succeeded but no user data returned')
    }
  } catch (error: any) {
    console.error('Error removing profile image:', error)
    showErrorToast('Remove Failed', error.message || 'Failed to remove profile image')
  } finally {
    isRemoving.value = false
  }
}

// Lifecycle
onMounted(async () => {
  console.log('Profile component mounted')
  console.log('Current user:', authStore.user)

  initializeProfileForm()

  // loaded new profile to make sure the profile is lastest
  await loadProfile()

  // check that user have logo or nor?
  if (authStore.user?.logo) {
    updateImageUrl(authStore.user.logo)
  }
})
</script>
