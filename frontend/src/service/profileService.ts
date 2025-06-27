import api from '../router/api'

export interface ProfileUpdateData {
  org_name?: string
  email?: string
  description?: string
  contact_info?: string
  logo?: string | null
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
}

export interface ProfileResponse {
  message: string
  user?: {
    owner_id: string
    org_name: string
    email: string
    description?: string
    contact_info?: string
    logo?: string
  }
}

export const profileService = {
  // Get current user profile
  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await api.get('/api/auth/profile')
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to fetch profile')
    }
  },

  // Update user profile
  async updateProfile(data: ProfileUpdateData): Promise<ProfileResponse> {
    try {
      const response = await api.put('/api/auth/profile', data)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to update profile')
    }
  },

  // Change password
  async changePassword(data: PasswordChangeData): Promise<{ message: string }> {
    try {
      const response = await api.put('/api/auth/change-password', data)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to change password')
    }
  },

  // Upload profile image
  async uploadProfileImage(file: File): Promise<ProfileResponse> {
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await api.post('/api/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to upload profile image')
    }
  },

  // Remove profile image
  async removeProfileImage(): Promise<ProfileResponse> {
    try {
      const response = await api.delete('/api/auth/avatar')
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to remove profile image')
    }
  }
}