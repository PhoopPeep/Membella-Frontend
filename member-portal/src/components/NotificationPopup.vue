<template>
  <Transition name="notification" appear>
    <div
      v-if="isVisible"
      class="notification-overlay"
      @click="handleOverlayClick"
    >
      <div
        class="notification-popup"
        :class="notificationClass"
        @click.stop
      >
        <!-- Close Button -->
        <button
          class="notification-close"
          @click="close"
          aria-label="Close notification"
        >
          <FontAwesomeIcon :icon="['fas', 'times']" />
        </button>

        <!-- Icon -->
        <div class="notification-icon">
          <FontAwesomeIcon
            v-if="type === 'success'"
            :icon="['fas', 'check-circle']"
            class="text-green-500"
          />
          <FontAwesomeIcon
            v-else-if="type === 'error'"
            :icon="['fas', 'exclamation-circle']"
            class="text-red-500"
          />
          <FontAwesomeIcon
            v-else-if="type === 'warning'"
            :icon="['fas', 'exclamation-triangle']"
            class="text-yellow-500"
          />
          <FontAwesomeIcon
            v-else-if="type === 'info'"
            :icon="['fas', 'info-circle']"
            class="text-blue-500"
          />
          <FontAwesomeIcon
            v-else
            :icon="['fas', 'bell']"
            class="text-gray-500"
          />
        </div>

        <!-- Content -->
        <div class="notification-content">
          <h3 class="notification-title">
            {{ title }}
          </h3>
          <p class="notification-message">
            {{ message }}
          </p>

          <!-- Additional Details -->
          <div v-if="details" class="notification-details">
            <div v-for="(value, key) in details" :key="key" class="detail-item">
              <span class="detail-label">{{ formatLabel(key) }}:</span>
              <span class="detail-value">{{ value }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div v-if="showActions" class="notification-actions">
            <button
              v-if="showConfirm"
              class="btn btn-primary"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
            <button
              v-if="showCancel"
              class="btn btn-secondary"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div
          v-if="autoClose && duration > 0"
          class="notification-progress"
        >
          <div
            class="progress-bar"
            :style="{ animationDuration: `${duration}ms` }"
          ></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

interface NotificationDetails {
  [key: string]: string | number | boolean
}

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info' | 'default'
  title: string
  message: string
  details?: NotificationDetails
  duration?: number // Auto close duration in ms (0 = no auto close)
  showConfirm?: boolean
  showCancel?: boolean
  confirmText?: string
  cancelText?: string
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  duration: 0,
  showConfirm: false,
  showCancel: false,
  confirmText: 'OK',
  cancelText: 'Cancel',
  closeOnOverlay: true,
  closeOnEscape: true
})

const emit = defineEmits<Emits>()

const isVisible = ref(false)
const autoClose = ref(props.duration > 0)
let timeoutId: number | null = null

const notificationClass = computed(() => ({
  'notification-success': props.type === 'success',
  'notification-error': props.type === 'error',
  'notification-warning': props.type === 'warning',
  'notification-info': props.type === 'info',
  'notification-default': props.type === 'default'
}))

const showActions = computed(() => props.showConfirm || props.showCancel)

const formatLabel = (key: string): string => {
  const labelMap: { [key: string]: string } = {
    paymentId: 'Payment ID',
    planName: 'Plan Name',
    amount: 'Amount',
    status: 'Status',
    transactionId: 'Transaction ID',
    subscriptionId: 'Subscription ID',
    organization: 'Organization',
    memberName: 'Member Name',
    memberEmail: 'Member Email'
  }
  return labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

const close = () => {
  isVisible.value = false
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close()
  }
}

const handleConfirm = () => {
  emit('confirm')
  close()
}

const handleCancel = () => {
  emit('cancel')
  close()
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEscape) {
    close()
  }
}

const startAutoClose = () => {
  if (autoClose.value && props.duration > 0) {
    timeoutId = window.setTimeout(() => {
      close()
    }, props.duration)
  }
}

const show = () => {
  isVisible.value = true
  startAutoClose()
}

// Watch for visibility changes
watch(isVisible, (newValue) => {
  if (newValue) {
    startAutoClose()
  }
})

onMounted(() => {
  if (props.closeOnEscape) {
    document.addEventListener('keydown', handleEscape)
  }
  show()
})

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  if (props.closeOnEscape) {
    document.removeEventListener('keydown', handleEscape)
  }
})

// Expose methods for parent component
defineExpose({
  show,
  close
})
</script>

<style scoped>
.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.notification-popup {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid #e5e7eb;
}

.notification-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s;
  z-index: 10;
}

.notification-close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.notification-icon {
  display: flex;
  justify-content: center;
  padding: 24px 24px 16px;
  font-size: 48px;
}

.notification-content {
  padding: 0 24px 24px;
  text-align: center;
}

.notification-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #111827;
}

.notification-message {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 16px;
  line-height: 1.5;
}

.notification-details {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.detail-value {
  color: #6b7280;
  font-size: 14px;
  font-family: 'Courier New', monospace;
}

.notification-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 80px;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #3b82f6;
  animation: progress linear forwards;
  transform-origin: left;
}

@keyframes progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Type-specific styles */
.notification-success {
  border-left: 4px solid #10b981;
}

.notification-error {
  border-left: 4px solid #ef4444;
}

.notification-warning {
  border-left: 4px solid #f59e0b;
}

.notification-info {
  border-left: 4px solid #3b82f6;
}

.notification-default {
  border-left: 4px solid #6b7280;
}

/* Animation */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.notification-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

/* Responsive */
@media (max-width: 640px) {
  .notification-popup {
    margin: 0 16px;
    max-width: none;
  }

  .notification-content {
    padding: 0 16px 16px;
  }

  .notification-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
