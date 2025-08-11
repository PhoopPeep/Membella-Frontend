import api from '../router/api'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

export interface RegisterData {
  org_name: string
  email: string
  password: string
  description?: string
  contact_info?: string
  logo?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: {
    owner_id: string
    org_name: string
    email: string
    description?: string
    contact_info?: string
    logo?: string
  }
  requiresVerification?: boolean
  rateLimited?: boolean
  emailError?: boolean
  supabaseSession?: Session
}

export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    console.log('Sending registration request:', { ...userData, password: '[REDACTED]' })

    const response = await api.post('/api/auth/register', {
      org_name: userData.org_name.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      description: userData.description?.trim() || undefined,
      contact_info: userData.contact_info?.trim() || undefined,
      logo: userData.logo || undefined,
    })

    console.log('Registration response:', response.data)
    return response.data
  } catch (error: unknown) {
    console.error('Registration service error:', error)
    if (error instanceof Error && error.message.includes('Email rate limit exceeded')) {
      return {
        success: false,
        message:
          'Email sending limit reached. Please wait 1 hour and try again, or contact support to set up custom SMTP.',
        requiresVerification: false,
        rateLimited: true,
        emailError: false,
      }
    }

    if (error instanceof Error && error.message.includes('already registered')) {
      return {
        success: false,
        message: 'This email is already registered. Please try logging in instead.',
        requiresVerification: false,
        rateLimited: false,
        emailError: true,
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      requiresVerification: false,
      rateLimited:
        error instanceof Error &&
        (error.message.includes('rate limit') || error.message.includes('Too many')),
      emailError:
        error instanceof Error &&
        error.message.includes('email') &&
        !error.message.includes('verify'),
    }
  }
}

export const login = async (userData: LoginData): Promise<AuthResponse> => {
  try {
    console.log('Sending login request for:', userData.email)

    // Client-side validation
    if (!userData.email?.trim()) {
      throw new Error('Email is required')
    }
    if (!userData.password?.trim()) {
      throw new Error('Password is required')
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email.trim())) {
      throw new Error('Please enter a valid email address')
    }

    const response = await api.post('/api/auth/login', {
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
    })

    console.log('Login response:', response.data)
    return response.data
  } catch (error: unknown) {
    console.error('Login service error:', error)

    // Return structured error response
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Login failed. Please try again.',
      requiresVerification:
        error instanceof Error &&
        (error.message.includes('verify') || error.message.includes('confirmation')),
      rateLimited:
        error instanceof Error &&
        (error.message.includes('rate limit') || error.message.includes('Too many')),
    }
  }
}

export const resendVerification = async (email: string): Promise<AuthResponse> => {
  try {
    console.log('Sending resend verification request for:', email)

    // Client-side validation

    const response = await api.post('/api/auth/resend-verification', {
      email: email.trim().toLowerCase(),
    })

    console.log('Resend verification response:', response.data)
    return response.data
  } catch (error: unknown) {
    console.error('Resend verification service error:', error)

    if (error instanceof Error && error.message.includes('Email rate limit exceeded')) {
      return {
        success: false,
        message: 'Please wait at least 60 seconds before requesting another verification email.',
        rateLimited: true,
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to resend verification email.',
      rateLimited:
        error instanceof Error &&
        (error.message.includes('rate limit') || error.message.includes('Too many')),
    }
  }
}

export const handleAuthCallback = async (
  accessToken: string,
  refreshToken: string,
): Promise<AuthResponse> => {
  try {
    console.log('Sending auth callback request')

    const response = await api.post('/api/auth/callback', {
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    console.log('Auth callback response:', response.data)
    return response.data
  } catch (error: unknown) {
    console.error('Auth callback service error:', error)
    throw error
  }
}

// Initialize Supabase auth state listener
export const initSupabaseAuth = (onAuthStateChange: (session: Session) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth state change:', event, session?.user?.id)
    onAuthStateChange(session as Session)
  })
}

// Helper function to check if user needs email verification
export const checkEmailVerificationStatus = async (): Promise<boolean> => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error('Error checking session:', error)
      return false
    }

    if (!session || !session.user) {
      return false
    }

    return !!session.user.email_confirmed_at
  } catch (error) {
    console.error('Error checking email verification status:', error)
    return false
  }
}

// Helper function to get current Supabase session
export const getCurrentSupabaseSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting current session:', error)
      return null
    }

    return session
  } catch (error) {
    console.error('Error getting current session:', error)
    return null
  }
}

export const forgotPassword = async (email: string): Promise<AuthResponse> => {
  try {
    console.log('Sending forgot password request for:', email)

    // Client-side validation
    if (!email?.trim()) {
      throw new Error('Email is required')
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      throw new Error('Please enter a valid email address')
    }

    const response = await api.post('/api/auth/forgot-password', {
      email: email.trim().toLowerCase(),
    })

    console.log('Forgot password response:', response.data)
    return response.data
  } catch (error: unknown) {
    console.error('Forgot password service error:', error)

    if (error instanceof Error && error.message.includes('Email rate limit exceeded')) {
      return {
        success: false,
        message: 'Too many password reset attempts. Please wait at least 60 seconds and try again.',
        rateLimited: true,
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send password reset email.',
      rateLimited:
        error instanceof Error &&
        (error.message.includes('rate limit') || error.message.includes('Too many')),
    }
  }
}

export const resetPassword = async (
  accessToken: string,
  password: string,
): Promise<AuthResponse> => {
  try {
    console.log('Sending reset password request')

    // Client-side validation
    if (!accessToken?.trim()) {
      throw new Error('Invalid reset link')
    }

    if (!password?.trim()) {
      throw new Error('Password is required')
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }

    const response = await api.post('/api/auth/reset-password', {
      access_token: accessToken,
      password: password,
    })

    console.log('Reset password response:', response.data)
    return response.data
  } catch (error: unknown) {
    console.error('Reset password service error:', error)

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reset password.',
      rateLimited:
        error instanceof Error &&
        (error.message.includes('rate limit') || error.message.includes('Too many')),
    }
  }
}

export const verifyResetToken = async (accessToken: string): Promise<AuthResponse> => {
  try {
    console.log('Verifying reset token')

    if (!accessToken?.trim()) {
      throw new Error('Invalid reset link')
    }

    const response = await api.post('/api/auth/verify-reset-token', {
      access_token: accessToken,
    })

    console.log('Verify reset token response:', response.data)
    return response.data
  } catch (error: unknown) {
    console.error('Verify reset token service error:', error)

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Invalid or expired reset link.',
    }
  }
}
