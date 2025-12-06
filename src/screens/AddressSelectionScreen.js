import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAddress } from '../context/AddressContext';
import { useAuth } from '../context/AuthContext';

const AddressSelectionScreen = ({ navigation, route }) => {
  const { customerId } = route.params || {};
  const {
    addresses,
    defaultAddress,
    loading,
    // customerId,
    fetchAddresses,
    setAsDefault,
    deleteAddress,
    getAddressTypeDisplay,
    getFullAddressString,
  } = useAddress();
  const { isLoggedIn, user } = useAuth();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!isLoggedIn || !user) {
      Alert.alert(
        'Login Required',
        'Please login with your mobile number to select a delivery address.',
        [
          {
            text: 'Cancel',
            onPress: () => navigation.goBack()
          },
          {
            text: 'Login',
            onPress: () => navigation.navigate('Cart') // Navigate to cart where auth modal is available
          }
        ]
      );
      return;
    }

    // If user is logged in, load their addresses
    loadAddresses();
  }, [isLoggedIn, user, navigation]);

  useEffect(() => {
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    }
  }, [defaultAddress]);

  const loadAddresses = async () => {
    setRefreshing(true);
    try {
      await fetchAddresses(customerId);
    } catch (error) {
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address.id);
  };

  const handleSetAsDefault = async (addressId) => {
    try {
      await setAsDefault(addressId);
      Alert.alert('Success', 'Default address updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  const handleEditAddress = (address) => {
    navigation.navigate('AddEditAddress', {
      mode: 'edit',
      address,
      customerId,
    });
  };

  const handleDeleteAddress = (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(addressId);
              Alert.alert('Success', 'Address deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const handleContinue = () => {
    console.log('addresses:', addresses);
    console.log('customerId addressselection:', customerId);
    const selected = addresses.find((addr) => addr.id === selectedAddressId);
    if (!selected) {
      Alert.alert('Error', 'Please select an address');
      return;
    }

    if (selected) {
      // Use the customerId from context/state instead of calling useAuth here
      navigation.navigate('TimeSlotSelection', { address: selected, customerId: customerId });
    }
    // navigation.goBack();
  };

  const handleAddNewAddress = () => {
    navigation.navigate('AddEditAddress', {
      mode: 'add',
      customerId,
      isFirstTime: addresses.length === 0,
    });
  };

  const renderAddressCard = (address) => {
    const isSelected = selectedAddressId === address.id;
    const isDefault = address.isDefault;

    return (
      <TouchableOpacity
        key={address.id}
        style={[styles.addressCard, isSelected && styles.addressCardSelected]}
        onPress={() => handleSelectAddress(address)}
        activeOpacity={0.7}
      >
        {/* Selection Radio Button */}
        <View style={styles.cardHeader}>
          <View style={styles.radioContainer}>
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected && <View style={styles.radioDot} />}
            </View>
          </View>

          {/* Address Type Badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {getAddressTypeDisplay(address.addressType)}
            </Text>
          </View>

          {/* Default Badge */}
          {isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>DEFAULT</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditAddress(address)}
            >
              <Icon name="edit" size={18} color="#0b8a0b" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteAddress(address.id)}
            >
              <Icon name="delete" size={18} color="#d32f2f" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Address Details */}
        <View style={styles.addressContent}>
          {address.name && (
            <Text style={styles.nameText}>{address.name}</Text>
          )}
          
          <Text style={styles.addressText}>{address.addressLine1}</Text>
          
          {address.addressLine2 && (
            <Text style={styles.addressText}>{address.addressLine2}</Text>
          )}
          
          {address.landmark && (
            <Text style={styles.landmarkText}>Landmark: {address.landmark}</Text>
          )}
          
          <Text style={styles.addressText}>
            {address.zipCode}
          </Text>

          <View style={styles.phoneContainer}>
            <Icon name="phone" size={14} color="#666" />
            <Text style={styles.phoneText}>{user?.phoneNumber || user?.phone}</Text>
          </View>

          {address.contactPhone && address.contactPhone !== (user?.phoneNumber || user?.phone) && (
            <View style={styles.phoneContainer}>
              <Icon name="phone" size={14} color="#666" />
              <Text style={styles.phoneText}>{address.contactPhone}</Text>
            </View>
          )}
        </View>

        {/* Set as Default Button */}
        {!isDefault && isSelected && (
          <TouchableOpacity
            style={styles.setDefaultButton}
            onPress={() => handleSetAsDefault(address.id)}
          >
            <Text style={styles.setDefaultText}>Set as Default</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0b8a0b" />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Delivery Address</Text>
        <TouchableOpacity onPress={loadAddresses} style={styles.refreshButton}>
          <Icon name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Customer Info Section */}
        <View style={styles.customerInfoSection}>
          <Icon name="person" size={24} color="#0b8a0b" />
          <View style={styles.customerInfo}>
            <Text style={styles.customerInfoLabel}>Customer</Text>
            <Text style={styles.customerInfoValue}>{user?.name || 'Customer'}</Text>
            <Text style={styles.customerPhoneValue}>{user?.phoneNumber || user?.phone}</Text>
          </View>
        </View>

        {/* Empty State */}
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="location-off" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Addresses Found</Text>
            <Text style={styles.emptyText}>
              Add your delivery address to start ordering
            </Text>
          </View>
        ) : (
          <>
            {/* Address List */}
            {addresses.map((address) => renderAddressCard(address))}
          </>
        )}

        {/* Add New Address Button */}
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={handleAddNewAddress}
          activeOpacity={0.7}
        >
          <Icon name="add-circle-outline" size={24} color="#0b8a0b" />
          <Text style={styles.addNewText}>Add New Address</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Continue Button */}
      {addresses.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue with Selected Address</Text>
          </TouchableOpacity>
        </View>
      )}
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
  refreshButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  customerInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  customerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  customerInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  customerInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  customerPhoneValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  addressCardSelected: {
    borderColor: '#0b8a0b',
    backgroundColor: '#f0f9f0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioContainer: {
    marginRight: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#0b8a0b',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0b8a0b',
  },
  typeBadge: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#0b8a0b',
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: '#fef3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: '#f57c00',
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  addressContent: {
    paddingLeft: 32,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    lineHeight: 22,
  },
  landmarkText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  phoneText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  setDefaultButton: {
    marginTop: 12,
    marginLeft: 32,
    alignSelf: 'flex-start',
  },
  setDefaultText: {
    fontSize: 13,
    color: '#0b8a0b',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0b8a0b',
    borderStyle: 'dashed',
    padding: 20,
    marginTop: 8,
  },
  addNewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0b8a0b',
    marginLeft: 8,
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
  continueButton: {
    backgroundColor: '#0b8a0b',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AddressSelectionScreen;