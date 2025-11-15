import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCart } from '../context/CartContext';
import { useAddress } from '../context/AddressContext';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';

const OrderSummaryScreen = ({ navigation, route }) => {
  const { address,customerId } = route.params || {};
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { selectedAddress } = route.params || {};
  const { deliverySlot, createOrder, calculateOrderTotal } = useOrder();
  const { isLoggedIn, user, login } = useAuth();
  
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const deliveryCharge = getTotalPrice() > 500 ? 0 : 40;
  const totals = calculateOrderTotal(cartItems, deliveryCharge);

  const paymentMethods = [
    { id: 'cod', label: 'Cash on Delivery', icon: 'money', available: true },
    { id: 'upi', label: 'UPI (GPay, PhonePe, Paytm)', icon: 'account-balance-wallet', available: true },
    { id: 'card', label: 'Credit/Debit Card', icon: 'credit-card', available: true },
  ];

  const handlePlaceOrder = async () => {
    console.log("address route", address);

    // Check if user is logged in
    if (!isLoggedIn || !user) {
      Alert.alert(
        'Login Required',
        'Please login with your mobile number to place an order.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Login',
            onPress: () => navigation.navigate('Cart') // Navigate back to cart where auth modal is shown
          }
        ]
      );
      return;
    }

    // Validation checks
    const currentAddress = address || selectedAddress;

    if (!currentAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (!deliverySlot) {
      Alert.alert('Error', 'Please select a delivery time slot');
      return;
    }

    if (!selectedPayment) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Prepare order data matching your new CreateOrderRequest DTO
      const orderRequest = {
        customerId: user.userId || user.id, // Use customer ID from AuthContext - fallback to userId
        addressId: currentAddress.id, // Use the address ID instead of full object
        deliverySlot: `${deliverySlot.date} - ${deliverySlot.time}`,
        paymentMethod: selectedPayment.toUpperCase(), // COD, UPI, CARD
        specialInstructions: '', // Add a field in UI if you want users to add notes
        orderItems: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      console.log('Placing order with request:', orderRequest);

      // Call the order service to create order
      const createdOrder = await orderService.createOrder(orderRequest);
      
      console.log('Order created successfully:', createdOrder);

      // Store order locally in context (optional)
      createOrder({
        id: createdOrder.id,
        customerId: createdOrder.customerId,
        items: createdOrder.orderItems,
        address: {
          addressLine1: createdOrder.deliveryAddressLine1,
          addressLine2: createdOrder.deliveryAddressLine2,
          city: createdOrder.deliveryCity,
          state: createdOrder.deliveryState,
          zipCode: createdOrder.deliveryZipCode,
          landmark: createdOrder.deliveryLandmark,
          contactPhone: createdOrder.deliveryContactPhone,
        },
        totalAmount: createdOrder.totalAmount,
        status: createdOrder.status,
        orderDate: createdOrder.orderDate,
      });
      
      // Clear the cart
      clearCart();
      
    // Navigate directly to OrderSuccess screen
  navigation.replace('OrderSuccess', {
    orderId: createdOrder.id,
    orderData: {
    ...createdOrder,
    // Add the delivery slot and payment method since API might not return them
    deliverySlot: `${deliverySlot.date} - ${deliverySlot.time}`,
    paymentMethod: selectedPayment.toUpperCase(),
  }
  });

    } catch (error) {
      console.error('Order placement error:', error);
      
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.response) {
        // Server responded with error
        console.log('Error response:', error.response.data);
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      Alert.alert('Order Failed', errorMessage, [
        {
          text: 'Retry',
          onPress: handlePlaceOrder
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const renderAddressSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Icon name="location-on" size={22} color="#0b8a0b" />
          <Text style={styles.sectionTitle}>Delivery Address</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AddressSelection')}>
          <Text style={styles.editText}>Change</Text>
        </TouchableOpacity>
      </View>

      {(address || selectedAddress) ? (
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressType}>
              {address?.addressType || selectedAddress?.addressType}
            </Text>
            {(address?.isDefault || selectedAddress?.isDefault) && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={styles.addressName}>
            {address?.addressLine1 || selectedAddress?.addressLine1}
          </Text>
          <Text style={styles.addressPhone}>
            {address?.contactPhone || selectedAddress?.contactPhone}
          </Text>
          <Text style={styles.addressDetail}>
            {address?.addressLine2 || selectedAddress?.addressLine2}
          </Text>
          {(address?.landmark || selectedAddress?.landmark) && (
            <Text style={styles.addressDetail}>
              Near: {address?.landmark || selectedAddress?.landmark}
            </Text>
          )}
          <Text style={styles.addressDetail}>
            {address?.city || selectedAddress?.city}, {address?.state || selectedAddress?.state} - {address?.zipCode || selectedAddress?.zipCode}
          </Text>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.addAddressCard}
          onPress={() => navigation.navigate('AddressSelection')}
        >
          <Icon name="add-location" size={24} color="#0b8a0b" />
          <Text style={styles.addAddressText}>Add Delivery Address</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderDeliverySlot = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Icon name="schedule" size={22} color="#0b8a0b" />
          <Text style={styles.sectionTitle}>Delivery Time</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('TimeSlotSelection')}>
          <Text style={styles.editText}>Change</Text>
        </TouchableOpacity>
      </View>

      {deliverySlot ? (
        <View style={styles.slotCard}>
          <Icon name="calendar-today" size={18} color="#0b8a0b" />
          <View style={styles.slotInfo}>
            <Text style={styles.slotDate}>{deliverySlot.date}</Text>
            <Text style={styles.slotTime}>{deliverySlot.time}</Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.addAddressCard}
          onPress={() => navigation.navigate('TimeSlotSelection')}
        >
          <Icon name="schedule" size={24} color="#0b8a0b" />
          <Text style={styles.addAddressText}>Select Delivery Time</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCartItems = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Icon name="shopping-cart" size={22} color="#0b8a0b" />
          <Text style={styles.sectionTitle}>Order Items ({cartItems.length})</Text>
        </View>
      </View>

      {cartItems.map((item) => (
        <View key={item.id} style={styles.cartItem}>
          <Image source={item.image} style={styles.itemImage} />
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
          </View>
          <View style={styles.itemQuantity}>
            <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
            <Text style={styles.itemTotal}>
              ₹{(item.price) * item.quantity}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderPriceBreakdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Price Details</Text>
      
      <View style={styles.priceCard}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>₹{totals.subtotal}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Delivery Charges</Text>
          <Text style={[styles.priceValue, totals.deliveryCharge === 0 && styles.freeText]}>
            {totals.deliveryCharge === 0 ? 'FREE' : `₹${totals.deliveryCharge}`}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Tax (5%)</Text>
          <Text style={styles.priceValue}>₹{totals.tax}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{totals.total}</Text>
        </View>
      </View>

      {totals.deliveryCharge === 0 && (
        <View style={styles.savingsCard}>
          <Icon name="check-circle" size={18} color="#0b8a0b" />
          <Text style={styles.savingsText}>
            You saved ₹40 on delivery charges!
          </Text>
        </View>
      )}
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method</Text>

      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.paymentCard,
            selectedPayment === method.id && styles.paymentCardSelected,
          ]}
          onPress={() => setSelectedPayment(method.id)}
          activeOpacity={0.7}
          disabled={isPlacingOrder}
        >
          <View style={styles.paymentLeft}>
            <Icon
              name={selectedPayment === method.id ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={24}
              color={selectedPayment === method.id ? '#0b8a0b' : '#ccc'}
            />
            <Icon name={method.icon} size={24} color="#666" style={styles.paymentIcon} />
            <Text style={styles.paymentLabel}>{method.label}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          disabled={isPlacingOrder}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderAddressSection()}
        {renderDeliverySlot()}
        {renderCartItems()}
        {renderPriceBreakdown()}
        {renderPaymentMethods()}
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <View style={styles.footerTop}>
          <Text style={styles.footerLabel}>Total Amount</Text>
          <Text style={styles.footerTotal}>₹{totals.total}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            isPlacingOrder && styles.placeOrderButtonDisabled
          ]}
          onPress={handlePlaceOrder}
          activeOpacity={0.8}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.placeOrderText}>Placing Order...</Text>
            </>
          ) : (
            <>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <Icon name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 140,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  editText: {
    fontSize: 14,
    color: '#0b8a0b',
    fontWeight: '600',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addAddressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#0b8a0b',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAddressText: {
    fontSize: 14,
    color: '#0b8a0b',
    fontWeight: '600',
    marginLeft: 8,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0b8a0b',
  },
  defaultBadge: {
    backgroundColor: '#0b8a0b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  addressDetail: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  slotInfo: {
    marginLeft: 12,
  },
  slotDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 13,
    color: '#666',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemQuantity: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0b8a0b',
  },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  freeText: {
    color: '#0b8a0b',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b8a0b',
  },
  savingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  savingsText: {
    fontSize: 13,
    color: '#0b8a0b',
    fontWeight: '600',
    marginLeft: 8,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  paymentCardSelected: {
    borderColor: '#0b8a0b',
    backgroundColor: '#f0f9f0',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    marginLeft: 12,
    marginRight: 12,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerLabel: {
    fontSize: 14,
    color: '#666',
  },
  footerTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0b8a0b',
  },
  placeOrderButton: {
    backgroundColor: '#0b8a0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#7ab87a',
    opacity: 0.7,
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
    marginRight: 8,
  },
});

export default OrderSummaryScreen;