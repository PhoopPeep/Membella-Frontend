<template>
  <div class="notification-container">
    <NotificationPopup
      v-for="notification in notifications"
      :key="notification.id"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      :details="notification.details"
      :duration="notification.duration"
      :show-confirm="notification.showConfirm"
      :show-cancel="notification.showCancel"
      :confirm-text="notification.confirmText"
      :cancel-text="notification.cancelText"
      :close-on-overlay="notification.closeOnOverlay"
      :close-on-escape="notification.closeOnEscape"
      @confirm="handleConfirm(notification)"
      @cancel="handleCancel(notification)"
      @close="handleClose(notification)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import NotificationPopup from './NotificationPopup.vue'
import notificationService, { type NotificationCallbacks } from '../services/notificationService'

// Define component name for proper export
defineOptions({
  name: 'NotificationContainer'
})

const notifications = computed(() => notificationService.getNotifications().value)

const handleConfirm = (notification: any) => {
  if (notification.callbacks?.onConfirm) {
    notification.callbacks.onConfirm()
  }
  notificationService.remove(notification.id)
}

const handleCancel = (notification: any) => {
  if (notification.callbacks?.onCancel) {
    notification.callbacks.onCancel()
  }
  notificationService.remove(notification.id)
}

const handleClose = (notification: any) => {
  if (notification.callbacks?.onClose) {
    notification.callbacks.onClose()
  }
  notificationService.remove(notification.id)
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
}

.notification-container > * {
  pointer-events: auto;
}
</style>
