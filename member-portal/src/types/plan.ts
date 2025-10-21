import type { Feature } from './subscription'

export interface Plan {
  id: string
  name: string
  description: string
  price: number
  duration: number
  features: Feature[]
  organization: string
  organizationEmail?: string
  organizationContact?: string
  createdAt?: string
  updatedAt?: string
}

export interface PlanWithOrganization extends Plan {
  organizationName: string
  organizationLogo?: string
}

export type TableRecord = Record<string, string | number | boolean | Date | null | undefined>

