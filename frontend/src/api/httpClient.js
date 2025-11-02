// src/utils/httpClient.js
import axios from 'axios';

// 🌐 Determine API Base URL
// Priority: Environment Variable → Render → Localhost
const API_URL =
  process.env.REACT_APP_API_URL?.replace(/\/+$/, '') ||
  'https://studyhub-21ux.onrender.com' ||
  'http://localhost:5000';

console.log('🌍 Using API URL:', API_URL);

// ⚙️ Create Axios instance
const httpClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set true only if using cookies
});

// 🧾 Request Interceptor — attach token
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studyhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('➡️ [Request]', config.method?.toUpperCase(), config.url, config.data || '');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🧩 Response Interceptor — handle common errors & retry logic
httpClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [Response]', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    const status = error?.response?.status;
    let message = 'Unexpected error. Please try again later.';

    if (process.env.NODE_ENV === 'development') {
      console.error('❌ [API Error]', error);
    }

    // ⚠️ Handle CORS & Network
    if (error.message === 'Network Error') {
      message = 'Network error. Check your backend or internet connection.';
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. Please retry.';
    }

    // 🧱 Specific HTTP codes
    switch (status) {
      case 401:
        message = 'Unauthorized — Please login again.';
        localStorage.removeItem('studyhub_token');
        window.location.href = '/auth';
        break;
      case 403:
        message = 'Forbidden — You do not have access.';
        break;
      case 404:
        message = 'Resource not found.';
        break;
      case 500:
        message = 'Server error. Please try again later.';
        break;
    }

    // 🔁 Retry (up to 3 times for temporary network issues)
    if (error.message === 'Network Error' && error.config) {
      const retries = error.config._retries || 0;
      if (retries < 3) {
        error.config._retries = retries + 1;
        const delay = 1000 * Math.pow(2, retries);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return httpClient.request(error.config);
      }
    }

    return Promise.reject({ ...error, message });
  }
);

export default httpClient;

