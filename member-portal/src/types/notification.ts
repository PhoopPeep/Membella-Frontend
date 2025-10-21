export interface NotificationDetails {
  [key: string]: string | number | boolean
}

export interface NotificationOptions {
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

export interface NotificationCallbacks {
  onConfirm?: () => void
  onCancel?: () => void
  onClose?: () => void
}

