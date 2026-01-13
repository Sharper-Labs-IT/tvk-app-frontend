import axios from 'axios';
import Cookies from 'js-cookie';

// 🚨 IMPORTANT: Replace with your actual backend base URL
// Using relative path '/api' to leverage Vite proxy in development
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
// const API_BASE_URL = 'https://api.tvkmembers.com/api';
// const API_BASE_URL = 'http://localhost:8000/api';

/**
 * @fileoverview Axios Instance for API communication.
 * Sets the base URL and includes the authorization header (Bearer Token)
 * if a token exists in cookies.
 */

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // We can add a timeout here if needed: timeout: 10000,
});

// Request Interceptor: Inject the JWT token into the header before sending the request
api.interceptors.request.use(
  (config) => {
    // Get token from cookie (we'll save it as 'authToken')
    const token = Cookies.get('authToken');

    if (token) {
      // Set the Authorization header for protected routes
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle common response errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
      
      // Handle specific error codes
      if (error.response.status === 401) {
        console.error('Unauthorized - Token may be invalid or expired');
        // You could redirect to login here if needed
      } else if (error.response.status === 403) {
        console.error('Forbidden - User does not have permission');
      } else if (error.response.status === 404) {
        console.error('Not Found - Endpoint does not exist');
      } else if (error.response.status === 500) {
        console.error('Internal Server Error');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// --- PROFILE & AUTH FUNCTIONS ---

/**
 * Update user profile details (Name, Mobile, Nickname)
 * Endpoint: POST /v1/auth/update-profile
 */
export const updateProfile = async (data: {
  name?: string;
  mobile?: string;
  nickname?: string;
}) => {
  const response = await api.post('/v1/auth/update-profile', data);
  return response.data;
};

/**
 * Upload new profile avatar
 * Endpoint: POST /v1/auth/update-avatar
 * Note: Requires multipart/form-data header
 */
export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await api.post('/v1/auth/update-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Request Password Reset Link (Step 1)
 * Triggers an email with the reset token.
 * Endpoint: POST /v1/auth/forgot-password
 */
export const requestPasswordReset = async (email: string) => {
  const response = await api.post('/v1/auth/forgot-password', { email });
  return response.data;
};

/**
 * Confirm Password Reset (Step 2)
 * Uses the token from email to set the new password.
 * Endpoint: POST /v1/auth/reset-password
 */
export const confirmPasswordReset = async (data: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) => {
  const response = await api.post('/v1/auth/reset-password', data);
  return response.data;
};

export default api;

// Add these to your existing api.ts file

/**
 * Calculate price based on selected currency
 * Endpoint: POST /currency/calculate
 */
export const calculatePrice = async (planId: number, currency: string) => {
  const response = await api.post('/currency/calculate', {
    plan_id: planId,
    currency: currency,
  });
  return response.data;
};

/**
 * Validate address before payment
 * Endpoint: POST /address/validate
 */
export const validateAddress = async (addressData: any) => {
  const response = await api.post('/address/validate', addressData);
  return response.data;
};
