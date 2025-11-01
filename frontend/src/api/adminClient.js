import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const adminClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Request interceptor to set the latest admin token and log in development
adminClient.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Admin API Request:', config.method?.toUpperCase(), config.url);
  }
  return config;
});

// Response interceptor to handle errors with granular handling and logging
adminClient.interceptors.response.use(
  (res) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Admin API Response:', res.status, res.config.method?.toUpperCase(), res.config.url);
    }
    return res;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin API Error:', error);
    }

    // For network errors, implement simple retry logic
    if (error.message === 'Network Error' && error.config && !error.config._retry) {
      error.config._retry = true;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(adminClient.request(error.config));
        }, 1000);
      });
    }

    // Add user-friendly messages but let components handle the auth flow
    const status = error?.response?.status;
    let errorMessage = '';

    if (status === 500) {
      errorMessage = 'Server is temporarily unavailable. Please try again later.';
    } else if (status === 503) {
      errorMessage = 'Service is temporarily unavailable. Please try again later.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please check your connection and try again.';
    } else if (error.message === 'Network Error') {
      errorMessage = 'Network error. Please check your connection.';
    } else {
      errorMessage = 'An unexpected error occurred. Please try again.';
    }

    // Attach the error message to the error object for component-level handling
    error.userMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

export default adminClient;