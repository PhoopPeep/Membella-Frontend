import { apiClient } from './client'
import type { LoginData, RegisterData, AuthResponse, User } from '@/types/auth'

export class AuthApi {
  async login(data: LoginData): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>('/api/auth/login', data)
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>('/api/auth/register', data)
  }

  async resendVerification(email: string): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>('/api/auth/resend-verification', { email })
  }

  async getProfile(): Promise<{ user: User }> {
    console.log('AuthApi: Calling /api/auth/profile')
    return await apiClient.get<{ user: User }>('/api/auth/profile')
  }

  async updateProfile(data: Partial<User>): Promise<{ user: User; message: string }> {
    console.log('AuthApi: Calling PUT /api/auth/profile')
    return await apiClient.put<{ user: User; message: string }>('/api/auth/profile', data)
  }

  async changePassword(data: {
    currentPassword: string
    newPassword: string
  }): Promise<{ message: string }> {
    console.log('AuthApi: Calling PUT /api/auth/change-password')
    return await apiClient.put<{ message: string }>('/api/auth/change-password', data)
  }

  async uploadAvatar(file: File): Promise<{ user: User; message: string }> {
    console.log('AuthApi: Calling POST /api/auth/upload-avatar')
    return await apiClient.uploadFile<{ user: User; message: string }>(
      '/api/auth/upload-avatar',
      file,
    )
  }

  async removeAvatar(): Promise<{ user: User; message: string }> {
    console.log('AuthApi: Calling DELETE /api/auth/avatar')
    return await apiClient.delete<{ user: User; message: string }>('/api/auth/avatar')
  }
}

export const authApi = new AuthApi()
