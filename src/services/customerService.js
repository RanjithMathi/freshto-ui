// src/services/customerService.js

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
      console.error(`Error fetching customer ${id}:`, error);
      throw error;
    }
  }

  async createCustomer(customer) {
    try {
      return await apiClient.post(API_ENDPOINTS.CUSTOMERS, customer);
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  async updateCustomer(id, customer) {
    try {
      return await apiClient.put(
        API_ENDPOINTS.CUSTOMER_BY_ID(id),
        customer
      );
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error);
      throw error;
    }
  }

  async deleteCustomer(id) {
    try {
      await apiClient.delete(API_ENDPOINTS.CUSTOMER_BY_ID(id));
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  }
}

export default new CustomerService();