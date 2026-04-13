import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 second timeout for Render cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token and logging
api.interceptors.request.use(
  async (config) => {
    // Debug log: Request URL
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.warn('Failed to get token from storage');
    }
    return config;
  },
  (error) => {
    console.error(`[API Request Error]`, error);
    return Promise.reject(error);
  }
);

// Helper function for delays (retries)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Add a response interceptor for unified error formatting and RETRY logic
api.interceptors.response.use(
  (response) => {
    // Debug log: Response data
    console.log(`[API Response] ${response.status} from ${response.config.url}`);
    return response;
  },
  async (error) => {
    const { config, response } = error;
    
    // Debug log: Error details
    console.error(`[API Error] ${error.message} | URL: ${config?.url} | Status: ${response?.status}`);

    // IMPLEMENT RETRY LOGIC (Max 3 retries for Render cold starts or network flukes)
    // Retry if: No response (network error) OR 503 Service Unavailable (Render waking up)
    const shouldRetry = !response || response.status === 503 || error.code === 'ECONNABORTED';
    
    if (shouldRetry && (!config._retryCount || config._retryCount < 2)) {
      config._retryCount = (config._retryCount || 0) + 1;
      
      const delay = 10000; // 10 seconds between retries to give Render time to wake up
      console.log(`[API Retry] Attempt ${config._retryCount} in ${delay}ms...`);
      
      await sleep(delay);
      return api(config); // Retry the request
    }

    // Auto-logout on 401 (expired/invalid token)
    if (response?.status === 401) {
      try {
        await AsyncStorage.removeItem('userInfo');
        await AsyncStorage.removeItem('userToken');
      } catch (e) {
        // Ignore storage errors during cleanup
      }
    }

    let customError = error;
    
    // Categorize errors for the UI
    if (!response) {
      customError = new Error('Cannot connect to server. Please check your internet connection or wait for the server to wake up.');
    } else if (response.status === 404) {
      customError = new Error('API route not found (404). Please contact support.');
    } else if (response.status === 500) {
      customError = new Error('Server error (500). Something went wrong on our end.');
    } else if (response.status === 503) {
      customError = new Error('Server is still waking up. Please try again in 30 seconds.');
    } else if (response.data && response.data.message) {
      // Pass backend-provided error message through (e.g., "Invalid email or password")
      customError = new Error(response.data.message);
    } else if (error.code === 'ECONNABORTED') {
      customError = new Error('Request timed out. The server might be busy waking up.');
    } else {
      customError = new Error('An unexpected error occurred. Please try again.');
    }
    
    // Attach original response to error for debugging
    (customError as any).response = response;
    return Promise.reject(customError);
  }
);

export default api;

