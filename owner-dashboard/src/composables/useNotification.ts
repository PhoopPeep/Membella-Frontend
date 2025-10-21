import { ref } from 'vue';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

const notifications = ref<Notification[]>([]);

export function useNotification() {
  const showNotification = (
    type: Notification['type'],
    message: string,
    title?: string,
    duration = 5000
  ) => {
    const id = Math.random().toString(36).slice(2, 11);
    const notification: Notification = {
      id,
      type,
      title: title || type.charAt(0).toUpperCase() + type.slice(1),
      message,
      duration
    };

    notifications.value.push(notification);

    // Auto remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  const clearAllNotifications = () => {
    notifications.value = [];
  };

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications
  };
}
