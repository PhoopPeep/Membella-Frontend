import api from '../router/api'

export interface Feature {
  feature_id: string
  name: string
  description: string
  create_at: string
  update_at: string
  delete_at?: string | null
}

export interface CreateFeatureData {
  name: string
  description: string
}

export interface UpdateFeatureData {
  name: string
  description: string
}

export interface FeatureResponse {
  message: string
  feature?: Feature
}

export const featuresService = {
  // Get all features
  async getFeatures(): Promise<Feature[]> {
    try {
      const response = await api.get('/api/features')
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to fetch features')
    }
  },

  // Get feature by ID
  async getFeatureById(id: string): Promise<Feature> {
    try {
      const response = await api.get(`/api/features/${id}`)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to fetch feature')
    }
  },

  // Create new feature
  async createFeature(data: CreateFeatureData): Promise<FeatureResponse> {
    try {
      const response = await api.post('/api/features', data)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to create feature')
    }
  },

  // Update feature
  async updateFeature(id: string, data: UpdateFeatureData): Promise<FeatureResponse> {
    try {
      const response = await api.put(`/api/features/${id}`, data)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to update feature')
    }
  },

  // Delete feature
  async deleteFeature(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/api/features/${id}`)
      return response.data
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error('Failed to delete feature')
    }
  }
}