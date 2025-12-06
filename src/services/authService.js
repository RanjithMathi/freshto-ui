// src/services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';
import { API_ENDPOINTS, API_CONFIG } from '../config/api.config';

class AuthService {
  /**
   * Login with phone number only
   * @param {string} phoneNumber - 10 digit phone number
   * @returns {Promise<{success: boolean, message: string, user?: UserDto, token?: string, hasAddresses?: boolean}>}
   */
  async login(phoneNumber) {
    try {
      console.log('🔐 Logging in with phone number:', phoneNumber);
      
      // Validate phone number format
      if (!this.validatePhoneNumber(phoneNumber)) {
        return {
          success: false,
          message: 'Invalid phone number format. Please enter 10 digits starting with 6-9.',
        };
      }

      const url = API_CONFIG.BASE_URL + API_ENDPOINTS.AUTH.LOGIN;
      console.log('🌐 Login URL:', url);

      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.LOGIN,
        { phoneNumber: phoneNumber.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('✅ Login response:', response);

      if (response.success) {
        // ✅ Store token if provided
        if (response.token) {
          await AsyncStorage.setItem('authToken', response.token);
          await apiClient.setAuthToken(response.token);
          console.log('🔑 Token stored successfully');
        }
        
        // ✅ Store user data if provided
        if (response.user) {
          // Store user with 'id' field (consistent naming)
          const userData = {
            id: response.user.id, // ✅ Use 'id' consistently
            phoneNumber: response.user.phoneNumber,
            name: response.user.name,
            email: response.user.email,
            createdAt: response.user.createdAt,
            updatedAt: response.user.updatedAt,
          };
          
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          console.log('👤 User data stored:', userData);
        }

        // ✅ Return complete backend response
        return {
          success: true,
          message: response.message || 'Login successful',
          user: response.user, // UserDto from backend
          token: response.token || '',
          hasAddresses: response.hasAddresses || false, // ✅ Critical for navigation
        };
      } else {
        return {
          success: false,
          message: response.message || 'Login failed',
        };
      }
    } catch (error) {
      console.error('❌ Login Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to login. Please try again.',
      };
    }
  }

  /**
   * Logout user
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async logout() {
    try {
      console.log('🚪 Logging out user');
      
      await AsyncStorage.multiRemove(['authToken', 'user', 'isLoggedIn']);
      await apiClient.clearAuthToken();
      
      console.log('✅ Logout successful');
      
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('❌ Logout Error:', error);
      return {
        success: false,
        message: 'Failed to logout',
      };
    }
  }

  /**
   * Get current user from storage
   * @returns {Promise<any|null>}
   */
  async getCurrentUser() {
    try {
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      console.log('👤 Current user from storage:', user);
      return user;
    } catch (error) {
      console.error('❌ GetCurrentUser Error:', error);
      return null;
    }
  }

  /**
   * Get auth token from storage
   * @returns {Promise<string|null>}
   */
  async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('❌ GetAuthToken Error:', error);
      return null;
    }
  }

  /**
   * Check if user is logged in
   * @returns {Promise<boolean>}
   */
  async isLoggedIn() {
    try {
      const token = await this.getAuthToken();
      const user = await this.getCurrentUser();
      const isLoggedIn = !!(token && user);
      console.log('🔐 Is logged in:', isLoggedIn);
      return isLoggedIn;
    } catch (error) {
      console.error('❌ IsLoggedIn Error:', error);
      return false;
    }
  }

  /**
   * Validate phone number (Indian format: 10 digits starting with 6-9)
   * @param {string} phoneNumber
   * @returns {boolean}
   */
  validatePhoneNumber(phoneNumber) {
    if (!phoneNumber) return false;
    const phoneRegex = /^[6-9]\d{9}$/;
    const isValid = phoneRegex.test(phoneNumber.trim());
    if (!isValid) {
      console.warn('⚠️ Invalid phone number format:', phoneNumber);
    }
    return isValid;
  }

  /**
   * Update user profile
   * @param {Object} userData - User data to update
   * @returns {Promise<{success: boolean, message: string, user?: any}>}
   */
  async updateUserProfile(userData) {
    try {
      console.log('✏️ Updating user profile:', userData);
      
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          message: 'User not logged in',
        };
      }

      const updatedUser = { ...currentUser, ...userData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      console.log('✅ Profile updated:', updatedUser);

      return {
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      console.error('❌ UpdateProfile Error:', error);
      return {
        success: false,
        message: 'Failed to update profile',
      };
    }
  }
}

export default new AuthService();