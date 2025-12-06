// ========================================
// src/navigation/AppNavigator.js - COMPLETE FIX
// ========================================
import React, { useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/HomeScreen';
import SectionProductsScreen from '../screens/SectionProductsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CategoryProductsScreen from '../screens/CategoryProductsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CartScreen from '../screens/CartScreen';
import AccountScreen from '../screens/AccountScreen';

// Checkout Flow Screens
import AddressSelectionScreen from '../screens/AddressSelectionScreen';
import AddEditAddressScreen from '../screens/AddEditAddressScreen';
import TimeSlotSelectionScreen from '../screens/TimeSlotSelectionScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';

import { useCart } from '../context/CartContext';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const CategoriesStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();

// Home Stack Navigator
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen 
        name="SectionProducts" 
        component={SectionProductsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <HomeStack.Screen 
        name="CategoryProducts" 
        component={CategoryProductsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <HomeStack.Screen 
        name="ProductDetailScreen" 
        component={ProductDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </HomeStack.Navigator>
  );
};

// Categories Stack Navigator
const CategoriesStackNavigator = () => {
  return (
    <CategoriesStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <CategoriesStack.Screen name="CategoriesMain" component={CategoriesScreen} />
      <CategoriesStack.Screen 
        name="CategoryProducts" 
        component={CategoryProductsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <CategoriesStack.Screen 
        name="ProductDetailScreen" 
        component={ProductDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </CategoriesStack.Navigator>
  );
};

// Cart Stack Navigator - includes checkout flow
const CartStackNavigator = () => {
  const navigationRef = React.useRef(null);

  return (
    <CartStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      screenListeners={{
        state: (e) => {
          // Listen to navigation state changes
          const state = e.data.state;
          
          // Check if we're on OrderSuccess screen
          if (state && state.routes && state.routes.length > 0) {
            const currentRoute = state.routes[state.index];
            
            // If OrderSuccess is the current screen and user hasn't left the Cart tab
            if (currentRoute.name === 'OrderSuccess') {
              console.log('📍 Detected OrderSuccess screen in Cart stack');
            }
          }
        },
      }}
    >
      <CartStack.Screen name="CartMain" component={CartScreen} />
      <CartStack.Screen
        name="AddressSelection"
        component={AddressSelectionScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <CartStack.Screen
        name="AddEditAddress"
        component={AddEditAddressScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <CartStack.Screen
        name="TimeSlotSelection"
        component={TimeSlotSelectionScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <CartStack.Screen
        name="OrderSummary"
        component={OrderSummaryScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <CartStack.Screen
        name="OrderSuccess"
        component={OrderSuccessScreen}
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: false,
          headerLeft: () => null,
          headerBackVisible: false,
        }}
      />
      <CartStack.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </CartStack.Navigator>
  );
};

// Account Stack Navigator - includes profile management
const AccountStackNavigator = () => {
  return (
    <AccountStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AccountStack.Screen name="AccountMain" component={AccountScreen} />
      <AccountStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <AccountStack.Screen
        name="AddressManagement"
        component={AddressSelectionScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <AccountStack.Screen
        name="AddEditAddress"
        component={AddEditAddressScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <AccountStack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <AccountStack.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </AccountStack.Navigator>
  );
};


// Tab Navigator Component
const TabNavigator = () => {
  const { getTotalItems, clearCart, hideToast } = useCart();
  const cartNavigationRef = React.useRef(null);

  return (
    <Tab.Navigator
      screenOptions={({route, navigation}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Favorites') {
            iconName = 'favorite';
          } else if (route.name === 'Categories') {
            iconName = 'category';
          } else if (route.name === 'Cart') {
            iconName = 'shopping-cart';
          } else if (route.name === 'Account') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0b8a0b',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: (() => {
          const state = navigation.getState();
          const currentRoute = state.routes[state.index];
          
          if (currentRoute.state) {
            const nestedState = currentRoute.state;
            const nestedRoute = nestedState.routes[nestedState.index];
            
            // Hide tab bar on specific screens
            const hideTabBarScreens = [
              'ProductDetailScreen',
              'CategoryProducts',
              'AddressSelection',
              'AddressManagement',
              'AddEditAddress',
              'TimeSlotSelection',
              'OrderSummary',
              'OrderSuccess',
              'OrderTracking',
              'EditProfile',
              'OrderHistory',
            ];
            
            if (hideTabBarScreens.includes(nestedRoute.name)) {
              return { display: 'none' };
            }
          }
          
          return {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
          };
        })(),
        headerShown: false,
      })}
      screenListeners={({navigation, route}) => ({
        tabPress: (e) => {
          // Intercept Cart tab press
          if (route.name === 'Cart') {
            const state = navigation.getState();
            const cartRoute = state.routes.find(r => r.name === 'Cart');
            
            // Check if Cart stack has OrderSuccess screen
            if (cartRoute?.state) {
              const cartState = cartRoute.state;
              const currentCartScreen = cartState.routes[cartState.index];
              
              if (currentCartScreen.name === 'OrderSuccess') {
                console.log('🔄 Intercepting Cart tab press - resetting from OrderSuccess');
                e.preventDefault();
                
                // Clear cart and hide toast notification
                clearCart();
                hideToast();
                
                // Reset the Cart navigator to CartMain
                navigation.reset({
                  index: state.index,
                  routes: state.routes.map(r => {
                    if (r.name === 'Cart') {
                      return {
                        ...r,
                        state: {
                          routes: [{ name: 'CartMain' }],
                          index: 0,
                        },
                      };
                    }
                    return r;
                  }),
                });
              }
            }
          }
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator}
        options={{title: 'Home'}}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{title: 'Favorites'}}
      />
      <Tab.Screen 
        name="Categories" 
        component={CategoriesStackNavigator}
        options={{title: 'Categories'}}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartStackNavigator}
        options={{
          title: 'Cart',
          tabBarBadge: (() => {
            const count = getTotalItems();
            return count > 0 ? count : undefined;
          })(),
          tabBarBadgeStyle: {
            backgroundColor: '#ff4444',
            color: '#fff',
            fontSize: 11,
            fontWeight: 'bold',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountStackNavigator}
        options={{title: 'Account'}}
      />
    </Tab.Navigator>
  );
};

// Main AppNavigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;