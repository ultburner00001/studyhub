import axios from 'axios';

// 🌐 Base API URL (uses environment variable or defaults to localhost for dev)
const API_URL = process.env.REACT_APP_API_URL?.replace(/\/+$/, '');

// 🏗️ Create Axios instance
const adminClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// 🛠️ Request Interceptor — attach admin token and log requests
adminClient.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('studyhub_admin_token');
  if (adminToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${adminToken}`;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('➡️ Admin API Request:', config.method?.toUpperCase(), config.url);
  }

  return config;
});

// 🧩 Response Interceptor — handle errors, retry, and friendly messages
adminClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Admin API Response:', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Admin API Error:', error);
    }

    const status = error?.response?.status;
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let shouldRedirect = false;

    switch (status) {
      case 401:
        errorMessage = 'Admin session expired. Please log in again.';
        shouldRedirect = true;
        break;
      case 403:
        errorMessage = 'You are not authorized to access this resource.';
        shouldRedirect = true;
        break;
      case 404:
        errorMessage = 'Requested resource not found.';
        break;
      case 500:
        errorMessage = 'Server error. Please try again later.';
        break;
      case 503:
        errorMessage = 'Service temporarily unavailable. Please try again later.';
        break;
      default:
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. Please check your connection.';
        } else if (error.message === 'Network Error') {
          errorMessage = 'Network error. Please check your internet connection.';
        }
    }

    // 🧭 Redirect to admin login on auth failure
    if (shouldRedirect) {
      localStorage.removeItem('studyhub_admin_token');
      sessionStorage.setItem('admin_auth_error', errorMessage);
      try {
        window.location.href = '/admin/auth';
      } catch (e) {
        // no-op
      }
    }

    // 🔁 Retry Logic — up to 3 attempts for network errors
    if (error.message === 'Network Error' && error.config) {
      const retryCount = error.config._retryCount || 0;
      if (retryCount < 3) {
        error.config._retryCount = retryCount + 1;
        const delay = 1000 * Math.pow(2, retryCount);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return adminClient.request(error.config);
      }
    }

    // 🧠 Attach user-friendly message for UI
    error.userMessage = errorMessage;

    return Promise.reject(error);
  }
);

export default adminClient;
