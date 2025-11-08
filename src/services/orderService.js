// src/services/orderService.js

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import { OrderStatus } from '../types/api.types';

class OrderService {
  async getAllOrders() {
    try {
      return await apiClient.get(API_ENDPOINTS.ORDERS);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async getOrderById(id) {
    try {
      return await apiClient.get(API_ENDPOINTS.ORDER_BY_ID(id));
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  }

  async getOrdersByCustomer(customerId) {
    try {
      return await apiClient.get(
        API_ENDPOINTS.ORDERS_BY_CUSTOMER(customerId)
      );
    } catch (error) {
      console.error(`Error fetching orders for customer ${customerId}:`, error);
      throw error;
    }
  }

  async getOrdersByStatus(status) {
    try {
      return await apiClient.get(
        API_ENDPOINTS.ORDERS_BY_STATUS(status)
      );
    } catch (error) {
      console.error(`Error fetching orders with status ${status}:`, error);
      throw error;
    }
  }

  async createOrder(order) {
    try {
      return await apiClient.post('http://192.168.0.127:8080/api/orders', order);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrderStatus(id, status) {
    try {
      return await apiClient.patch(
        API_ENDPOINTS.UPDATE_ORDER_STATUS(id, status)
      );
    } catch (error) {
      console.error(`Error updating order status ${id}:`, error);
      throw error;
    }
  }

  async deleteOrder(id) {
    try {
      await apiClient.delete(API_ENDPOINTS.ORDER_BY_ID(id));
    } catch (error) {
      console.error(`Error deleting order ${id}:`, error);
      throw error;
    }
  }

  /**
   * Helper method to create order from cart
   * @param {number} customerId 
   * @param {string} deliveryAddress 
   * @param {Array<{productId: number, quantity: number}>} cartItems 
   * @param {string} [specialInstructions]
   * @returns {Promise<Order>}
   */
  async createOrderFromCart(
    customerId,
    deliveryAddress,
    cartItems,
    specialInstructions
  ) {
    const orderData = {
      customer: { id: customerId },
      deliveryAddress,
      specialInstructions,
      orderItems: cartItems.map(item => ({
        product: { id: item.productId },
        quantity: item.quantity,
      })),
    };

    return this.createOrder(orderData);
  }
}

export default new OrderService();