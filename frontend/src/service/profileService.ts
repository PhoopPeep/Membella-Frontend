import api from '../router/api'

export interface ProfileUpdateData {
  org_name?: string
  email?: string
  description?: string
  contact_info?: string
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
}

export interface ProfileResponse {
  success?: boolean
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
      console.log('Fetching user profile...')
      const response = await api.get('/api/auth/profile')
      console.log('Profile fetch response:', response.data)

      // Handle different response formats
      if (response.data.user) {
        return response.data
      } else if (response.data.owner_id) {
        // Direct user object
        return {
          success: true,
          message: 'Profile fetched successfully',
          user: response.data,
        }
      } else {
        throw new Error('Invalid profile response format')
      }
    } catch (error: any) {
      console.error('Profile fetch error:', error)
      throw error
    }
  },

  // Update user profile
  async updateProfile(data: ProfileUpdateData): Promise<ProfileResponse> {
    try {
      console.log('Updating user profile...', data)

      // Client-side validation
      if (data.org_name !== undefined) {
        if (!data.org_name.trim()) {
          throw new Error('Organization name cannot be empty')
        }
        if (data.org_name.trim().length < 2) {
          throw new Error('Organization name must be at least 2 characters long')
        }
        if (data.org_name.trim().length > 100) {
          throw new Error('Organization name must be less than 100 characters')
        }
      }

      if (data.email !== undefined) {
        if (!data.email.trim()) {
          throw new Error('Email cannot be empty')
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(data.email.trim())) {
          throw new Error('Please enter a valid email address')
        }
      }

      if (data.description !== undefined && data.description.trim().length > 500) {
        throw new Error('Description must be less than 500 characters')
      }

      // Prepare clean data
      const updateData: ProfileUpdateData = {}
      if (data.org_name !== undefined) updateData.org_name = data.org_name.trim()
      if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase()
      if (data.description !== undefined)
        updateData.description = data.description.trim() || undefined
      if (data.contact_info !== undefined) updateData.contact_info = data.contact_info

      const response = await api.put('/api/auth/profile', updateData)
      console.log('Profile update response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Profile update error:', error)
      throw error
    }
  },

  // Change password
  async changePassword(data: PasswordChangeData): Promise<{ message: string }> {
    try {
      console.log('Changing password...')

      // Client-side validation
      if (!data.currentPassword?.trim()) {
        throw new Error('Current password is required')
      }
      if (!data.newPassword?.trim()) {
        throw new Error('New password is required')
      }
      if (data.newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long')
      }

      // Password strength validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
      if (!passwordRegex.test(data.newPassword)) {
        throw new Error(
          'New password must contain at least one uppercase letter, one lowercase letter, and one number',
        )
      }

      const response = await api.put('/api/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })

      console.log('Password change response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Password change error:', error)
      throw error
    }
  },

  // Upload profile image to Supabase Storage
  async uploadProfileImage(file: File): Promise<ProfileResponse> {
    try {
      console.log('Uploading profile image to Supabase Storage...', {
        name: file.name,
        size: file.size,
        type: file.type,
      })

      // Client-side validation
      if (!file) {
        throw new Error('No file selected')
      }

      // File size validation (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB')
      }

      // File type validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File must be an image (JPEG, PNG, GIF, or WebP)')
      }

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('logo', file)

      const response = await api.post('/api/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for file uploads
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(`Upload progress: ${percentCompleted}%`)
          }
        },
      })

      console.log('Image upload response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Image upload error:', error)

      // Handle specific file upload errors
      if (error.message?.includes('413') || error.message?.includes('too large')) {
        throw new Error('File is too large. Please choose a file smaller than 5MB')
      }
      if (error.message?.includes('timeout')) {
        throw new Error('Upload timeout. Please check your connection and try again')
      }
      if (error.message?.includes('network')) {
        throw new Error('Network error. Please check your connection and try again')
      }
      if (error.message?.includes('Upload failed')) {
        throw new Error('Upload failed. Please try again')
      }

      throw error
    }
  },

  // Remove profile image from Supabase Storage
  async removeProfileImage(): Promise<ProfileResponse> {
    try {
      console.log('Removing profile image from Supabase Storage...')
      const response = await api.delete('/api/auth/avatar')
      console.log('Image removal response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Image removal error:', error)
      throw error
    }
  },

  // Helper function to get optimized image URL
  getOptimizedImageUrl(
    originalUrl: string,
    options?: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'jpeg' | 'png'
    },
  ): string {
    if (!originalUrl) return ''

    // If it's a Supabase URL, we can add transformation parameters
    if (originalUrl.includes('supabase.co/storage')) {
      const { width, height, quality = 80, format } = options || {}

      // Add transformation parameters to URL
      const url = new URL(originalUrl)
      if (width) url.searchParams.set('width', width.toString())
      if (height) url.searchParams.set('height', height.toString())
      if (quality) url.searchParams.set('quality', quality.toString())
      if (format) url.searchParams.set('format', format)

      return url.toString()
    }

    return originalUrl
  },

  // Validate image file before upload
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // File size check (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' }
    }

    // File type check
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File must be an image (JPEG, PNG, GIF, or WebP)' }
    }

    // File name check
    if (!file.name || file.name.length > 255) {
      return { valid: false, error: 'Invalid file name' }
    }

    return { valid: true }
  },
}
