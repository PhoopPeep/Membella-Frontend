// member-portal/src/views/MemberProfile.vue
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
            <p class="text-sm text-gray-500">Member since {{ formatDate(authStore.user?.createdAt) }}</p>
          </div>
          <button
            @click="toggleEdit"
            class="member-button"
          >
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
            <button
              type="submit"
              :disabled="isLoading"
              class="member-button"
            >
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

    <!-- Additional Settings -->
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
              @click="changePassword"
              class="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Change Password
            </button>
          </div>

          <!-- Delete Account -->
          <div class="flex items-center justify-between py-3">
            <div>
              <h4 class="text-sm font-medium text-gray-900">Delete Account</h4>
              <p class="text-sm text-gray-500">Permanently delete your account and all data</p>
            </div>
            <button
              @click="deleteAccount"
              class="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const isEditing = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const profileForm = reactive({
  fullName: '',
  email: '',
  phone: ''
})

const originalForm = reactive({
  fullName: '',
  email: '',
  phone: ''
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

    // TODO: Call API to update profile
    console.log('Updating profile:', profileForm)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

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

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Recently'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const changePassword = () => {
  // TODO: Implement change password
  alert('Change password functionality would be implemented here')
}

const deleteAccount = () => {
  // TODO: Implement delete account
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    alert('Delete account functionality would be implemented here')
  }
}

onMounted(() => {
  initializeForm()
})
</script>
