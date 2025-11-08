// src/context/AddressContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';

const API_BASE_URL = API_CONFIG.BASE_URL;

const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState(null);

  // Load customer ID from storage on mount
  useEffect(() => {
    loadCustomerId();
  }, []);

  const loadCustomerId = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      console.log('📦 AddressContext - Loading user data:', userData);
      
      if (userData) {
        const user = JSON.parse(userData);
        console.log('👤 AddressContext - Parsed user:', user);
        
        // ✅ Now using 'id' consistently
        const userId = user.userId;
        
        if (userId) {
          console.log('✅ AddressContext - Customer ID found:', userId);
          setCustomerId(userId);
          
          // Automatically fetch addresses when customer ID is loaded
          await fetchAddresses(userId);
        } else {
          console.warn('⚠️ AddressContext - No customer ID in user data');
        }
      } else {
        console.log('ℹ️ AddressContext - No user data found');
      }
    } catch (error) {
      console.error('❌ AddressContext - Error loading customer ID:', error);
    }
  };

  // Method to manually set customer ID (useful after login)
  const setCustomerIdManually = async (custId) => {
    console.log('🔄 AddressContext - Manually setting customer ID:', custId);
    setCustomerId(custId);
    if (custId) {
      await fetchAddresses(custId);
    }
  };

  /**
   * Fetch all addresses for a customer
   * GET /api/addresses/customer/{customerId}
   */
  const fetchAddresses = async (custId = customerId) => {
    if (!custId) {
      console.warn('⚠️ No customer ID available for fetching addresses');
      return [];
    }

    console.log('📍 Fetching addresses for customer:', custId);
    setLoading(true);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/addresses/customer/${custId}`);
      console.log('✅ Addresses fetched:', response.data);
      
      setAddresses(response.data);
      
      // Find and set default address
     const addressList = Array.isArray(response.data)
  ? response.data
  : Array.isArray(response.data?.data)
  ? response.data.data
  : [];

const defaultAddr = addressList.find(addr => addr.isDefault);
setDefaultAddress(defaultAddr || addressList[0] || null);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching addresses:', error);
      
      // If 404, it means no addresses exist yet - this is not an error
      if (error.response?.status === 404) {
        console.log('ℹ️ No addresses found for customer');
        setAddresses([]);
        setDefaultAddress(null);
        return [];
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get default address for a customer
   * GET /api/addresses/customer/{customerId}/default
   */
  const fetchDefaultAddress = async (custId = customerId) => {
    if (!custId) return null;

    try {
      const response = await axios.get(`${API_BASE_URL}/addresses/customer/${custId}/default`);
      console.log('✅ Default address fetched:', response.data);
      setDefaultAddress(response.data);
      return response.data;
    } catch (error) {
      // If no default address found (404), return null
      if (error.response?.status === 404) {
        console.log('ℹ️ No default address found');
        return null;
      }
      console.error('❌ Error fetching default address:', error);
      throw error;
    }
  };

  /**
   * Add a new address
   * POST /api/addresses/customer/{customerId}
   */
  const addAddress = async (addressData, custId = customerId) => {
    if (!custId) {
      throw new Error('Customer ID is required to add address');
    }

    console.log('➕ Adding new address for customer:', custId);
    console.log('Address data:', addressData);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/addresses/customer/${custId}`,
        addressData
      );
      
      console.log('✅ Address added successfully:', response.data);
      
      // Refresh addresses list
      await fetchAddresses(custId);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error adding address:', error);
      throw error;
    }
  };

  /**
   * Update an existing address
   * PUT /api/addresses/{id}
   */
  const updateAddress = async (addressId, addressData) => {
    console.log('✏️ Updating address:', addressId);
    
    try {
      const response = await axios.put(
        `${API_BASE_URL}/addresses/${addressId}`,
        addressData
      );
      
      console.log('✅ Address updated successfully');
      
      // Refresh addresses list
      await fetchAddresses(customerId);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating address:', error);
      throw error;
    }
  };

  /**
   * Set an address as default
   * PATCH /api/addresses/{id}/set-default
   */
  const setAsDefault = async (addressId) => {
    console.log('⭐ Setting address as default:', addressId);
    
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/addresses/${addressId}/set-default`
      );
      
      console.log('✅ Default address set');
      
      // Update local state
      setDefaultAddress(response.data);
      
      // Refresh addresses list to update isDefault flags
      await fetchAddresses(customerId);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error setting default address:', error);
      throw error;
    }
  };

  /**
   * Delete an address
   * DELETE /api/addresses/{id}
   */
  const deleteAddress = async (addressId) => {
    console.log('🗑️ Deleting address:', addressId);
    
    try {
      await axios.delete(`${API_BASE_URL}/addresses/${addressId}`);
      console.log('✅ Address deleted successfully');
      
      // Refresh addresses list
      await fetchAddresses(customerId);
    } catch (error) {
      console.error('❌ Error deleting address:', error);
      throw error;
    }
  };

  /**
   * Get a specific address by ID
   * GET /api/addresses/{id}
   */
  const getAddressById = async (addressId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching address:', error);
      throw error;
    }
  };

  /**
   * Get addresses by type
   * GET /api/addresses/customer/{customerId}/type/{type}
   */
  const getAddressesByType = async (type, custId = customerId) => {
    if (!custId) return [];

    try {
      const response = await axios.get(
        `${API_BASE_URL}/addresses/customer/${custId}/type/${type}`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching addresses by type:', error);
      throw error;
    }
  };

  /**
   * Check if customer has any addresses
   * GET /api/addresses/customer/{customerId}/exists
   */
  const hasAddresses = async (custId = customerId) => {
    if (!custId) return false;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/addresses/customer/${custId}/exists`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error checking addresses:', error);
      return false;
    }
  };

  /**
   * Helper: Get full address as string
   */
  const getFullAddressString = (address) => {
    if (!address) return '';

    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.landmark,
      address.city,
      address.state,
      address.zipCode ? `PIN: ${address.zipCode}` : null,
    ].filter(Boolean);

    return parts.join(', ');
  };

  /**
   * Helper: Get address type display name
   */
  const getAddressTypeDisplay = (type) => {
    const displayNames = {
      HOME: 'Home',
      WORK: 'Work',
      OTHER: 'Other',
    };
    return displayNames[type] || type;
  };

  /**
   * Refresh addresses (alias for fetchAddresses)
   */
  const refreshAddresses = fetchAddresses;

  const value = {
    // State
    addresses,
    defaultAddress,
    loading,
    customerId,
    
    // Methods
    fetchAddresses,
    fetchDefaultAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    setAsDefault,
    getAddressById,
    getAddressesByType,
    hasAddresses,
    refreshAddresses,
    setCustomerIdManually, // New method to manually set customer ID
    
    // Helpers
    getFullAddressString,
    getAddressTypeDisplay,
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within AddressProvider');
  }
  return context;
};

export default AddressContext;