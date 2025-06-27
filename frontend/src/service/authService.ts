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
    console.log('📤 Sending registration request:', { ...userData, password: '[REDACTED]' })

    const response = await api.post('/api/auth/register', userData)
    console.log('📥 Registration response:', response.data)

    return response.data
  } catch (error: any) {
    console.error('❌ Registration service error:', error)

    // Handle axios error response
    if (error.response?.data?.message) {
      // Check for specific error types
      const errorMessage = error.response.data.message

      return {
        message: errorMessage,
        requiresVerification: error.response.data.requiresVerification || false,
        rateLimited: error.response.data.rateLimited || errorMessage.includes('rate limit') || errorMessage.includes('Too many'),
        emailError: error.response.data.emailError || false
      }
    } else if (error.message) {
      throw new Error(error.message)
    } else {
      throw new Error('Registration failed - network error')
    }
  }
}

export const login = async (userData: LoginData): Promise<AuthResponse> => {
  try {
    console.log('📤 Sending login request for:', userData.email)

    const response = await api.post('/api/auth/login', userData)
    console.log('📥 Login response:', response.data)

    return response.data
  } catch (error: any) {
    console.error('❌ Login service error:', error)

    // Handle axios error response
    if (error.response?.data?.message) {
      const errorMessage = error.response.data.message

      return {
        message: errorMessage,
        requiresVerification: error.response.data.requiresVerification || errorMessage.includes('verify'),
        rateLimited: error.response.data.rateLimited || errorMessage.includes('rate limit') || errorMessage.includes('Too many')
      }
    } else if (error.message) {
      throw new Error(error.message)
    } else {
      throw new Error('Login failed - network error')
    }
  }
}

export const resendVerification = async (email: string): Promise<AuthResponse> => {
  try {
    console.log('📤 Sending resend verification request for:', email)

    const response = await api.post('/api/auth/resend-verification', { email })
    console.log('📥 Resend verification response:', response.data)

    return response.data
  } catch (error: any) {
    console.error('❌ Resend verification service error:', error)

    if (error.response?.data?.message) {
      const errorMessage = error.response.data.message

      return {
        message: errorMessage,
        rateLimited: error.response.data.rateLimited || errorMessage.includes('rate limit') || errorMessage.includes('Too many')
      }
    } else if (error.message) {
      throw new Error(error.message)
    } else {
      throw new Error('Failed to resend verification email')
    }
  }
}

export const handleAuthCallback = async (accessToken: string, refreshToken: string): Promise<AuthResponse> => {
  try {
    console.log('📤 Sending auth callback request')

    const response = await api.post('/api/auth/callback', {
      access_token: accessToken,
      refresh_token: refreshToken
    })

    console.log('📥 Auth callback response:', response.data)
    return response.data
  } catch (error: any) {
    console.error('❌ Auth callback service error:', error)

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else if (error.message) {
      throw new Error(error.message)
    } else {
      throw new Error('Authentication callback failed')
    }
  }
}

// Initialize Supabase auth state listener
export const initSupabaseAuth = (onAuthStateChange: (session: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Supabase auth state change:', event, session?.user?.id)
    onAuthStateChange(session)
  })
}

// Helper function to check if user needs email verification
export const checkEmailVerificationStatus = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('❌ Error checking session:', error)
      return false
    }

    if (!session || !session.user) {
      return false
    }

    return !!session.user.email_confirmed_at
  } catch (error) {
    console.error('❌ Error checking email verification status:', error)
    return false
  }
}

// Helper function to get current Supabase session
export const getCurrentSupabaseSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('❌ Error getting current session:', error)
      return null
    }

    return session
  } catch (error) {
    console.error('❌ Error getting current session:', error)
    return null
  }
}