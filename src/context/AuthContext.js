// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data from AsyncStorage on app start
  useEffect(() => {
    loadUserData();
  }, []);

  // Load user data from storage
  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const authToken = await AsyncStorage.getItem('authToken');

      console.log('📱 Loading user data from storage:', userData);

      if (userData && authToken) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
        console.log('✅ User data loaded successfully:', parsedUser);
      } else {
        console.log('ℹ️ No user data found in storage');
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Login function - Updated to handle backend AuthResponse
  const login = async (loginData) => {
    try {
      console.log('🔐 Logging in user with data:', loginData);

      // Extract user data from backend response
      // loginData should contain: { userData, token, hasAddresses, phone }
      const { userData, token, hasAddresses, phone } = loginData;

      // Map backend UserDto to our user object
      // IMPORTANT: Use 'id' consistently throughout the app
      const userObj = {
        id: userData.id, // ✅ This is the customerId - use 'id' consistently
        phone: phone || userData.phoneNumber,
        name: userData.name || null,
        email: userData.email || null,
        hasAddresses: hasAddresses || false,
        createdAt: userData.createdAt || null,
        updatedAt: userData.updatedAt || null,
      };

      console.log('👤 Mapped user object:', userObj);

      // Save to state
      setUser(userObj);
      setIsLoggedIn(true);

      // Persist to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(userObj));
      await AsyncStorage.setItem('authToken', token || '');
      await AsyncStorage.setItem('isLoggedIn', 'true');

      console.log('✅ User logged in successfully');
      console.log('💾 Stored in AsyncStorage - User ID:', userObj.id);

      return { success: true, user: userObj };
    } catch (error) {
      console.error('❌ Error during login:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('🚪 Logging out user');

      // Clear state
      setUser(null);
      setIsLoggedIn(false);

      // Clear AsyncStorage
      await AsyncStorage.multiRemove(['user', 'authToken', 'isLoggedIn']);

      console.log('✅ User logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error during logout:', error);
      return { success: false, error: error.message };
    }
  };

  // Update user data
  const updateUser = async (newData) => {
    try {
      const updatedUser = { ...user, ...newData };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('✅ User data updated:', updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('❌ Error updating user data:', error);
      return { success: false, error: error.message };
    }
  };

  // Get customer ID (helper method)
  const getCustomerId = () => {
    return user?.id || null;
  };

  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    logout,
    updateUser,
    getCustomerId, // Helper to get customer ID
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};