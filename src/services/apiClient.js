// src/services/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';


class ApiClient {
   constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        try {
          // Add auth token if available
          const token = await AsyncStorage.getItem('authToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          
          if (__DEV__) {
            console.log('📤 API Request:', {
              method: config.method?.toUpperCase(),
              url: config.url,
              data: JSON.stringify(config.data) || config.data,
            });
          }
        } catch (error) {
          console.error('Error in request interceptor:', error);
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log('📥 API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
          });
        }
        return response;
      },
      async (error) => {
        if (error.response) {
          // Server responded with error
          console.error('❌ Response Error:', {
            status: error.response.status,
            data: error.response.data,
            url: error.config?.url,
          });
          
          switch (error.response.status) {
            case 401:
              // Handle unauthorized - clear token and redirect to login
              console.log('🔒 Unauthorized - clearing auth data');
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('user');
              // You can emit an event here to redirect to login
              break;
            case 403:
              console.log('🚫 Forbidden');
              break;
            case 404:
              console.log('🔍 Resource not found');
              break;
            case 500:
              console.log('🔥 Server error');
              break;
          }
        } else if (error.request) {
          // Request made but no response
          console.error('🌐 Network Error:', error.message);
        } else {
          console.error('⚠️ Error:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

 async get(url, config = {}) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(url, data, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(url, data, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch(url, data, config = {}) {
    try {
      const response = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  handleError(error) {
    if (error.response) {
      // Extract error message from response
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     'An error occurred';
      return new Error(message);
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return error;
    }
  }

  // Set authorization token
  async setAuthToken(token) {
    try {
      await AsyncStorage.setItem('authToken', token);
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

    // Clear authorization token
  async clearAuthToken() {
    try {
      await AsyncStorage.removeItem('authToken');
      delete this.client.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  }
}

export default new ApiClient();