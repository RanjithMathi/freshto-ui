export const API_CONFIG = {
  BASE_URL: 'http://192.168.0.127:8080/api',
  IMAGE_BASE_URL: 'http://192.168.0.127:8080',
  TIMEOUT: 10000,
};

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
  },

  // Customer endpoints
  CUSTOMERS: '/customers',
  CUSTOMER_BY_ID: (id) => `/customers/id/${id}`,
  UPDATE_CUSTOMER_BY_ID: (id) => `/customers/${id}`,
  CUSTOMER_BY_PHONE: (phone) => `/customers/phone/${phone}`,

  // Product endpoints
  PRODUCTS: '/products',
  PRODUCTS_AVAILABLE: '/products/available',
  PRODUCT_BY_ID: (id) => `/products/${id}`,
  PRODUCTS_BY_CATEGORY: (category) => `/products/category/${encodeURIComponent(category)}`,
  PRODUCTS_BY_SALE: (saleType) => `/products/sale/${saleType}`,
  PRODUCT_IMAGE: (imagePath) => `/products/images/${imagePath}`,
  UPDATE_STOCK: (id, quantity) => `/products/${id}/stock?quantity=${quantity}`,

  // Order endpoints
  ORDERS: '/orders',
  ORDER_BY_ID: (id) => `/orders/${id}`,
  ORDERS_BY_CUSTOMER: (customerId) => `/orders/customer/${customerId}`,
  ORDERS_BY_STATUS: (status) => `/orders/status/${status}`,
  UPDATE_ORDER_STATUS: (id, status) => `/orders/${id}/status?status=${status}`,

  // Address endpoints
  ADDRESSES: '/addresses',
  ADDRESS_BY_ID: (id) => `/addresses/${id}`,
  ADDRESSES_BY_CUSTOMER: (customerId) => `/addresses/customer/${customerId}`,
  ADDRESS_BY_TYPE: (customerId, type) => `/addresses/customer/${customerId}/type/${type}`,
  ADDRESS_DEFAULT: (customerId) => `/addresses/customer/${customerId}/default`,
  ADDRESS_SET_DEFAULT: (id) => `/addresses/${id}/set-default`,
  ADDRESS_EXISTS: (customerId) => `/addresses/customer/${customerId}/exists`,

  // Admin endpoints
  ADMIN: {
    // Authentication
    LOGIN: '/admin/auth/login',

    // Products
    PRODUCTS: '/admin/products',
    PRODUCT_BY_ID: (id) => `/admin/products/${id}`,
    PRODUCT_STOCK: (id) => `/admin/products/${id}/stock`,

    // Categories
    CATEGORIES: '/admin/categories',
    CATEGORY_BY_ID: (id) => `/admin/categories/${id}`,
    ACTIVE_CATEGORIES: '/admin/categories/active',

    // Orders
    ORDERS: '/admin/orders',
    ORDER_BY_ID: (id) => `/admin/orders/${id}`,
    ORDER_STATUS: (id) => `/admin/orders/${id}/status`,
    DELIVERY_TRACKING: '/admin/orders/delivery-tracking',

    // Customers
    CUSTOMERS: '/admin/customers',
    CUSTOMER_BY_ID: (id) => `/admin/customers/${id}`,
    CUSTOMER_ORDERS: (id) => `/admin/customers/${id}/orders`,

    // Reports
    SALES_REPORT: '/admin/reports/sales',
    REVENUE_REPORT: '/admin/reports/revenue',
    CUSTOMER_ANALYTICS: '/admin/reports/customers',
    PRODUCT_PERFORMANCE: '/admin/reports/products',
  },
};
