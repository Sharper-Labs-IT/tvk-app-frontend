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

    return config;
  },
  (error) => {
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
