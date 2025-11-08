// src/config/api.config.js
import { Platform } from 'react-native';
const ENVIRONMENT = 'development'; // Change to 'production' for production build

const API_URLS = {
  development: {
    android: 'http://192.168.0.127:8080/api',
    ios: 'http://localhost:8080/api',
    default: 'http://localhost:8080/api',
  },
  production: {
    android: 'https://your-production-api.com/api',
    ios: 'https://your-production-api.com/api',
    default: 'https://your-production-api.com/api',
  },
};
const getBaseURL = () => {
  const urls = API_URLS[ENVIRONMENT];
  
  if (Platform.OS === 'android') {
    return urls.android;
  } else if (Platform.OS === 'ios') {
    return urls.ios;
  }
  
  return urls.default;
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Customer endpoints
  CUSTOMERS: '/customers',
  CUSTOMER_BY_ID: (id) => `/customers/${id}`,
  
  // Product endpoints
  PRODUCTS: '/products',
  PRODUCTS_AVAILABLE: '/products/available',
  PRODUCT_BY_ID: (id) => `/products/${id}`,
  PRODUCTS_BY_CATEGORY: (category) => `/products/category/${category}`,
  UPDATE_STOCK: (id, quantity) => `/products/${id}/stock?quantity=${quantity}`,
  
  // Order endpoints
  ORDERS: '/orders',
  ORDER_BY_ID: (id) => `/orders/${id}`,
  ORDERS_BY_CUSTOMER: (customerId) => `/orders/customer/${customerId}`,
  ORDERS_BY_STATUS: (status) => `/orders/status/${status}`,
  UPDATE_ORDER_STATUS: (id, status) => `/orders/${id}/status?status=${status}`,

  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
  },
};
// Log the current configuration (development only)
console.log('API Configuration:', {
  environment: ENVIRONMENT,
  platform: Platform.OS,
  baseUrl: API_CONFIG.BASE_URL,
});
export default API_CONFIG;
