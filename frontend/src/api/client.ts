import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import type { ApiResponse, ErrorResponse } from '@/types/common'

class ApiClient {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        console.log('API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          hasAuth: !!token
        });
        return config
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error)
      },
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('API Response:', {
          status: response.status,
          url: response.config.url,
          success: response.data?.success,
          message: response.data?.message
        });
        return response
      },
      (error: AxiosError) => {
        console.error('API Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          responseData: error.response?.data
        });

        // For Auth endpoints, don't redirect to login
        const isAuthEndpoint = error.config?.url?.includes('/api/auth/');

        return this.handleError(error, isAuthEndpoint)
      },
    )
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('token')
  }

  private handleError(error: AxiosError, isAuthEndpoint = false): Promise<never> {
    const errorResponse: ErrorResponse = {
      success: false,
      message: 'An error occurred',
      statusCode: 500,
    }

    if (error.response) {
      const { status, data } = error.response
      const respData = data as { message?: string; errors?: unknown; success?: boolean }

      errorResponse.statusCode = status
      errorResponse.message = respData?.message || `HTTP ${status} Error`
      errorResponse.errors = respData?.errors as string[] | undefined

      console.log('Error Response Details:', {
        status,
        isAuthEndpoint,
        responseData: respData,
        shouldRedirect: status === 401 && !isAuthEndpoint
      });

      // Handle authentication errors - don't redirect for auth endpoints
      if ((status === 401 || status === 403) && !isAuthEndpoint) {
        console.log('Authentication error - redirecting to login');
        this.handleAuthError()
        errorResponse.message = 'Authentication failed. Please login again.'
      } else if (status === 401 || status === 403) {
        console.log('Authentication error on auth endpoint - not redirecting');
        errorResponse.message = respData?.message || 'Authentication failed'
      }
    } else if (error.code === 'ECONNABORTED') {
      errorResponse.message = 'Request timeout. Please check your connection and try again.'
    } else if (error.code === 'ERR_NETWORK') {
      errorResponse.message = 'Network error. Please check your connection and try again.'
    }

    console.log('Final error message:', errorResponse.message);
    return Promise.reject(new Error(errorResponse.message))
  }

  private handleAuthError(): void {
    console.log('Clearing auth data and redirecting to login');
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // Use Vue Router instead of window.location
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  // HTTP Methods
  async get<T = unknown>(url: string, params?: unknown): Promise<T> {
    try {
      const response = await this.client.get<T>(url, { params })
      return response.data
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  }

  async post<T = unknown>(url: string, data?: unknown): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data)
      return response.data
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }

  async put<T = unknown>(url: string, data?: unknown): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data)
      return response.data
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  }

  async delete<T = unknown>(url: string): Promise<T> {
    try {
      const response = await this.client.delete<T>(url)
      return response.data
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }

  async uploadFile<T = unknown>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<T> {
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await this.client.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      })

      return response.data
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient()
