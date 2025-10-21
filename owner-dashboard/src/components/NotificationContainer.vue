<template>
  <div class="fixed top-20 right-4 z-50 space-y-3 max-w-md">
    <!-- Show count if more than max visible -->
    <div
      v-if="notifications.length > maxVisible"
      class="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg text-center"
    >
      + {{ notifications.length - maxVisible }} more notification{{ notifications.length - maxVisible > 1 ? 's' : '' }}
    </div>

    <TransitionGroup name="notification" tag="div" class="space-y-2">
      <div
        v-for="notification in visibleNotifications"
        :key="notification.id"
        :class="[
          'w-full bg-white shadow-xl rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 hover:scale-105',
          getNotificationClasses(notification.type)
        ]"
      >
        <div class="p-3">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <component
                :is="getNotificationIcon(notification.type)"
                :class="getIconClasses(notification.type)"
                class="h-5 w-5"
              />
            </div>
            <div class="ml-3 flex-1 pt-0.5">
              <p class="text-sm font-semibold text-gray-900 line-clamp-1">
                {{ notification.title }}
              </p>
              <p class="mt-1 text-xs text-gray-600 line-clamp-2">
                {{ notification.message }}
              </p>
            </div>
            <div class="ml-3 flex-shrink-0">
              <button
                @click="removeNotification(notification.id)"
                class="rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <span class="sr-only">Close</span>
                <XMarkIcon class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Progress bar -->
          <div
            v-if="notification.duration && notification.duration > 0"
            class="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden"
          >
            <div
              class="h-full transition-all ease-linear"
              :class="getProgressBarClass(notification.type)"
              :style="{
                width: '100%',
                animation: `shrink ${notification.duration}ms linear forwards`
              }"
            ></div>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNotification } from '../composables/useNotification';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

const { notifications, removeNotification } = useNotification();

// Limit to 3 visible notifications
const maxVisible = 3;
const visibleNotifications = computed(() =>
  notifications.value.slice(0, maxVisible)
);

const getNotificationClasses = (type: string) => {
  const classes = {
    success: 'border-l-4 border-green-500 bg-green-50',
    error: 'border-l-4 border-red-500 bg-red-50',
    warning: 'border-l-4 border-yellow-500 bg-yellow-50',
    info: 'border-l-4 border-blue-500 bg-blue-50'
  };
  return classes[type as keyof typeof classes] || classes.info;
};

const getNotificationIcon = (type: string) => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };
  return icons[type as keyof typeof icons] || InformationCircleIcon;
};

const getIconClasses = (type: string) => {
  const classes = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };
  return classes[type as keyof typeof classes] || classes.info;
};

const getProgressBarClass = (type: string) => {
  const classes = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  return classes[type as keyof typeof classes] || classes.info;
};
</script>

<style scoped>
/* Line clamp utilities */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Notification animations */
.notification-enter-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Progress bar shrink animation */
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
