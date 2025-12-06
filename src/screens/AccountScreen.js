// ========================================
// src/screens/AccountScreen.js - SIMPLIFIED FIX
// ========================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import customerService from '../services/customerService';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { useAddress } from '../context/AddressContext';

const AccountScreen = ({ navigation }) => {
  const { isLoggedIn, user, logout } = useAuth();
  const { addresses, fetchAddresses } = useAddress();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Stats data state
  const [stats, setStats] = useState({
    orderCount: 0,
    addressCount: 0,
    totalSavings: 0,
    loading: true
  });

  const menuItems = [
    {
      id: 1,
      icon: 'person',
      title: 'Edit Profile',
      subtitle: 'Update your information',
      screen: 'EditProfile', // ✅ Now inside AccountStack
    },
    {
      id: 2,
      icon: 'location-on',
      title: 'Addresses',
      subtitle: 'Manage delivery addresses',
      screen: 'AddressManagement', // ✅ Now inside AccountStack
    },
    {
      id: 3,
      icon: 'shopping-bag',
      title: 'Orders',
      subtitle: 'View order history',
      screen: 'OrderHistory', // ✅ Now inside AccountStack
    },
  ];

  useEffect(() => {
    if (!isLoggedIn || !user) {
      Alert.alert('Login Required', 'Please login to access your account.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Cart'),
        },
      ]);
      return;
    }

    Promise.all([
      loadCustomerData(),
      loadUserStats()
    ]);
  }, [isLoggedIn, user]);

  // ✅ Reload data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (isLoggedIn && user) {
        Promise.all([
          loadCustomerData(),
          loadUserStats()
        ]);
      }
    });

    return unsubscribe;
  }, [navigation, isLoggedIn, user]);

  // Update stats when addresses change
  useEffect(() => {
    if (stats.loading === false) { // Only update if initial load is complete
      console.log('🔄 Updating stats due to address change:', addresses.length);
      setStats(prev => ({
        ...prev,
        addressCount: addresses.length
      }));
    }
  }, [addresses, stats.loading]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const customerId = user?.id || user?.userId;

      if (customerId) {
        console.log('Fetching customer data for ID:', customerId);
        
        // Fetch addresses for this customer
        console.log('Fetching addresses for customer:', customerId);
        await fetchAddresses(customerId);
        
        try {
          const customerData = await customerService.getCustomerById(customerId);
          console.log('Customer data received:', customerData);
          setCustomer(customerData);
        } catch (customerError) {
          // If customer record doesn't exist (404), use auth user data as fallback
          if (customerError.message === 'Not Found' || customerError.response?.status === 404) {
            console.log('Customer record not found, using auth user data as fallback');
            setCustomer({
              id: customerId,
              name: user?.name || 'User',
              email: user?.email || '',
              phone: user?.phone || '',
              // Add any other fields that match the expected customer structure
            });
          } else {
            // For other errors, still use fallback data but log the error
            console.warn('API error, using fallback user data:', customerError);
            setCustomer({
              id: customerId,
              name: user?.name || 'User',
              email: user?.email || '',
              phone: user?.phone || '',
            });
          }
        }
      } else {
        // No customer ID available, use auth user data
        setCustomer({
          id: null,
          name: user?.name || 'User',
          email: user?.email || '',
          phone: user?.phone || '',
        });
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
      // Set fallback data even on general errors
      setCustomer({
        id: user?.id || user?.userId,
        name: user?.name || 'User',
        email: user?.email || '',
        phone: user?.phone || '',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const customerId = user?.id || user?.userId;
    await Promise.all([
      loadCustomerData(),
      loadUserStats(),
      // Also refresh addresses manually to ensure we have latest data
      customerId ? fetchAddresses(customerId) : Promise.resolve()
    ]);
    setRefreshing(false);
  };

  // Load user statistics
  const loadUserStats = async () => {
    const customerId = user?.id || user?.userId;
    if (!customerId) {
      console.log('No customer ID found for stats');
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      console.log('Loading stats for customer ID:', customerId);
      setStats(prev => ({ ...prev, loading: true }));
      
      // Fetch orders
      let orderCount = 0;
      let totalSavings = 0;
      
      try {
        console.log('Fetching orders...');
        const orders = await orderService.getOrdersByCustomerId(customerId);
        console.log('Orders API response:', orders);
        
        if (orders && typeof orders === 'object') {
          // Handle different response formats
          let ordersArray = [];
          if (Array.isArray(orders)) {
            ordersArray = orders;
          } else if (orders.data && Array.isArray(orders.data)) {
            ordersArray = orders.data;
          } else if (orders.orders && Array.isArray(orders.orders)) {
            ordersArray = orders.orders;
          }
          
          orderCount = ordersArray.length;
          console.log('📊 Order count calculation:', {
            arrayLength: ordersArray.length,
            orderCount: orderCount,
            ordersArray: ordersArray
          });
          console.log('Orders array length:', ordersArray.length);
        console.log('First order sample:', ordersArray[0] ? JSON.stringify(ordersArray[0], null, 2) : 'No orders');
          
          // Calculate total savings from orders with comprehensive strategies
          totalSavings = ordersArray.reduce((total, order) => {
            let orderSavings = 0;
            
            // Enhanced debugging - log all available fields
            console.log(`🔍 Order ${order.id || 'unknown'} - Available fields:`, Object.keys(order));
            
            // Strategy 1: Direct discount fields (most reliable)
            if (order.discountAmount && order.discountAmount > 0) {
              orderSavings = order.discountAmount;
              console.log(`✅ Strategy 1 - Direct discount: ${orderSavings}`);
            }
            // Strategy 2: Original vs final price
            else if (order.originalAmount && order.finalAmount) {
              orderSavings = order.originalAmount - order.finalAmount;
              console.log(`✅ Strategy 2 - Original vs final: ${orderSavings}`);
            }
            // Strategy 3: Total vs paid/final amount
            else if (order.totalAmount) {
              const finalAmt = order.finalAmount || order.paidAmount || order.amountPaid || order.netAmount;
              if (finalAmt && finalAmt < order.totalAmount) {
                orderSavings = order.totalAmount - finalAmt;
                console.log(`✅ Strategy 3 - Total vs final: ${orderSavings}`);
              }
            }
            // Strategy 4: Discount percentage
            else if (order.discountPercentage && order.discountPercentage > 0 && order.totalAmount) {
              orderSavings = (order.totalAmount * order.discountPercentage) / 100;
              console.log(`✅ Strategy 4 - Percentage discount: ${orderSavings}`);
            }
            // Strategy 5: Coupon/promo code discount
            else if (order.couponDiscount && order.couponDiscount > 0) {
              orderSavings = order.couponDiscount;
              console.log(`✅ Strategy 5 - Coupon discount: ${orderSavings}`);
            }
            // Strategy 6: Item-level savings
            else if (order.orderItems && Array.isArray(order.orderItems)) {
              orderSavings = order.orderItems.reduce((itemTotal, item) => {
                // Check various possible field names for prices
                const itemOriginalPrice = item.originalPrice || item.listPrice || item.mrp || item.price;
                const itemFinalPrice = item.finalPrice || item.sellingPrice || item.discountedPrice;
                
                if (itemOriginalPrice && itemFinalPrice && itemOriginalPrice > itemFinalPrice) {
                  const itemSavings = (itemOriginalPrice - itemFinalPrice) * (item.quantity || 1);
                  return itemTotal + itemSavings;
                }
                return itemTotal;
              }, 0);
              if (orderSavings > 0) {
                console.log(`✅ Strategy 6 - Item level savings: ${orderSavings}`);
              }
            }
            // Strategy 7: Tax/deliivery savings (less common)
            else if (order.taxSavings && order.taxSavings > 0) {
              orderSavings = order.taxSavings;
              console.log(`✅ Strategy 7 - Tax savings: ${orderSavings}`);
            }
            
            console.log(`💰 Order ${order.id || 'unknown'} final savings: ${orderSavings}`);
            return total + Math.max(0, orderSavings);
          }, 0);
          
        } else {
          console.log('Orders response is not in expected format');
        }
        
        // No demo data - show real calculated values only
        console.log('📊 Real data mode - Order count:', orderCount);
        
      } catch (orderError) {
        console.error('Error fetching orders:', orderError);
        orderCount = 0;
        totalSavings = 0;
      }

      // Get real address count from AddressContext (already loaded in loadCustomerData)
      const addressCount = addresses.length;
      console.log('📍 Address count from AddressContext:', addressCount, 'addresses:', addresses);
      
      // Analyze why savings might be 0
      if (orderCount > 0 && totalSavings === 0) {
        console.log('💡 Analysis: Orders found but no savings calculated. This means:');
        console.log('   - No discount fields in the order data (discountAmount, finalAmount, etc.)');
        console.log('   - No price differences between original and final prices');
        console.log('   - Items were purchased at full price without discounts');
        console.log('   💰 This is normal for orders without promotional pricing');
      }
      
      // No demo fallbacks - show real calculated values only
      console.log('Final calculation - Order count:', orderCount, 'Total savings:', totalSavings);
      
      const finalStats = {
        orderCount,
        addressCount,
        totalSavings: Math.round(totalSavings * 100) / 100, // Round to 2 decimal places
        loading: false
      };
      
      console.log('Final loaded stats:', finalStats);
      
      // Log what will be displayed
      console.log('📊 Displaying stats:', {
        Orders: finalStats.orderCount,
        Addresses: finalStats.addressCount,
        Savings: `₹${finalStats.totalSavings}`
      });
      
      // Final debug - ensure state is being set
      console.log('🔄 Setting stats state with:', finalStats);
      setStats(finalStats);

    } catch (error) {
      console.error('Error loading user stats:', error);
      setStats({
        orderCount: 0,
        addressCount: 0,
        totalSavings: 0,
        loading: false
      });
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await logout();
              if (result.success) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              } else {
                Alert.alert('Error', 'Failed to logout');
              }
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleMenuPress = (item) => {
    const customerId = customer?.id || user?.id || user?.userId;

    // ✅ SIMPLE FIX: Navigate within the same stack
    if (item.screen) {
      navigation.navigate(item.screen, { customerId });
    } else {
      Alert.alert('Coming Soon', `${item.title} feature will be available soon!`);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0b8a0b" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0b8a0b" barStyle="light-content" />
      
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0b8a0b']}
          />
        }
      >
        {/* Compact Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(customer?.name || user?.name || 'User')}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{customer?.name || user?.name || 'Guest User'}</Text>
              <Text style={styles.userEmail}>{customer?.email || user?.email || 'No email'}</Text>
              {customer?.phone || user?.phone ? (
                <Text style={styles.userPhone}>{customer?.phone || user?.phone}</Text>
              ) : null}
            </View>
          </View>
          
          {/* Integrated Edit Icon */}
          <TouchableOpacity
            style={styles.editIconButton}
            onPress={() => handleMenuPress({ screen: 'EditProfile' })}
            activeOpacity={0.7}
          >
            <Icon name="edit" size={20} color="#0b8a0b" />
          </TouchableOpacity>
        </View>
        
        {/* Quick Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {stats.loading ? '...' : stats.orderCount}
            </Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {stats.loading ? '...' : stats.addressCount}
            </Text>
            <Text style={styles.statLabel}>Addresses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {stats.loading ? '...' : `₹${stats.totalSavings}`}
            </Text>
            <Text style={styles.statLabel}>Savings</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconContainer}>
                  <Icon name={item.icon} size={22} color="#0b8a0b" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Footer Actions */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => Alert.alert('Support', 'Contact support at support@freshchicken.com')}
            activeOpacity={0.8}
          >
            <Icon name="support-agent" size={18} color="#666" />
            <Text style={styles.supportText}>Need Help?</Text>
          </TouchableOpacity>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>Version 1.0.0</Text>
            <Text style={styles.appInfoText}>© 2024 Fresh Chicken</Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Icon name="logout" size={18} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#0b8a0b',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  profileHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0b8a0b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#888',
  },
  editIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f9f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0b8a0b',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0b8a0b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f9f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 11,
    color: '#999',
  },
  footerContainer: {
    marginTop: 8,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  appInfoText: {
    fontSize: 11,
    color: '#bbb',
    marginBottom: 2,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AccountScreen;
