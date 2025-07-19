import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { ApiResponse, ErrorResponse } from '@/types/common';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => this.handleError(error)
    );
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private handleError(error: AxiosError): Promise<never> {
    const errorResponse: ErrorResponse = {
      success: false,
      message: 'An error occurred',
      statusCode: 500,
    };

    if (error.response) {
      const { status, data } = error.response;
      errorResponse.statusCode = status;
      errorResponse.message = data?.message || `HTTP ${status} Error`;
      errorResponse.errors = data?.errors;

      // Handle authentication errors
      if (status === 401 || status === 403) {
        this.handleAuthError();
        errorResponse.message = 'Authentication failed. Please login again.';
      }
    } else if (error.code === 'ECONNABORTED') {
      errorResponse.message = 'Request timeout. Please check your connection and try again.';
    } else if (error.code === 'ERR_NETWORK') {
      errorResponse.message = 'Network error. Please check your connection and try again.';
    }

    return Promise.reject(new Error(errorResponse.message));
  }

  private handleAuthError(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // HTTP Methods
  async get<T = any>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T = any>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  async uploadFile<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }
}

export const apiClient = new ApiClient();
