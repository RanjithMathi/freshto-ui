import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ProductCard from '../components/ProductCard';

// Import fallback images
import product1 from '../assets/images/careo-5.jpg';

const API_BASE_URL = 'http://192.168.0.127:8080';

const categories = ['All Categories', 'Chicken', 'Country Chicken', 'Egg'];

const CategoryProductsScreen = ({ route, navigation }) => {
  // Get initial category from navigation params
  const initialCategory = route?.params?.category || 'All Categories';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch products when category changes
  useEffect(() => {
    fetchProductsByCategory(selectedCategory);
  }, [selectedCategory]);

  const fetchProductsByCategory = async (category) => {
    try {
      setLoading(true);
      let url;

      if (category === 'All Categories') {
        // Fetch all available products
        url = `${API_BASE_URL}/api/products/available`;
      } else {
        // Fetch products by specific category
        url = `${API_BASE_URL}/api/products/category/${encodeURIComponent(category)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      // Format products for display
      const formattedProducts = data.map((product) => ({
        id: product.id?.toString(),
        title: product.name,
        price: `₹${product.price}`,
        originalPrice: product.originalPrice ? `₹${product.originalPrice}` : null,
        discount: product.discountPercentage ? `${product.discountPercentage}% OFF` : null,
        image: product.imagePath 
          ? { uri: `${API_BASE_URL}/api/products/images/${product.imagePath}` }
          : product1, // fallback image
        category: product.category,
        product: product, // Keep original product data
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setDropdownVisible(false);
  };

  // Navigate to product details
  const handleProductPress = (productData) => {
    navigation.navigate('ProductDetailScreen', {
      product: productData,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Header with Dropdown */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        {/* Category Dropdown */}
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Text style={styles.dropdownText} numberOfLines={1}>
            {selectedCategory}
          </Text>
          <Icon 
            name={dropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={24} 
            color="#333" 
          />
        </TouchableOpacity>

        <View style={styles.headerSpacer} />
      </View>

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <ScrollView style={styles.dropdownScroll}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    selectedCategory === category && styles.dropdownItemSelected,
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedCategory === category && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                  {selectedCategory === category && (
                    <Icon name="check" size={20} color="#0b8a0b" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Products Grid */}
      <ScrollView style={styles.content}>
        <View style={styles.productsContainer}>
          {!loading && (
            <Text style={styles.resultText}>
              {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
            </Text>
          )}

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0b8a0b" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          )}

          {/* Products Grid */}
          {!loading && products.length > 0 && (
            <View style={styles.productGrid}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  image={product.image}
                  title={product.title}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discount={product.discount}
                  product={product.product}
                  onPress={() => handleProductPress(product)}
                  onAdd={() => console.log(`Added ${product.title}`)}
                />
              ))}
            </View>
          )}

          {/* Empty State */}
          {!loading && products.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="inventory-2" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>
                Try selecting a different category
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  dropdownButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  headerSpacer: {
    width: 36,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    maxHeight: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#f0f9f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownItemTextSelected: {
    fontWeight: '600',
    color: '#0b8a0b',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  productsContainer: {
    padding: 16,
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontWeight: '500',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#aaa',
  },
});

export default CategoryProductsScreen;