import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCart } from '../context/CartContext';

const OrderSuccessScreen = ({ navigation, route }) => {
  const { orderId, orderData } = route.params;
  const { clearCart } = useCart();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Handle hardware back button and prevent going back
  useEffect(() => {
    // Clear the cart when this screen loads
    clearCart();
    
    const backAction = () => {
      // Navigate to Home tab when back button is pressed
      handleContinueShopping();
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      backHandler.remove();
    };
  }, [navigation]);

  useEffect(() => {
    // Debug: Log the orderData to see its structure
    console.log('OrderSuccessScreen - Full orderData:', JSON.stringify(orderData, null, 2));
    console.log('OrderSuccessScreen - deliverySlot:', orderData?.deliverySlot);
    console.log('OrderSuccessScreen - paymentMethod:', orderData?.paymentMethod);
    
    // Success animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleTrackOrder = () => {
    navigation.navigate('OrderTracking', { orderId, orderData });
  };

  const handleContinueShopping = () => {
    // Get the parent tab navigator
    const parent = navigation.getParent();
    
    if (parent) {
      // Switch to Home tab - this will cause Cart stack to unmount
      parent.navigate('Home');
    }
  };

  // Extract delivery slot parts
  const getDeliveryDate = () => {
    if (orderData?.deliverySlot) {
      const parts = orderData.deliverySlot.split(' - ');
      return parts[0] || 'Not specified';
    }
    return 'Not specified';
  };

  const getDeliveryTime = () => {
    if (orderData?.deliverySlot) {
      const parts = orderData.deliverySlot.split(' - ');
      if (parts.length > 1) {
        return parts.slice(1).join(' - ');
      }
    }
    return 'Not specified';
  };

  const getEstimatedDeliveryTime = () => {
    const time = getDeliveryTime();
    if (time !== 'Not specified') {
      const timeParts = time.split('-');
      return timeParts.length > 1 ? timeParts[1].trim() : time;
    }
    return '8:30 PM';
  };

  const getPaymentMethodDisplay = () => {
    const method = orderData?.paymentMethod?.toUpperCase();
    switch (method) {
      case 'COD':
        return 'Cash on Delivery';
      case 'UPI':
        return 'UPI Payment';
      case 'CARD':
        return 'Credit/Debit Card';
      default:
        return method || 'Not specified';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Animation */}
        <Animated.View
          style={[
            styles.successCircle,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Icon name="check-circle" size={100} color="#0b8a0b" />
        </Animated.View>

        {/* Success Message */}
        <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for your order. We'll deliver it soon.
          </Text>
        </Animated.View>

        {/* Order Details Card */}
        <Animated.View style={[styles.orderCard, { opacity: fadeAnim }]}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderLabel}>Order ID</Text>
            <Text style={styles.orderId}>#{orderData?.id}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Icon name="calendar-today" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Delivery Date</Text>
              <Text style={styles.detailValue}>{getDeliveryDate()}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="schedule" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Delivery Time</Text>
              <Text style={styles.detailValue}>{getDeliveryTime()}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="location-on" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Delivery Address</Text>
              <Text style={styles.detailValue}>
                {orderData?.deliveryAddressLine1}
              </Text>
              {orderData?.deliveryAddressLine2 && (
                <Text style={styles.detailValueSub}>
                  {orderData?.deliveryAddressLine2}
                </Text>
              )}
              {orderData?.deliveryLandmark && (
                <Text style={styles.detailValueSub}>
                  Near: {orderData?.deliveryLandmark}
                </Text>
              )}
              <Text style={styles.detailValueSub}>
                {orderData?.deliveryCity}, {orderData?.deliveryState} - {orderData?.deliveryZipCode}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.paymentRow}>
            <View style={styles.paymentLeft}>
              <Icon name="payment" size={20} color="#666" />
              <Text style={styles.paymentLabel}>Payment Method</Text>
            </View>
            <Text style={styles.paymentValue}>
              {getPaymentMethodDisplay()}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{orderData?.totalAmount?.toFixed(2)}</Text>
          </View>
        </Animated.View>

        {/* Estimated Delivery */}
        <Animated.View style={[styles.estimateCard, { opacity: fadeAnim }]}>
          <Icon name="local-shipping" size={24} color="#0b8a0b" />
          <View style={styles.estimateContent}>
            <Text style={styles.estimateLabel}>Estimated Delivery By</Text>
            <Text style={styles.estimateTime}>{getEstimatedDeliveryTime()}</Text>
          </View>
        </Animated.View>

        {/* Order Items Summary */}
        <Animated.View style={[styles.itemsCard, { opacity: fadeAnim }]}>
          <Text style={styles.itemsTitle}>Order Summary</Text>
          <View style={styles.itemsCount}>
            <Icon name="shopping-bag" size={18} color="#666" />
            <Text style={styles.itemsText}>
              {orderData?.orderItems?.length || 0} item(s) ordered
            </Text>
          </View>
          
          {/* Show order items */}
          {orderData?.orderItems?.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.orderItemName} numberOfLines={1}>
                {item.productName}
              </Text>
              <View style={styles.orderItemDetails}>
                <Text style={styles.orderItemQty}>Qty: {item.quantity}</Text>
                <Text style={styles.orderItemPrice}>₹{item.subtotal?.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={handleTrackOrder}
            activeOpacity={0.8}
          >
            <Icon name="local-shipping" size={20} color="#fff" />
            <Text style={styles.trackButtonText}>Track Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinueShopping}
            activeOpacity={0.8}
          >
            <Icon name="shopping-cart" size={20} color="#0b8a0b" />
            <Text style={styles.continueButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Help Section */}
        <Animated.View style={[styles.helpCard, { opacity: fadeAnim }]}>
          <Icon name="headset-mic" size={20} color="#666" />
          <Text style={styles.helpText}>
            Need help? Contact our support team
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  successCircle: {
    marginTop: 40,
    marginBottom: 24,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0b8a0b',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  orderCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  orderLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailValueSub: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f9f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0b8a0b',
  },
  estimateCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0b8a0b',
  },
  estimateContent: {
    marginLeft: 12,
  },
  estimateLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  estimateTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b8a0b',
  },
  itemsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  itemsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  itemsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  orderItemName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  orderItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderItemQty: {
    fontSize: 13,
    color: '#666',
    marginRight: 12,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0b8a0b',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 16,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b8a0b',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0b8a0b',
    paddingVertical: 14,
    borderRadius: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0b8a0b',
    marginLeft: 8,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
});

export default OrderSuccessScreen;