import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

/**
 * Axios Client Configuration for Laravel Sanctum API
 * 
 * Features:
 * - Bearer token authentication
 * - CSRF protection (Sanctum)
 * - Extended timeout for long-running AI requests (10 minutes)
 * - Comprehensive error handling
 * - Request/response interceptors
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

const baseURL = import.meta.env.DEV
  ? `/api/${API_VERSION}`
  : `${API_BASE}/api/${API_VERSION}`;

const axiosClient = axios.create({
  baseURL,
  timeout: 600000, // 10 minutes for AI story generation
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Required for Laravel Sanctum
});

// =================================
// Request Interceptor
// =================================

axiosClient.interceptors.request.use(
  (config) => {
    // Attach Bearer token from cookies
    const token = Cookies.get('authToken');
    
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token if available (Sanctum)
    const csrfToken = Cookies.get('XSRF-TOKEN');
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =================================
// Response Interceptor
// =================================

axiosClient.interceptors.response.use(
  (response) => {
    // Successful response
    return response;
  },
  (error: AxiosError<any>) => {
    // Handle different error types
    
    // Network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        error_code: 'NETWORK_ERROR',
      });
    }
    
    const { status, data } = error.response;
    
    // Authentication errors (401)
    if (status === 401) {
      // Clear auth token and redirect to login
      Cookies.remove('authToken');
      window.location.href = '/login';
      return Promise.reject({
        message: 'Authentication required. Please log in.',
        error_code: 'AUTH_REQUIRED',
      });
    }
    
    // Rate limit errors (429)
    if (status === 429) {
      return Promise.reject({
        success: false,
        message: data.message || 'Too many requests. Please try again later.',
        error_code: 'RATE_LIMIT_EXCEEDED',
        remaining_quota: data.remaining_quota || 0,
        resets_at: data.resets_at || '',
      });
    }
    
    // Validation errors (422)
    if (status === 422) {
      return Promise.reject({
        success: false,
        message: data.message || 'Validation failed',
        error_code: 'VALIDATION_ERROR',
        errors: data.errors || {},
      });
    }
    
    // Server errors (500+)
    if (status >= 500) {
      return Promise.reject({
        success: false,
        message: data.message || data.error || 'Server error. Please try again later.',
        error_code: 'SERVER_ERROR',
        debug: data
      });
    }
    
    // Other errors
    return Promise.reject({
      success: false,
      message: data.message || 'An error occurred',
      error_code: 'UNKNOWN_ERROR',
      ...data,
    });
  }
);

// =================================
// CSRF Cookie Initialization
// =================================

/**
 * Initialize CSRF protection (call before first authenticated request)
 * Required for Laravel Sanctum
 */
export const initializeCsrfProtection = async (): Promise<void> => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    await axios.get(`${baseUrl}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error('Failed to initialize CSRF protection:', error);
  }
};

// Export CancelToken for cancellable requests
export const CancelToken = axios.CancelToken;
export const isCancel = axios.isCancel;

export default axiosClient;
