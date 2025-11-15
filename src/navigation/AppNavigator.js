// ========================================
// src/navigation/AppNavigator.js - COMPLETE FIX
// ========================================
import React from 'react';
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
const AccountStack = createNativeStackNavigator(); // ✅ NEW: Account Stack

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
  return (
    <CartStack.Navigator
      screenOptions={{
        headerShown: false,
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

// ✅ NEW: Account Stack Navigator - includes profile management
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
  const { getTotalItems } = useCart();

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
              'AddressManagement', // ✅ Added
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
      })}>
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
        component={AccountStackNavigator} // ✅ Changed from single screen to stack
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