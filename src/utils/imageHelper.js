// src/utils/imageHelper.js
import { API_CONFIG } from '../config/api.config';

/**
 * Get product image URL from backend or return fallback
 * @param {string|null} imagePath - Image path from backend
 * @param {any} fallbackImage - Local fallback image (require statement)
 * @returns {object} - Image source object for React Native Image component
 */
export const getProductImage = (imagePath, fallbackImage) => {
  if (imagePath) {
    return {
      uri: `${API_CONFIG.IMAGE_BASE_URL}/api/products/images/${imagePath}`,
    };
  }
  return fallbackImage;
};

/**
 * Format product data from backend response
 * @param {object} product - Product object from backend
 * @param {any} fallbackImage - Local fallback image
 * @returns {object} - Formatted product object
 */
export const formatProductForDisplay = (product, fallbackImage) => {
  if (!product) return null;
  
  return {
    id: product.id?.toString(),
    title: product.name,
    price: product.price,
    originalPrice: product.originalPrice || null,
    discount: product.discountPercentage 
      ? `${product.discountPercentage}% OFF` 
      : null,
    image: getProductImage(product.imagePath, fallbackImage),
    description: product.description || null,
    category: product.category || null,
    stockQuantity: product.stockQuantity || 0,
    available: product.available !== false,
    product: product, // Keep original data
  };
};

/**
 * Format price with currency symbol
 * @param {number} price 
 * @returns {string}
 */
export const formatPrice = (price) => {
  if (typeof price === 'number') {
    return `₹${price.toFixed(2)}`;
  }
  if (typeof price === 'string') {
    // Already formatted
    if (price.startsWith('₹')) return price;
    return `₹${price}`;
  }
  return '₹0.00';
};

/**
 * Parse price from string to number
 * @param {string|number} price 
 * @returns {number}
 */
export const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    return parseFloat(price.replace('₹', '').trim());
  }
  return 0;
};

export default {
  getProductImage,
  formatProductForDisplay,
  formatPrice,
  parsePrice,
};