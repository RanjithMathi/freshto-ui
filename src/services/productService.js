// ========================================
// src/services/productService.js
// ========================================
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api.config';

class ProductService {
  async getAllProducts() {
    try {
      return await apiClient.get(API_ENDPOINTS.PRODUCTS);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getAvailableProducts() {
    try {
      return await apiClient.get(API_ENDPOINTS.PRODUCTS_AVAILABLE);
    } catch (error) {
      console.error('Error fetching available products:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      return await apiClient.get(API_ENDPOINTS.PRODUCT_BY_ID(id));
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  }

  async getProductsByCategory(category) {
    try {
      return await apiClient.get(API_ENDPOINTS.PRODUCTS_BY_CATEGORY(category));
    } catch (error) {
      console.error(`Error fetching products for category ${category}:`, error);
      throw error;
    }
  }

  async getProductsBySaleType(saleType) {
    try {
      return await apiClient.get(API_ENDPOINTS.PRODUCTS_BY_SALE(saleType));
    } catch (error) {
      // Silently handle sale type errors to avoid console spam
      // Return empty array instead of throwing
      return [];
    }
  }

  async createProduct(product) {
    try {
      return await apiClient.post(API_ENDPOINTS.PRODUCTS, product);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id, product) {
    try {
      return await apiClient.put(API_ENDPOINTS.PRODUCT_BY_ID(id), product);
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  }

  async updateProductStock(id, quantity) {
    try {
      return await apiClient.patch(API_ENDPOINTS.UPDATE_STOCK(id, quantity));
    } catch (error) {
      console.error(`Error updating product stock ${id}:`, error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      await apiClient.delete(API_ENDPOINTS.PRODUCT_BY_ID(id));
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get product image URL
   * @param {string} imagePath
   * @returns {string}
   */
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    const { API_CONFIG } = require('../config/api.config');
    return `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PRODUCT_IMAGE(imagePath)}`;
  }
}

export default new ProductService();