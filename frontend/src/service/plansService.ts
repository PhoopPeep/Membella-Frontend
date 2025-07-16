import api from '../router/api'

export interface Plan {
  id: string
  name: string
  description: string
  price: number
  duration: number
  features: string[]
  createdAt: string
  updatedAt: string
}

export interface CreatePlanData {
  name: string
  description: string
  price: number
  duration: number
  features?: string[]
}

export interface UpdatePlanData {
  name: string
  description: string
  price: number
  duration: number
  features?: string[]
}

export interface PlanResponse {
  success: boolean
  message: string
  plan?: Plan
}

export const plansService = {
  // Get all plans
  async getPlans(): Promise<Plan[]> {
    try {
      console.log('Fetching plans...')
      const response = await api.get('/api/plans')
      console.log('Plans response:', response.data)

      // Handle response - assume array format for now
      if (Array.isArray(response.data)) {
        return response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error: any) {
      console.error('Get plans error:', error)
      throw error
    }
  },

  // Get plan by ID
  async getPlanById(id: string): Promise<Plan> {
    try {
      console.log('Fetching plan:', id)
      const response = await api.get(`/api/plans/${id}`)
      console.log('Plan response:', response.data)

      if (response.data.id || response.data.plan_id) {
        return response.data
      } else if (response.data.data) {
        return response.data.data
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error: any) {
      console.error('Get plan error:', error)
      throw error
    }
  },

  // Create new plan
  async createPlan(data: CreatePlanData): Promise<PlanResponse> {
    try {
      console.log('Creating plan:', data)

      // Validate input
      if (!data.name?.trim()) {
        throw new Error('Plan name is required')
      }
      if (!data.description?.trim()) {
        throw new Error('Plan description is required')
      }
      if (data.price === null || data.price === undefined || data.price < 0) {
        throw new Error('Valid price is required')
      }
      if (!data.duration || data.duration < 1) {
        throw new Error('Duration must be at least 1 day')
      }
      if (!data.features || data.features.length === 0) {
        throw new Error('At least one feature must be selected')
      }

      // Additional validation
      if (data.name.trim().length < 2) {
        throw new Error('Plan name must be at least 2 characters long')
      }
      if (data.description.trim().length < 10) {
        throw new Error('Plan description must be at least 10 characters long')
      }
      if (data.price > 999999) {
        throw new Error('Price cannot exceed $999,999')
      }
      if (data.duration > 3650) {
        throw new Error('Duration cannot exceed 10 years')
      }

      const response = await api.post('/api/plans', {
        name: data.name.trim(),
        description: data.description.trim(),
        price: Number(data.price),
        duration: Number(data.duration),
        features: data.features || [],
      })

      console.log('Create plan response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Create plan error:', error)
      throw error
    }
  },

  // Update plan
  async updatePlan(id: string, data: UpdatePlanData): Promise<PlanResponse> {
    try {
      console.log('Updating plan:', id, data)

      // Validate input
      if (!data.name?.trim()) {
        throw new Error('Plan name is required')
      }
      if (!data.description?.trim()) {
        throw new Error('Plan description is required')
      }
      if (data.price === null || data.price === undefined || data.price < 0) {
        throw new Error('Valid price is required')
      }
      if (!data.duration || data.duration < 1) {
        throw new Error('Duration must be at least 1 day')
      }
      if (!data.features || data.features.length === 0) {
        throw new Error('At least one feature must be selected')
      }

      // Additional validation
      if (data.name.trim().length < 2) {
        throw new Error('Plan name must be at least 2 characters long')
      }
      if (data.description.trim().length < 10) {
        throw new Error('Plan description must be at least 10 characters long')
      }
      if (data.price > 999999) {
        throw new Error('Price cannot exceed $999,999')
      }
      if (data.duration > 3650) {
        throw new Error('Duration cannot exceed 10 years')
      }

      const response = await api.put(`/api/plans/${id}`, {
        name: data.name.trim(),
        description: data.description.trim(),
        price: Number(data.price),
        duration: Number(data.duration),
        features: data.features || [],
      })

      console.log('Update plan response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Update plan error:', error)
      throw error
    }
  },

  // Delete plan
  async deletePlan(id: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Deleting plan:', id)
      const response = await api.delete(`/api/plans/${id}`)
      console.log('Delete plan response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Delete plan error:', error)
      throw error
    }
  },
}
