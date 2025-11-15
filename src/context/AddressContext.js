// ========================================
// src/context/AddressContext.js
// ========================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';

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
        
        const userId = user.id; // ✅ Consistent with AuthContext
        
        if (userId) {
          console.log('✅ AddressContext - Customer ID found:', userId);
          setCustomerId(userId);
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

  /**
   * Get auth headers with token
   */
  const getAuthHeaders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('🔑 Auth token retrieved:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        console.warn('⚠️ No authentication token found');
        return {};
      }

      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    } catch (error) {
      console.error('❌ Error getting auth headers:', error);
      return {};
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
   */
  const fetchAddresses = async (custId = customerId) => {
    if (!custId) {
      console.warn('⚠️ No customer ID available for fetching addresses');
      return [];
    }

    console.log('📍 Fetching addresses for customer:', custId);
    setLoading(true);
    
    try {
      const headers = await getAuthHeaders();
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ADDRESSES_BY_CUSTOMER(custId)}`;
      console.log('🌐 Fetching from:', url);
      console.log('🔐 Using headers:', headers);
      
      const response = await axios.get(url, { headers });
      console.log('✅ Addresses fetched:', response.data);
      
      const addressList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setAddresses(addressList);
      
      const defaultAddr = addressList.find(addr => addr.isDefault);
      setDefaultAddress(defaultAddr || addressList[0] || null);
      
      return addressList;
    } catch (error) {
      console.error('❌ Error fetching addresses:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.status === 404) {
        console.log('ℹ️ No addresses found for customer');
        setAddresses([]);
        setDefaultAddress(null);
        return [];
      }
      
      if (error.response?.status === 403) {
        console.error('🚫 Authorization failed - Token may be invalid or expired');
        // Optionally: Clear token and redirect to login
        // await AsyncStorage.removeItem('token');
        // await AsyncStorage.removeItem('user');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get default address for a customer
   */
  const fetchDefaultAddress = async (custId = customerId) => {
    if (!custId) return null;

    try {
      const headers = await getAuthHeaders();
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ADDRESS_DEFAULT(custId)}`;
      const response = await axios.get(url, { headers });
      console.log('✅ Default address fetched:', response.data);
      setDefaultAddress(response.data);
      return response.data;
    } catch (error) {
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
   */
  const addAddress = async (addressData, custId = customerId) => {
    if (!custId) {
      throw new Error('Customer ID is required to add address');
    }

    console.log('➕ Adding new address for customer:', custId);
    console.log('Address data:', addressData);

    try {
      const headers = await getAuthHeaders();
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ADDRESSES_BY_CUSTOMER(custId)}`;
      const response = await axios.post(url, addressData, { headers });
      
      console.log('✅ Address added successfully:', response.data);
      
      await fetchAddresses(custId);
      return response.data;
    } catch (error) {
      console.error('❌ Error adding address:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  };

  /**
   * Update an existing address
   */
  const updateAddress = async (addressId, addressData) => {
    console.log('✏️ Updating address:', addressId);
    
    try {
      const headers = await getAuthHeaders();
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ADDRESS_BY_ID(addressId)}`;
      const response = await axios.put(url, addressData, { headers });
      
      console.log('✅ Address updated successfully');
      await fetchAddresses(customerId);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating address:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  };

  /**
   * Set an address as default
   */
  const setAsDefault = async (addressId) => {
    console.log('⭐ Setting address as default:', addressId);
    
    try {
      const headers = await getAuthHeaders();
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ADDRESS_SET_DEFAULT(addressId)}`;
      const response = await axios.patch(url, {}, { headers });
      
      console.log('✅ Default address set');
      setDefaultAddress(response.data);
      await fetchAddresses(customerId);
      return response.data;
    } catch (error) {
      console.error('❌ Error setting default address:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  };

  /**
   * Delete an address
   */
  const deleteAddress = async (addressId) => {
    console.log('🗑️ Deleting address:', addressId);
    
    try {
      const headers = await getAuthHeaders();
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ADDRESS_BY_ID(addressId)}`;
      await axios.delete(url, { headers });
      console.log('✅ Address deleted successfully');
      await fetchAddresses(customerId);
    } catch (error) {
      console.error('❌ Error deleting address:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  };

  /**
   * Get a specific address by ID
   */
  const getAddressById = async (addressId) => {
    try {
      const headers = await getAuthHeaders();
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ADDRESS_BY_ID(addressId)}`;
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching address:', error);
      throw error;
    }
  };

  /**
   * Get addresses by type
   */
  const getAddressesByType = async (type, custId = customerId) => {
    if (!custId) return [];

    try {
      const headers = await getAuthHeaders();
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ADDRESS_BY_TYPE(custId, type)}`;
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching addresses by type:', error);
      throw error;
    }
  };

  /**
   * Check if customer has any addresses
   */
  const hasAddresses = async (custId = customerId) => {
    if (!custId) return false;

    try {
      const headers = await getAuthHeaders();
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ADDRESS_EXISTS(custId)}`;
      const response = await axios.get(url, { headers });
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

  const refreshAddresses = fetchAddresses;

  const value = {
    addresses,
    defaultAddress,
    loading,
    customerId,
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
    setCustomerIdManually,
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