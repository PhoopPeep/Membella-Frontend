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
  supabaseSession?: any
}

export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post('/api/auth/register', userData)
    return response.data
  } catch (error: any) {
    // Handle axios error response
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else if (error.message) {
      throw new Error(error.message)
    } else {
      throw new Error('Registration failed - network error')
    }
  }
}

export const login = async (userData: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post('/api/auth/login', userData)
    return response.data
  } catch (error: any) {
    // Handle axios error response
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else if (error.message) {
      throw new Error(error.message)
    } else {
      throw new Error('Login failed - network error')
    }
  }
}

export const resendVerification = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await api.post('/api/auth/resend-verification', { email })
    return response.data
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    } else if (error.message) {
      throw new Error(error.message)
    } else {
      throw new Error('Failed to resend verification email')
    }
  }
}

export const handleAuthCallback = async (accessToken: string, refreshToken: string): Promise<AuthResponse> => {
  try {
    const response = await api.post('/api/auth/callback', {
      access_token: accessToken,
      refresh_token: refreshToken
    })
    return response.data
  } catch (error: any) {
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
    onAuthStateChange(session)
  })
}