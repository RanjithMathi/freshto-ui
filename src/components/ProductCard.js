// src/components/ProductCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCart } from '../context/CartContext';
import { parsePrice, formatPrice } from '../utils/imageHelper';

const ProductCard = ({ image, title, price, originalPrice, discount, product, onPress, isHorizontal = false }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();

  // Check if product is in cart and get its quantity
  const cartItem = cartItems.find(item => item.id === product?.id);
  const isInCart = !!cartItem;
  const quantity = cartItem?.quantity || 0;

  // Handle ADD button click
  const handleAdd = (e) => {
    e.stopPropagation();
    
    // Ensure price is a number
    const numericPrice = parsePrice(price);
    
    const cartProduct = {
      id: product.id,
      title: title,
      price: numericPrice,
      image: image,
      originalPrice: originalPrice,
      discount: discount,
      product: product,
    };
    
    addToCart(cartProduct, 1);
  };

  // Handle quantity increase
  const handleIncrease = (e) => {
    e.stopPropagation();
    if (quantity < 99) { // Maximum limit
      updateQuantity(product.id, quantity + 1);
    }
  };

  // Handle quantity decrease
  const handleDecrease = (e) => {
    e.stopPropagation();
    if (quantity > 0) {
      updateQuantity(product.id, quantity - 1);
    }
  };

  // Format price for display
  const displayPrice = typeof price === 'number' ? formatPrice(price) : price;

  // Use different styles for horizontal layout
  const cardStyle = isHorizontal ? styles.horizontalCard : styles.card;
  const imageStyle = isHorizontal ? styles.horizontalImage : styles.image;

  return (
    <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image source={image} style={imageStyle} resizeMode="cover" />
        {discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{displayPrice}</Text>
            {originalPrice && (
              <Text style={styles.originalPrice}>{originalPrice}</Text>
            )}
          </View>
          
          {/* Show ADD button or Quantity controls based on cart state */}
          {!isInCart ? (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAdd}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={handleDecrease}
                activeOpacity={0.7}
              >
                <Icon name="remove" size={16} color="#0b8a0b" />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={handleIncrease}
                activeOpacity={0.7}
              >
                <Icon name="add" size={16} color="#0b8a0b" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  horizontalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#f5f5f5',
  },
  horizontalImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    height: 40,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'column',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0b8a0b',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  // ADD Button Styles
  addButton: {
    backgroundColor: '#0b8a0b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    elevation: 2,
    shadowColor: '#0b8a0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Quantity Controls Styles
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    elevation: 1,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
});

export default ProductCard;