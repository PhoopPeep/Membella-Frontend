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
      console.log('📤 Fetching user profile...');
      const response = await api.get('/api/auth/profile');
      console.log('📥 Profile fetch response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Profile fetch error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch profile');
    }
  },

  // Update user profile
  async updateProfile(data: ProfileUpdateData): Promise<ProfileResponse> {
    try {
      console.log('📤 Updating user profile...', { ...data, logo: data.logo ? 'base64 image provided' : 'no image' });
      const response = await api.put('/api/auth/profile', data);
      console.log('📥 Profile update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to update profile');
    }
  },

  // Change password
  async changePassword(data: PasswordChangeData): Promise<{ message: string }> {
    try {
      console.log('📤 Changing password...');
      const response = await api.put('/api/auth/change-password', data);
      console.log('📥 Password change response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Password change error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to change password');
    }
  },

  // Upload profile image
  async uploadProfileImage(file: File): Promise<ProfileResponse> {
    try {
      console.log('📤 Uploading profile image...', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.post('/api/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('📥 Image upload response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Image upload error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to upload profile image');
    }
  },

  // Remove profile image
  async removeProfileImage(): Promise<ProfileResponse> {
    try {
      console.log('📤 Removing profile image...');
      const response = await api.delete('/api/auth/avatar');
      console.log('📥 Image removal response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Image removal error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to remove profile image');
    }
  }
};