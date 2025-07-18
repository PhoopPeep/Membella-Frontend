import { ref, computed } from 'vue';
import { featuresApi } from '@/api/features';
import type { Feature, CreateFeatureData, UpdateFeatureData } from '@/types/features';

export const useFeatures = () => {
  const features = ref<Feature[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const loadFeatures = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      features.value = await featuresApi.getFeatures();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load features';
    } finally {
      isLoading.value = false;
    }
  };

  const getFeatureById = async (id: string): Promise<Feature | null> => {
    try {
      return await featuresApi.getFeatureById(id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load feature';
      return null;
    }
  };

  const createFeature = async (data: CreateFeatureData): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await featuresApi.createFeature(data);
      if (response.success) {
        await loadFeatures(); // Refresh the list
        return true;
      }
      return false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create feature';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const updateFeature = async (id: string, data: UpdateFeatureData): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await featuresApi.updateFeature(id, data);
      if (response.success) {
        await loadFeatures(); // Refresh the list
        return true;
      }
      return false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update feature';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteFeature = async (id: string): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await featuresApi.deleteFeature(id);
      if (response.success) {
        features.value = features.value.filter(f => f.feature_id !== id);
        return true;
      }
      return false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete feature';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    features: computed(() => features.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadFeatures,
    getFeatureById,
    createFeature,
    updateFeature,
    deleteFeature,
  };
};
