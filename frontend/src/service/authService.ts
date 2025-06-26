import api from '../router/api'

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