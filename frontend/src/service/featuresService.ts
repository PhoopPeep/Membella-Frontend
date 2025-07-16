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
  success: boolean
  message: string
  data?: Feature
}

export interface FeaturesListResponse {
  success: boolean
  data: Feature[]
}

export const featuresService = {
  // Get all features
  async getFeatures(): Promise<Feature[]> {
    try {
      console.log('Fetching features...')
      const response = await api.get('/api/features')
      console.log('Features response:', response.data)

      // Handle both old and new response formats
      if (response.data.success && response.data.data) {
        return response.data.data
      } else if (Array.isArray(response.data)) {
        // Old format compatibility
        return response.data
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error: any) {
      console.error('Get features error:', error)
      throw error
    }
  },

  // Get feature by ID
  async getFeatureById(id: string): Promise<Feature> {
    try {
      console.log('Fetching feature:', id)
      const response = await api.get(`/api/features/${id}`)
      console.log('Feature response:', response.data)

      // Handle both old and new response formats
      if (response.data.success && response.data.data) {
        return response.data.data
      } else if (response.data.feature_id) {
        // Old format compatibility
        return response.data
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error: any) {
      console.error('Get feature error:', error)
      throw error
    }
  },

  // Create new feature
  async createFeature(data: CreateFeatureData): Promise<FeatureResponse> {
    try {
      console.log('Creating feature:', data)

      // Validate input
      if (!data.name?.trim()) {
        throw new Error('Feature name is required')
      }
      if (!data.description?.trim()) {
        throw new Error('Feature description is required')
      }
      if (data.name.trim().length < 2) {
        throw new Error('Feature name must be at least 2 characters long')
      }
      if (data.description.trim().length < 10) {
        throw new Error('Feature description must be at least 10 characters long')
      }

      const response = await api.post('/api/features', {
        name: data.name.trim(),
        description: data.description.trim(),
      })

      console.log('Create feature response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Create feature error:', error)
      throw error
    }
  },

  // Update feature
  async updateFeature(id: string, data: UpdateFeatureData): Promise<FeatureResponse> {
    try {
      console.log('Updating feature:', id, data)

      // Validate input
      if (!data.name?.trim()) {
        throw new Error('Feature name is required')
      }
      if (!data.description?.trim()) {
        throw new Error('Feature description is required')
      }
      if (data.name.trim().length < 2) {
        throw new Error('Feature name must be at least 2 characters long')
      }
      if (data.description.trim().length < 10) {
        throw new Error('Feature description must be at least 10 characters long')
      }

      const response = await api.put(`/api/features/${id}`, {
        name: data.name.trim(),
        description: data.description.trim(),
      })

      console.log('Update feature response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Update feature error:', error)
      throw error
    }
  },

  // Delete feature
  async deleteFeature(id: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Deleting feature:', id)
      const response = await api.delete(`/api/features/${id}`)
      console.log('Delete feature response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Delete feature error:', error)
      throw error
    }
  },
}
