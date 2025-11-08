import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFA from 'react-native-vector-icons/FontAwesome';
import { useCart } from '../context/CartContext';
import ToastNotification from '../components/ToastNotification';

const { width, height } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  // Handle both cases: direct product object or nested product.product
  const passedProduct = route.params?.product;
  const productData = passedProduct?.product || passedProduct;
  
  console.log("passedProduct:", passedProduct);
  console.log("productData:", productData);
  
  // Check if product data exists
  if (!productData) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color="#999" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fromCart = route.params?.fromCart || false;
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, getTotalItems, getTotalPrice, toast, hideToast } = useCart();

  // Extract product details with fallbacks
  const product = {
    id: productData.id,
    title: productData.title || productData.name || 'Product',
    price: productData.price || passedProduct?.price || 0,
    originalPrice: productData.originalPrice || passedProduct?.originalPrice,
    discount: productData.discountPercentage 
      ? `${productData.discountPercentage}% OFF` 
      : passedProduct?.discount,
    image: productData.imagePath 
      ? { uri: `http://192.168.0.127:8080/api/products/images/${productData.imagePath}` }
      : passedProduct?.image || require('../assets/images/careo-5.jpg'),
    description: productData.description || 'Premium quality product sourced from trusted suppliers.',
  };

  const handleWhatsAppShare = () => {
    const message = `Check out this product: ${product.title} - ₹${product.price}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Make sure WhatsApp is installed on your device');
    });
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleAddToCart = () => {
    try {
      // Create a complete product object for the cart
      const cartProduct = {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        originalPrice: product.originalPrice,
        discount: product.discount,
        product: productData, // Keep original data
      };
      
      addToCart(cartProduct, quantity);
      // Toast will be shown automatically by CartContext
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart');
      console.error('Add to cart error:', error);
    }
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />

      {/* Toast Notification */}
      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Fixed Top Icons - Stay on top while scrolling */}
      <SafeAreaView style={styles.topIconsContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Right Side Icons */}
        <View style={styles.rightIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleFavorite}
          >
            <Icon
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={24}
              color={isFavorite ? '#ff4444' : '#fff'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleWhatsAppShare}
          >
            <IconFA name="whatsapp" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Scrollable Content including Image */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image - Now Scrollable */}
        <View style={styles.imageContainer}>
          <Image source={product.image} style={styles.productImage} resizeMode="cover" />
          {/* Gradient Overlay for better icon visibility at top */}
          <View style={styles.gradientOverlay} />
          
          {/* Discount Badge on Image */}
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount}</Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {/* Product Title */}
          <Text style={styles.productTitle}>{product.title}</Text>

          {/* Price Section */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>₹{product.price}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPriceText}>₹{product.originalPrice}</Text>
            )}
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
                onPress={decreaseQuantity}
                disabled={quantity === 1}
              >
                <Icon name="remove" size={20} color={quantity === 1 ? '#ccc' : '#0b8a0b'} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={increaseQuantity}
              >
                <Icon name="add" size={20} color="#0b8a0b" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <Text style={styles.description}>
              {product.description || 'Our premium fresh chicken is sourced from trusted local farms, ensuring the highest quality and freshness. Each piece is carefully selected and hygienically packed to maintain its natural flavor and nutritional value. Perfect for grilling, roasting, or curry preparations. Rich in protein and low in fat, this chicken is ideal for health-conscious consumers looking for quality meat products.'}
            </Text>
          </View>

          {/* Storage Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Storage Instructions</Text>
            <Text style={styles.description}>
              • Store in refrigerator at 0-4°C immediately after purchase{'\n'}
              • Use within 2 days of purchase for best quality{'\n'}
              • For longer storage, freeze at -18°C or below{'\n'}
              • Thaw frozen chicken in refrigerator before cooking{'\n'}
              • Do not refreeze once thawed{'\n'}
              • Keep raw chicken separate from cooked foods
            </Text>
          </View>

          {/* Marketed By */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Marketed By</Text>
            <Text style={styles.description}>
              Fresh Chicken Mart Private Limited{'\n'}
              Namakkal, Tamil Nadu - 637001{'\n'}
              FSSAI License No: 12345678901234{'\n'}
              Customer Care: +91 9876543210
            </Text>
          </View>

          {/* Extra space for bottom fixed sections */}
          <View style={{ height: totalItems > 0 ? 160 : 100 }} />
        </View>
      </ScrollView>

      {/* Cart Summary Bar - Shows when items in cart */}
      {totalItems > 0 && !fromCart && (
        <View style={styles.cartSummaryBar}>
          <View style={styles.cartSummaryContent}>
            <Text style={styles.cartSummaryText}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'} | ₹{totalPrice.toFixed(2)}
            </Text>
            <TouchableOpacity
              style={styles.viewCartButton}
              onPress={() => navigation.navigate('Cart')}
            >
              <Text style={styles.viewCartText}>View Cart</Text>
              <Icon name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Fixed Bottom Section - Add to Cart Button (Hide if from cart) */}
      {!fromCart && (
        <View style={[styles.bottomSection, totalItems > 0 && styles.bottomSectionWithCart]}>
          <View style={styles.bottomContainer}>
            {/* Left Side - Total Price */}
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Total Price</Text>
              <Text style={styles.price}>
                ₹{(product.price * quantity).toFixed(2)}
              </Text>
              {quantity > 1 && (
                <Text style={styles.perItemText}>
                  ₹{product.price} × {quantity}
                </Text>
              )}
            </View>

            {/* Right Side - Add Button & Delivery Info */}
            <View style={styles.addSection}>
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={handleAddToCart}
              >
                <Icon name="shopping-cart" size={20} color="#fff" />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>

              {/* Delivery Info */}
              <View style={styles.deliveryInfo}>
                <Icon name="local-shipping" size={14} color="#0b8a0b" />
                <Text style={styles.deliveryText}>Delivered within 30 minutes</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#0b8a0b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  topIconsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  rightIcons: {
    flexDirection: 'row',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageContainer: {
    width: width,
    height: height * 0.4,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    elevation: 3,
  },
  discountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 16,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0b8a0b',
    marginRight: 12,
  },
  originalPriceText: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    margin: 4,
  },
  quantityButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  // Cart Summary Bar Styles
  cartSummaryBar: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderTopColor: '#0b8a0b',
    borderBottomColor: '#0b8a0b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 15,
    shadowColor: '#0b8a0b',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cartSummaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartSummaryText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0b8a0b',
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b8a0b',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#0b8a0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  viewCartText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 4,
  },
  // Bottom Section Styles
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomSectionWithCart: {
    elevation: 12,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  perItemText: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  addSection: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  addToCartButton: {
    backgroundColor: '#0b8a0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#0b8a0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  deliveryText: {
    fontSize: 11,
    color: '#0b8a0b',
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default ProductDetailScreen;