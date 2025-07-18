import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Feature } from '@/types/features';

export const useFeaturesStore = defineStore('features', () => {
  const features = ref<Feature[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const getFeatureById = computed(() => {
    return (id: string) => features.value.find(f => f.feature_id === id);
  });

  const setFeatures = (newFeatures: Feature[]) => {
    features.value = newFeatures;
  };

  const addFeature = (feature: Feature) => {
    features.value.unshift(feature);
  };

  const updateFeature = (id: string, updatedFeature: Feature) => {
    const index = features.value.findIndex(f => f.feature_id === id);
    if (index !== -1) {
      features.value[index] = updatedFeature;
    }
  };

  const removeFeature = (id: string) => {
    features.value = features.value.filter(f => f.feature_id !== id);
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage;
  };

  return {
    features: computed(() => features.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    getFeatureById,
    setFeatures,
    addFeature,
    updateFeature,
    removeFeature,
    setLoading,
    setError,
  };
});
