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

