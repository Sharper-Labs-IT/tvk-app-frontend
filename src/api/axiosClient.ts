import axios from 'axios';
import Cookies from 'js-cookie';

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  timeout: 1000000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token automatically
axiosClient.interceptors.request.use((config) => {
  const token = Cookies.get('authToken');

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosClient;
