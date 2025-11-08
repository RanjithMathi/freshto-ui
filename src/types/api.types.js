// src/types/api.types.js

// Order Status Constants
export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

// JSDoc type definitions for better IDE support

/**
 * @typedef {Object} Customer
 * @property {number} [id]
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} address
 * @property {string} city
 * @property {string} zipCode
 */

/**
 * @typedef {Object} Product
 * @property {number} [id]
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {string} category
 * @property {number} stockQuantity
 * @property {string} unit
 * @property {string} [imageUrl]
 * @property {boolean} available
 */

/**
 * @typedef {Object} OrderItem
 * @property {number} [id]
 * @property {Object} product
 * @property {number} product.id
 * @property {number} quantity
 * @property {number} [price]
 * @property {number} [subtotal]
 */

/**
 * @typedef {Object} Order
 * @property {number} [id]
 * @property {Object} customer
 * @property {number} customer.id
 * @property {string} [orderDate]
 * @property {string} deliveryAddress
 * @property {number} [totalAmount]
 * @property {string} [status]
 * @property {string} [specialInstructions]
 * @property {OrderItem[]} orderItems
 */

/**
 * @typedef {Object} ApiResponse
 * @property {*} [data]
 * @property {string} [error]
 * @property {string} [message]
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} content
 * @property {number} totalElements
 * @property {number} totalPages
 * @property {number} size
 * @property {number} number
 */