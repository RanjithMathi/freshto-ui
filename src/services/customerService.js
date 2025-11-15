// ========================================
// src/services/customerService.js
// ========================================
import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api.config';

class CustomerService {
  async getAllCustomers() {
    try {
      return await apiClient.get(API_ENDPOINTS.CUSTOMERS);
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  async getCustomerById(id) {
    try {
      return await apiClient.get(API_ENDPOINTS.CUSTOMER_BY_ID(id));
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  async getCustomerByPhone(phone) {
    try {
      return await apiClient.get(API_ENDPOINTS.CUSTOMER_BY_PHONE(phone));
    } catch (error) {
      console.error('Error fetching customer by phone:', error);
      throw error;
    }
  }

  async createCustomer(customerData) {
    try {
      return await apiClient.post(API_ENDPOINTS.CUSTOMERS, customerData);
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  async updateCustomer(id, customerData) {
    try {
      return await apiClient.put(API_ENDPOINTS.UPDATE_CUSTOMER_BY_ID(id), customerData);
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  async deleteCustomer(id) {
    try {
      await apiClient.delete(API_ENDPOINTS.CUSTOMER_BY_ID(id));
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }
}

export default new CustomerService();