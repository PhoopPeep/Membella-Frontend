import { apiClient } from './client';
import type { Feature, CreateFeatureData, UpdateFeatureData } from '@/types/features';
import type { ApiResponse } from '@/types/common';

export class FeaturesApi {
  async getFeatures(): Promise<Feature[]> {
    const response = await apiClient.get<ApiResponse<Feature[]>>('/api/features');
    return response.data || response as any; // Handle both response formats
  }

  async getFeatureById(id: string): Promise<Feature> {
    const response = await apiClient.get<ApiResponse<Feature>>(`/api/features/${id}`);
    return response.data || response as any;
  }

  async createFeature(data: CreateFeatureData): Promise<ApiResponse<Feature>> {
    return await apiClient.post<ApiResponse<Feature>>('/api/features', data);
  }

  async updateFeature(id: string, data: UpdateFeatureData): Promise<ApiResponse<Feature>> {
    return await apiClient.put<ApiResponse<Feature>>(`/api/features/${id}`, data);
  }

  async deleteFeature(id: string): Promise<ApiResponse> {
    return await apiClient.delete<ApiResponse>(`/api/features/${id}`);
  }
}

export const featuresApi = new FeaturesApi();
