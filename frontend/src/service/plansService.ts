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
  message: string
  plan?: Plan
}

export const plansService = {
  // Get all plans
  async getPlans(): Promise<Plan[]> {
    try {
      const response = await api.get('/api/plans')
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to fetch plans')
    }
  },

  // Get plan by ID
  async getPlanById(id: string): Promise<Plan> {
    try {
      const response = await api.get(`/api/plans/${id}`)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to fetch plan')
    }
  },

  // Create new plan
  async createPlan(data: CreatePlanData): Promise<PlanResponse> {
    try {
      const response = await api.post('/api/plans', data)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to create plan')
    }
  },

  // Update plan
  async updatePlan(id: string, data: UpdatePlanData): Promise<PlanResponse> {
    try {
      const response = await api.put(`/api/plans/${id}`, data)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to update plan')
    }
  },

  // Delete plan
  async deletePlan(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/api/plans/${id}`)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to delete plan')
    }
  }
}