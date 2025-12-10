import axios from 'axios';
import Cookies from 'js-cookie';

// 🚨 IMPORTANT: Replace with your actual backend base URL
// Using relative path '/api' to leverage Vite proxy in development
const API_BASE_URL = '/api';

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

export default api;
