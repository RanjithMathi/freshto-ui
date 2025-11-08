import React, { useRef, useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  Animated,
  TextInput,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CircleMenu from '../components/CircleMenu';
import ProductCard from '../components/ProductCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import productService from '../services/productService';

// Local images for fallback
import product1 from '../assets/images/careo-5.jpg';
import product2 from '../assets/images/careo-3.jpg';
import product3 from '../assets/images/careo-1.jpg';

// Banner images with their associated categories
const bannerData = [
  { 
    id: '1',
    image: require('../assets/images/careo-11.jpg'),
    category: 'Chicken'
  },
  { 
    id: '2',
    image: require('../assets/images/careo-22.jpg'),
    category: 'Country Chicken'
  },
  { 
    id: '3',
    image: require('../assets/images/careo-33.jpg'),
    category: 'Egg'
  },
];

const { width } = Dimensions.get('window');

const HEADER_TOP_HEIGHT = 60;
const SEARCH_BAR_HEIGHT = 50;
const API_BASE_URL = 'http://192.168.0.127:8080';

const HomeScreen = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchText, setSearchText] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Sale products state
  const [flashSale, setFlashSale] = useState([]);
  const [diwaliSale, setDiwaliSale] = useState([]);
  const [festivalSale, setFestivalSale] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load sale products from API
  useEffect(() => {
    fetchSaleProducts();
  }, []);

  const fetchSaleProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch Flash Sale products
      const flashResponse = await fetch(`${API_BASE_URL}/api/products/sale/FLASH_SALE`);
      const flashData = await flashResponse.json();
      setFlashSale(formatProducts(flashData));

      // Fetch Diwali Sale products
      const diwaliResponse = await fetch(`${API_BASE_URL}/api/products/sale/DIWALI_SALE`);
      const diwaliData = await diwaliResponse.json();
      setDiwaliSale(formatProducts(diwaliData));

      // Fetch Festival Sale products
      const festivalResponse = await fetch(`${API_BASE_URL}/api/products/sale/FESTIVAL_SALE`);
      const festivalData = await festivalResponse.json();
      setFestivalSale(formatProducts(festivalData));
      
    } catch (error) {
      console.error('Error fetching sale products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format products from API response
  const formatProducts = (products) => {
    return products.map((product) => ({
      id: product.id?.toString(),
      title: product.name,
      price: `₹${product.price}`,
      originalPrice: product.originalPrice ? `₹${product.originalPrice}` : null,
      discount: product.discountPercentage ? `${product.discountPercentage}% OFF` : null,
      image: product.imagePath 
        ? { uri: `${API_BASE_URL}/api/products/images/${product.imagePath}` }
        : product1, // fallback image
      product: product, // Keep original product data
    }));
  };

  // Banner auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % bannerData.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (width * 0.8 + 16));
    setCurrentIndex(index);
  };

  const handleViewAll = (sectionName, products) => {
    navigation.navigate('SectionProducts', {
      sectionName,
      products: products,
    });
  };

  const handleCategoryPress = (categoryName) => {
    navigation.navigate('CategoryProducts', {
      category: categoryName,
    });
  };

  // Handle banner click to navigate to category
  const handleBannerPress = (category) => {
    navigation.navigate('CategoryProducts', {
      category: category,
    });
  };

  // Animate header up & search bar sliding to top
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_TOP_HEIGHT],
    outputRange: [0, -HEADER_TOP_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_TOP_HEIGHT / 2, HEADER_TOP_HEIGHT],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const searchBarTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_TOP_HEIGHT],
    outputRange: [HEADER_TOP_HEIGHT, 0],
    extrapolate: 'clamp',
  });

  // Get section data based on section name
  const getSectionData = (sectionName) => {
    switch (sectionName) {
      case 'Flash Sale':
        return flashSale;
      case 'Diwali Sale':
        return diwaliSale;
      case 'Festival Sale':
        return festivalSale;
      default:
        return [];
    }
  };

  // Define sections with their data
  const sections = [
    { name: 'Flash Sale', icon: '⚡', data: flashSale },
    { name: 'Festival Sale', icon: '🎉', data: festivalSale },
    { name: 'Diwali Sale', icon: '🪔', data: diwaliSale },
  ];

  // Render banner item with TouchableOpacity
  const renderBannerItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => handleBannerPress(item.category)}
    >
      <Image source={item.image} style={styles.bannerImage} resizeMode="cover" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Status Bar Styling */}
      <StatusBar backgroundColor="#0b8a0b" barStyle="light-content" />

      {/* Safe area for status bar with green background */}
      <SafeAreaView style={styles.statusBarBackground} />

      {/* Animated Top Header */}
      <Animated.View
        style={[
          styles.headerTopRow,
          {
            transform: [{ translateY: headerTranslateY }],
            opacity: headerOpacity,
          },
        ]}
      >
        {/* Location Section - Left Side */}
        <TouchableOpacity style={styles.locationContainer}>
          <Icon name="location-on" size={20} color="#fff" />
          <View style={styles.locationTextContainer}>
            <Text style={styles.pincodeText}>637001</Text>
            <Text style={styles.addressText} numberOfLines={1}>
              Namakkal, Tamil Nadu
            </Text>
          </View>
        </TouchableOpacity>

        {/* Logo - Right Side */}
        <Image source={require('../assets/images/logo.png')} style={styles.logoImage} />
      </Animated.View>

      {/* Search bar that moves up on scroll */}
      <Animated.View
        style={[
          styles.searchBarContainer,
          {
            transform: [{ translateY: searchBarTranslateY }],
          },
        ]}
      >
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search products..."
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
      </Animated.View>

      {/* Scrollable content */}
      <Animated.ScrollView
        style={styles.contentContainer}
        contentContainerStyle={{
          paddingBottom: 24,
          paddingTop: HEADER_TOP_HEIGHT + SEARCH_BAR_HEIGHT,
        }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Carousel - Clickable without indicators */}
        <FlatList
          ref={flatListRef}
          data={bannerData}
          keyExtractor={(item) => item.id}
          renderItem={renderBannerItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          contentContainerStyle={styles.carouselContainer}
          getItemLayout={(_, index) => ({
            length: width * 0.8 + 16,
            offset: (width * 0.8 + 16) * index,
            index,
          })}
        />

        {/* Circle Menu */}
        <View style={styles.menuRow}>
          <CircleMenu 
            title="Chicken (கோழி)" 
            iconUri={require('../assets/categories/chicken.jpg')}
            onPress={() => handleCategoryPress('Chicken')}
          />
          <CircleMenu 
            title="Country Chicken (நாட்டுக்கோழி)"
            iconUri={require('../assets/images/nattukozhi.jpg')}
            onPress={() => handleCategoryPress('Country Chicken')}
          /> 
          <CircleMenu 
            title="Egg (முட்டை)" 
            iconUri={require('../assets/categories/eggs.jpg')}
            onPress={() => handleCategoryPress('Egg')}
          />
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0b8a0b" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        )}

        {/* Product Sections - Dynamic based on API data */}
        {!loading && sections.map((section) => {
          // Only show section if it has products
          if (section.data.length === 0) return null;

          return (
            <View key={section.name} style={styles.productSection}>
              {/* Section header with title + View All */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {section.icon} {section.name}
                </Text>

                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => handleViewAll(section.name, section.data)}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                  <Icon name="arrow-forward" size={16} color="#dd7805" />
                </TouchableOpacity>
              </View>

              {/* Product grid */}
<View style={styles.productGrid}>
  {section.data.slice(0, 4).map((product) => (
    <ProductCard
      key={`${section.name}-${product.id}`}
      image={product.image}
      title={product.title}
      price={product.price}
      originalPrice={product.originalPrice}
      discount={product.discount}
      product={product.product}
      onPress={() => navigation.navigate('ProductDetailScreen', { product: product })}
      onAdd={() => console.log(`Added ${product.title}`)}
    />
  ))}
</View>

              {/* Show message if section has no products */}
              {section.data.length === 0 && (
                <View style={styles.emptySection}>
                  <Text style={styles.emptyText}>No products available</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Show message if no sales are active */}
        {!loading && flashSale.length === 0 && diwaliSale.length === 0 && festivalSale.length === 0 && (
          <View style={styles.noSalesContainer}>
            <Text style={styles.noSalesText}>No active sales at the moment</Text>
            <Text style={styles.noSalesSubtext}>Check back soon for amazing deals!</Text>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  statusBarBackground: {
    backgroundColor: '#0b8a0b',
  },
  headerTopRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_TOP_HEIGHT,
    backgroundColor: '#0b8a0b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
    elevation: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    maxWidth: '70%',
  },
  locationTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 6,
  },
  pincodeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 16,
  },
  addressText: {
    color: 'white',
    fontSize: 11,
    opacity: 0.9,
    lineHeight: 14,
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#dd7805ff',
  },
  searchBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SEARCH_BAR_HEIGHT,
    backgroundColor: '#0b8a0b',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 11,
    elevation: 6,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 36,
    fontSize: 14,
    color: '#333',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  carouselContainer: {
    paddingTop: 16,
    paddingLeft: 16,
  },
  bannerImage: {
    width: width * 0.8,
    height: 160,
    borderRadius: 12,
    marginRight: 16,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  productSection: {
    marginTop: 34,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#dd7805',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  emptySection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  noSalesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 16,
  },
  noSalesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  noSalesSubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default HomeScreen;