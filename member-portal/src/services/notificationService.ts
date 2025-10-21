import { ref } from 'vue'
import type {
  NotificationDetails,
  NotificationOptions,
  NotificationCallbacks,
} from '../types/notification'

class NotificationService {
  private readonly notifications = ref<Array<NotificationOptions & { id: string; callbacks?: NotificationCallbacks }>>([])
  private nextId = 0

  // Get reactive notifications array
  getNotifications() {
    return this.notifications
  }

  // Show notification
  show(options: NotificationOptions, callbacks?: NotificationCallbacks): string {
    const id = `notification-${++this.nextId}`
    const notification = {
      ...options,
      id,
      callbacks
    }

    this.notifications.value.push(notification)

    // Auto remove after duration if specified
    if (options.duration && options.duration > 0) {
      setTimeout(() => {
        this.remove(id)
      }, options.duration)
    }

    return id
  }

  // Remove notification
  remove(id: string) {
    const index = this.notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      this.notifications.value.splice(index, 1)
    }
  }

  // Clear all notifications
  clear() {
    this.notifications.value = []
  }

  // Success notification
  success(title: string, message: string, details?: NotificationDetails, callbacks?: NotificationCallbacks): string {
    return this.show({
      type: 'success',
      title,
      message,
      details,
      duration: 5000, // Auto close after 5 seconds
      closeOnOverlay: true,
      closeOnEscape: true
    }, callbacks)
  }

  // Error notification
  error(title: string, message: string, details?: NotificationDetails, callbacks?: NotificationCallbacks): string {
    return this.show({
      type: 'error',
      title,
      message,
      details,
      duration: 0, // Don't auto close errors
      closeOnOverlay: true,
      closeOnEscape: true
    }, callbacks)
  }

  // Warning notification
  warning(title: string, message: string, details?: NotificationDetails, callbacks?: NotificationCallbacks): string {
    return this.show({
      type: 'warning',
      title,
      message,
      details,
      duration: 4000, // Auto close after 4 seconds
      closeOnOverlay: true,
      closeOnEscape: true
    }, callbacks)
  }

  // Info notification
  info(title: string, message: string, details?: NotificationDetails, callbacks?: NotificationCallbacks): string {
    return this.show({
      type: 'info',
      title,
      message,
      details,
      duration: 3000, // Auto close after 3 seconds
      closeOnOverlay: true,
      closeOnEscape: true
    }, callbacks)
  }

  // Confirmation dialog
  confirm(
    title: string,
    message: string,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel',
    details?: NotificationDetails
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.show({
        type: 'info',
        title,
        message,
        details,
        duration: 0, // Don't auto close
        showConfirm: true,
        showCancel: true,
        confirmText,
        cancelText,
        closeOnOverlay: false,
        closeOnEscape: true
      }, {
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
        onClose: () => resolve(false)
      })
    })
  }

  // Payment success notification
  paymentSuccess(planName: string, amount: number, paymentId: string, details?: NotificationDetails): string {
    return this.success(
      'Payment Successful! 🎉',
      `Your subscription to "${planName}" has been activated successfully.`,
      {
        planName,
        amount: `฿${amount.toFixed(2)}`,
        paymentId,
        status: 'Success',
        ...details
      }
    )
  }

  // Payment failed notification
  paymentFailed(planName: string, error: string, details?: NotificationDetails): string {
    return this.error(
      'Payment Failed ❌',
      `Failed to process payment for "${planName}". ${error}`,
      {
        planName,
        error,
        status: 'Failed',
        ...details
      }
    )
  }

  // Subscription created notification
  subscriptionCreated(planName: string, organization: string, endDate: string, details?: NotificationDetails): string {
    return this.success(
      'Subscription Created! ✅',
      `You are now subscribed to "${planName}" from ${organization}.`,
      {
        planName,
        organization,
        endDate,
        status: 'Active',
        ...details
      }
    )
  }

  // Subscription cancelled notification
  subscriptionCancelled(planName: string, details?: NotificationDetails): string {
    return this.warning(
      'Subscription Cancelled',
      `Your subscription to "${planName}" has been cancelled.`,
      {
        planName,
        status: 'Cancelled',
        ...details
      }
    )
  }

  // QR code generated notification
  qrCodeGenerated(amount: number, details?: NotificationDetails): string {
    return this.info(
      'QR Code Generated',
      `Please scan the QR code to complete your payment of ฿${amount.toFixed(2)}.`,
      {
        amount: `฿${amount.toFixed(2)}`,
        status: 'Waiting for Payment',
        ...details
      }
    )
  }

  // Payment processing notification
  paymentProcessing(planName: string, details?: NotificationDetails): string {
    return this.info(
      'Processing Payment...',
      `Please wait while we process your payment for "${planName}".`,
      {
        planName,
        status: 'Processing',
        ...details
      }
    )
  }

  // Network error notification
  networkError(details?: NotificationDetails): string {
    return this.error(
      'Network Error',
      'Unable to connect to the server. Please check your internet connection and try again.',
      {
        status: 'Error',
        ...details
      }
    )
  }

  // Validation error notification
  validationError(field: string, message: string, details?: NotificationDetails): string {
    return this.warning(
      'Validation Error',
      `${field}: ${message}`,
      {
        field,
        message,
        status: 'Validation Error',
        ...details
      }
    )
  }
}

// Create singleton instance
const notificationService = new NotificationService()

export default notificationService
