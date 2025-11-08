// src/screens/CartScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAddress } from '../context/AddressContext';
import authService from '../services/authService';

const CartScreen = ({ navigation }) => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();
  const { isLoggedIn, login, user } = useAuth();
  const { addresses, fetchAddresses, setCustomerIdManually } = useAddress();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);

  // Log user and addresses when they change
  useEffect(() => {
    console.log('🛒 CartScreen - Current user:', user);
    console.log('🛒 CartScreen - Is logged in:', isLoggedIn);
    console.log('🛒 CartScreen - Addresses:', addresses);
  }, [user, isLoggedIn, addresses]);

  const handleQuantityChange = (itemId, change) => {
    const item = cartItems.find((i) => i.id === itemId);
    const newQuantity = item.quantity + change;

    if (newQuantity === 0) {
      Alert.alert(
        'Remove Item',
        'Do you want to remove this item from cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', onPress: () => removeFromCart(itemId), style: 'destructive' },
        ]
      );
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
      return;
    }

    console.log('🛒 Proceeding to checkout...');
    console.log('🛒 Is logged in:', isLoggedIn);

    // Check if user is logged in
    if (!isLoggedIn) {
      console.log('🔐 User not logged in - showing auth modal');
      setShowAuthModal(true);
    } else {
      console.log('✅ User is logged in - checking addresses');
      // User is logged in, check if they have addresses
      checkAndNavigate();
    }
  };

  const checkAndNavigate = () => {
    console.log('🗺️ Checking addresses for navigation');
    console.log('📍 Current addresses count:', addresses.length);
    console.log('👤 Current user ID:', user);
    
    // Check if user has any addresses
    if (!addresses || addresses.length === 0) {
      console.log('➕ No addresses found - navigating to add address');
      // No addresses - navigate to add address screen
      navigation.navigate('AddEditAddress', { 
        mode: 'add',
        isFirstTime: true,
        customerId: user?.userId, // Pass customer ID explicitly
      });
    } else {
      console.log('📋 Addresses found - navigating to address selection');
      // Has addresses - navigate to address selection
      navigation.navigate('AddressSelection',  { customerId: user.userId } );
    }
  };

  const handleSendOTP = async () => {
    // Validate phone number
    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }

    console.log('📤 Sending OTP to:', phoneNumber);
    setLoading(true);
    
    try {
      const response = await authService.sendOtp(phoneNumber);
      console.log('📨 Send OTP response:', response);
      
      if (response.success) {
        setShowOtpInput(true);
        Alert.alert('OTP Sent', `Verification code sent to ${phoneNumber}`);
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    // Validate OTP
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    console.log('🔐 Verifying OTP...');
    setLoading(true);
    
    try {
      const response = await authService.verifyOtp(phoneNumber, otp);
      console.log('✅ Verify OTP response:', response);

      if (response.success) {
        console.log('✅ OTP Verified successfully');
        console.log('👤 User data:', response.user);
        console.log('🏠 Has addresses:', response.hasAddresses);
        
        // ✅ CRITICAL: Login with proper data structure
        const loginResult = await login({ 
          phone: phoneNumber,
          userData: response.user, // Backend UserDto
          token: response.token || '',
          hasAddresses: response.hasAddresses || false,
        });
        
        console.log('🔐 Login result:', loginResult);
        
        if (loginResult.success) {
          // ✅ CRITICAL: Update AddressContext with customer ID
          const customerId = response.user.id;
          console.log('📍 Setting customer ID in AddressContext:', customerId);
          await setCustomerIdManually(customerId);
          
          // Close the auth modal
          setShowAuthModal(false);
          setPhoneNumber('');
          setOtp('');
          setShowOtpInput(false);
          
          Alert.alert('Success', 'Login successful!');
          
          // Wait a bit for state to update
          setTimeout(() => {
            console.log('🚀 Navigating based on address status...');
            console.log('🏠 Has addresses from backend:', response.hasAddresses);
            
            if (!response.hasAddresses) {
              console.log('➕ No addresses - navigating to add address');
              // First time user or no addresses - go directly to add address screen
              navigation.navigate('AddEditAddress', { 
                mode: 'add',
                isFirstTime: true,
                customerId: customerId,
              });
            } else {
              console.log('📋 Has addresses - navigating to address selection');
              // Existing user with addresses - show address selection
              navigation.navigate('AddressSelection');
            }
          }, 500);
        } else {
          Alert.alert('Error', 'Login failed. Please try again.');
        }
      } else {
        Alert.alert('Invalid OTP', response.message || 'Please enter the correct OTP');
      }
    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    console.log('🔄 Resending OTP...');
    setLoading(true);
    
    try {
      const response = await authService.sendOtp(phoneNumber);
      if (response.success) {
        Alert.alert('OTP Resent', 'A new verification code has been sent');
      } else {
        Alert.alert('Error', response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    setPhoneNumber('');
    setOtp('');
    setShowOtpInput(false);
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={item.image} style={styles.itemImage} />
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, -1)}
            activeOpacity={0.7}
          >
            <Icon name="remove" size={18} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, 1)}
            activeOpacity={0.7}
          >
            <Icon name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeFromCart(item.id)}
        activeOpacity={0.7}
      >
        <Icon name="delete" size={24} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Icon name="shopping-cart" size={100} color="#ccc" />
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>Add items to get started</Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const deliveryCharge = getTotalPrice() > 500 ? 0 : 40;
  const subtotal = getTotalPrice();
  const total = subtotal + deliveryCharge;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cartItems.length > 0 && (
          <Text style={styles.itemCount}>{getTotalItems()} items</Text>
        )}
      </View>

      {cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          {/* Cart Items List */}
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Price Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{subtotal}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Charges</Text>
              <Text style={[styles.summaryValue, deliveryCharge === 0 && styles.freeText]}>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </Text>
            </View>

            {deliveryCharge === 0 && (
              <View style={styles.savingsNote}>
                <Icon name="check-circle" size={16} color="#0b8a0b" />
                <Text style={styles.savingsText}>
                  You're saving ₹40 on delivery!
                </Text>
              </View>
            )}

            {deliveryCharge > 0 && (
              <View style={styles.deliveryNote}>
                <Icon name="info" size={16} color="#ff9800" />
                <Text style={styles.deliveryNoteText}>
                  Add ₹{500 - subtotal} more for FREE delivery
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>

            {/* Proceed to Checkout Button */}
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleProceedToCheckout}
              activeOpacity={0.8}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              <Icon name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Authentication Modal */}
      <Modal
        visible={showAuthModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseAuthModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseAuthModal}
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>

            <Icon name="lock" size={60} color="#0b8a0b" />
            <Text style={styles.modalTitle}>
              {showOtpInput ? 'Verify OTP' : 'Login to Continue'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {showOtpInput
                ? `Enter the 6-digit code sent to ${phoneNumber}`
                : 'Please enter your phone number to proceed with checkout'}
            </Text>

            {!showOtpInput ? (
              <>
                <View style={styles.inputContainer}>
                  <Icon name="phone" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.authButton, loading && styles.authButtonDisabled]}
                  onPress={handleSendOTP}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.authButtonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit OTP"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.authButton, loading && styles.authButtonDisabled]}
                  onPress={handleVerifyOTP}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.authButtonText}>Verify & Continue</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendOTP}
                  disabled={loading}
                >
                  <Text style={styles.resendText}>Didn't receive code? Resend</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles remain the same as your original
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 8,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b8a0b',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0b8a0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#0b8a0b',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  freeText: {
    color: '#0b8a0b',
  },
  savingsNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  savingsText: {
    fontSize: 13,
    color: '#0b8a0b',
    fontWeight: '600',
    marginLeft: 8,
  },
  deliveryNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  deliveryNoteText: {
    fontSize: 13,
    color: '#ff9800',
    fontWeight: '600',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0b8a0b',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b8a0b',
    paddingVertical: 14,
    borderRadius: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
    minHeight: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  authButton: {
    width: '100%',
    backgroundColor: '#0b8a0b',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resendButton: {
    marginTop: 20,
    padding: 8,
  },
  resendText: {
    fontSize: 14,
    color: '#0b8a0b',
    fontWeight: '600',
  },
});

export default CartScreen;