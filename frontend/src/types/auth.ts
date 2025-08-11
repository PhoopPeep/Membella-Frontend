import type { Session } from '@supabase/supabase-js'

export interface User {
  owner_id: string
  org_name: string
  email: string
  description?: string
  contact_info?: string
  logo?: string
  create_at?: string
  update_at?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  org_name: string
  email: string
  password: string
  description?: string
  contact_info?: string
  logo?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: User
  requiresVerification?: boolean
  rateLimited?: boolean
  supabaseSession?: Session
}
