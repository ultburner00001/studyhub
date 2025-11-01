import axios from 'axios';

// 🌐 Use environment variable for backend API
// Fallback to localhost for local development
const API_URL = process.env.REACT_APP_API_URL?.replace(/\/+$/, '');

// Create Axios instance
const httpClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// 🛠️ Request Interceptor — add token if available
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('studyhub_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('➡️ API Request:', config.method?.toUpperCase(), config.url);
  }

  return config;
});

// 🧩 Response Interceptor — handle errors and retry logic
httpClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', error);
    }

    const status = error?.response?.status;
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let shouldRedirect = false;

    switch (status) {
      case 401:
        errorMessage = 'Your session has expired. Please login again.';
        shouldRedirect = true;
        break;
      case 403:
        errorMessage = 'You do not have permission to access this resource.';
        shouldRedirect = true;
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

    if (shouldRedirect) {
      localStorage.removeItem('studyhub_token');
      sessionStorage.setItem('auth_error', errorMessage);
      try {
        window.location.href = '/auth';
      } catch (e) {
        // no-op
      }
    }

    // 🔁 Retry Logic with exponential backoff
    if (error.message === 'Network Error' && error.config) {
      const retryCount = error.config._retryCount || 0;
      if (retryCount < 3) {
        error.config._retryCount = retryCount + 1;
        const delay = 1000 * Math.pow(2, retryCount);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return httpClient.request(error.config);
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;
