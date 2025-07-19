import api from '../router/api'
import { supabase } from '../lib/supabase'

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
  supabaseSession?: any
}

export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    console.log('Sending registration request:', { ...userData, password: '[REDACTED]' })

    // Client-side validation
    if (!userData.org_name?.trim()) {
      throw new Error('Organization name is required')
    }
    if (!userData.email?.trim()) {
      throw new Error('Email is required')
    }
    if (!userData.password?.trim()) {
      throw new Error('Password is required')
    }

    // Additional validation
    if (userData.org_name.trim().length < 2) {
      throw new Error('Organization name must be at least 2 characters long')
    }
    if (userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email.trim())) {
      throw new Error('Please enter a valid email address')
    }

    // // Password strength validation
    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    // if (!passwordRegex.test(userData.password)) {
    //   throw new Error(
    //     'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    //   )
    // }

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
  } catch (error: any) {
    console.error('Registration service error:', error)

    // Return structured error response
    return {
      success: false,
      message: error.message,
      requiresVerification: false,
      rateLimited: error.message.includes('rate limit') || error.message.includes('Too many'),
      emailError: error.message.includes('email') && !error.message.includes('verify'),
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
  } catch (error: any) {
    console.error('Login service error:', error)

    // Return structured error response
    return {
      success: false,
      message: error.message,
      requiresVerification:
        error.message.includes('verify') || error.message.includes('confirmation'),
      rateLimited: error.message.includes('rate limit') || error.message.includes('Too many'),
    }
  }
}

export const resendVerification = async (email: string): Promise<AuthResponse> => {
  try {
    console.log('Sending resend verification request for:', email)

    // Client-side validation
    if (!email?.trim()) {
      throw new Error('Email is required')
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      throw new Error('Please enter a valid email address')
    }

    const response = await api.post('/api/auth/resend-verification', {
      email: email.trim().toLowerCase(),
    })

    console.log('Resend verification response:', response.data)
    return response.data
  } catch (error: any) {
    console.error('Resend verification service error:', error)

    // Return structured error response
    return {
      success: false,
      message: error.message,
      rateLimited: error.message.includes('rate limit') || error.message.includes('Too many'),
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
  } catch (error: any) {
    console.error('Auth callback service error:', error)
    throw error
  }
}

// Initialize Supabase auth state listener
export const initSupabaseAuth = (onAuthStateChange: (session: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth state change:', event, session?.user?.id)
    onAuthStateChange(session)
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
