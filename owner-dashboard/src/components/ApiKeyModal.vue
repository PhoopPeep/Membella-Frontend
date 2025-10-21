<template>
  <dialog
    v-if="isOpen"
    open
    class="fixed inset-0 z-50 overflow-y-auto bg-transparent"
    aria-labelledby="modal-title"
  >
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="$emit('close')"
      ></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                <KeyIcon class="h-6 w-6 text-indigo-600" />
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {{ isEdit ? 'Edit API Key' : 'Create New API Key' }}
                </h3>
                <div class="mt-4 space-y-4">
                  <!-- Name Field -->
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">
                      API Key Name
                    </label>
                    <input
                      id="name"
                      v-model="form.name"
                      type="text"
                      required
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter API key name"
                    />
                  </div>

                  <!-- Permissions Field -->
                  <div>
                    <span class="block text-sm font-medium text-gray-700 mb-2">
                      Permissions
                    </span>
                    <div class="space-y-2">
                      <label
                        v-for="permission in availablePermissions"
                        :key="permission.value"
                        :for="`permission-${permission.value}`"
                        class="flex items-center"
                      >
                        <input
                          :id="`permission-${permission.value}`"
                          v-model="form.permissions"
                          :value="permission.value"
                          type="checkbox"
                          class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span class="ml-2 text-sm text-gray-700">{{ permission.label }}</span>
                      </label>
                    </div>
                  </div>

                  <!-- Expiration Date -->
                  <div>
                    <label for="expiresAt" class="block text-sm font-medium text-gray-700">
                      Expiration Date (Optional)
                    </label>
                    <input
                      id="expiresAt"
                      v-model="form.expiresAt"
                      type="datetime-local"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <p class="mt-1 text-xs text-gray-500">
                      Leave empty for no expiration
                    </p>
                  </div>

                  <!-- Show generated key if creating -->
                  <div v-if="generatedKey && !isEdit" class="bg-green-50 border border-green-200 rounded-md p-4">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <CheckCircleIcon class="h-5 w-5 text-green-400" />
                      </div>
                      <div class="ml-3">
                        <h3 class="text-sm font-medium text-green-800">
                          API Key Generated Successfully!
                        </h3>
                        <div class="mt-2 text-sm text-green-700">
                          <p class="mb-2">Your new API key:</p>
                          <div class="bg-white border border-green-300 rounded p-2 font-mono text-sm break-all">
                            {{ generatedKey }}
                          </div>
                          <p class="mt-2 text-xs text-green-600">
                            ⚠️ Please copy this key now. You won't be able to see it again!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="loading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              <span v-if="loading" class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {{ isEdit ? 'Updating...' : 'Creating...' }}
              </span>
              <span v-else>{{ isEdit ? 'Update API Key' : 'Create API Key' }}</span>
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { KeyIcon, CheckCircleIcon } from '@heroicons/vue/24/outline';

interface ApiKeyData {
  name: string;
  permissions: string[];
  expires_at?: string;
}

interface SaveData {
  name: string;
  permissions: string[];
  expiresAt: string | null;
}

interface Props {
  isOpen: boolean;
  apiKey?: ApiKeyData;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  save: [data: SaveData];
}>();

const loading = ref(false);
const generatedKey = ref('');

const form = ref({
  name: '',
  permissions: ['features:read'],
  expiresAt: ''
});

const availablePermissions = [
  { value: 'features:read', label: 'Read Features' },
  { value: 'features:write', label: 'Write Features' },
  { value: 'features:delete', label: 'Delete Features' },
  { value: 'plans:read', label: 'Read Plans' },
  { value: 'plans:write', label: 'Write Plans' },
  { value: 'members:read', label: 'Read Members' }
];

const isEdit = computed(() => !!props.apiKey);

// Watch for prop changes
watch(() => props.apiKey, (newApiKey) => {
  if (newApiKey) {
    form.value = {
      name: newApiKey.name,
      permissions: [...newApiKey.permissions],
      expiresAt: newApiKey.expires_at ? new Date(newApiKey.expires_at).toISOString().slice(0, 16) : ''
    };
  } else {
    resetForm();
  }
}, { immediate: true });

// Watch for modal open/close
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && !props.apiKey) {
    resetForm();
  }
});

const resetForm = () => {
  form.value = {
    name: '',
    permissions: ['features:read'],
    expiresAt: ''
  };
  generatedKey.value = '';
};

const handleSubmit = async () => {
  try {
    loading.value = true;

    const data = {
      name: form.value.name,
      permissions: form.value.permissions,
      expiresAt: form.value.expiresAt ? new Date(form.value.expiresAt).toISOString() : null
    };

    // Emit the data and let the parent handle the API call
    emit('save', data);
  } catch (error) {
    console.error('Error saving API key:', error);
  } finally {
    loading.value = false;
  }
};

// Expose method to set generated key (called by parent)
const setGeneratedKey = (key: string) => {
  generatedKey.value = key;
};

defineExpose({
  setGeneratedKey
});
</script>

<script lang="ts">
export default {
  name: 'ApiKeyModal',
}
</script>
