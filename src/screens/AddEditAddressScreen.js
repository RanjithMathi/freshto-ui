import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAddress } from '../context/AddressContext';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.127:8080/api'; // Update with your API URL

const AddEditAddressScreen = ({ navigation, route }) => {
  const { mode = 'add', address, isFirstTime = false, customerId } = route.params || {};
  const { refreshAddresses } = useAddress();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    zipCode: '',
    contactPhone: '',
    addressType: 'HOME',
    isDefault: false,
  });

  useEffect(() => {
    if (mode === 'edit' && address) {
      setFormData({
        addressLine1: address.addressLine1 || '',
        addressLine2: address.addressLine2 || '',
        landmark: address.landmark || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        contactPhone: address.contactPhone || '',
        addressType: address.addressType || 'HOME',
        isDefault: address.isDefault || false,
      });
    }
  }, [mode, address]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { addressLine1, city, state, zipCode } = formData;

    if (!addressLine1.trim()) {
      Alert.alert('Error', 'Please enter address line 1 (House/Flat number & Street)');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('Error', 'Please enter city');
      return false;
    }
    if (!state.trim()) {
      Alert.alert('Error', 'Please enter state');
      return false;
    }
    if (!zipCode.trim() || zipCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit PIN code');
      return false;
    }
    
    // Validate contact phone if provided
    if (formData.contactPhone && !/^[6-9]\d{9}$/.test(formData.contactPhone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit Indian phone number');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    console.log("mode:",mode);
    
console.log("`${API_BASE_URL}/addresses/customer/${customerId}:",API_BASE_URL+'/addresses/customer/'+customerId);

    try {
      if (mode === 'add') {
        // POST /api/addresses/customer/{customerId}
        await axios.post(`${API_BASE_URL}/addresses/customer/${customerId}`, formData);
        Alert.alert('Success', 'Address added successfully');
      } else {
        // PUT /api/addresses/{id}
        await axios.put(`${API_BASE_URL}/addresses/${address.id}`, formData);
        Alert.alert('Success', 'Address updated successfully');
      }

      // Refresh addresses in context
      if (refreshAddresses) {
        await refreshAddresses(customerId);
      }

      // For first-time users, navigate to AddressSelection instead of going back
      if (isFirstTime) {
        navigation.replace('AddressSelection');
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save address. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isFirstTime) {
      Alert.alert(
        'Address Required',
        'You need to add a delivery address to continue with checkout. Are you sure you want to cancel?',
        [
          { text: 'Continue Adding', style: 'cancel' },
          {
            text: 'Cancel Checkout',
            style: 'destructive',
            onPress: () => navigation.navigate('CartMain'),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const renderAddressTypeButton = (type, icon, displayName) => {
    const isSelected = formData.addressType === type;
    return (
      <TouchableOpacity
        style={[styles.typeButton, isSelected && styles.typeButtonSelected]}
        onPress={() => handleInputChange('addressType', type)}
        activeOpacity={0.7}
      >
        <Icon
          name={icon}
          size={22}
          color={isSelected ? '#fff' : '#0b8a0b'}
        />
        <Text style={[styles.typeButtonText, isSelected && styles.typeButtonTextSelected]}>
          {displayName}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'add' ? 'Add New Address' : 'Edit Address'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* First Time User Banner */}
      {isFirstTime && (
        <View style={styles.firstTimeBanner}>
          <Icon name="info" size={20} color="#0b8a0b" />
          <Text style={styles.firstTimeText}>
            Please add your delivery address to continue
          </Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Address Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Details</Text>

          <View style={styles.inputContainer}>
            <Icon name="home" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="House/Flat No. & Street *"
              value={formData.addressLine1}
              onChangeText={(value) => handleInputChange('addressLine1', value)}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="location-on" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Area/Locality (Optional)"
              value={formData.addressLine2}
              onChangeText={(value) => handleInputChange('addressLine2', value)}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="place" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Landmark (Optional)"
              value={formData.landmark}
              onChangeText={(value) => handleInputChange('landmark', value)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Icon name="location-city" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="City *"
                value={formData.city}
                onChangeText={(value) => handleInputChange('city', value)}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Icon name="map" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="State *"
                value={formData.state}
                onChangeText={(value) => handleInputChange('state', value)}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Icon name="pin-drop" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="PIN Code *"
              value={formData.zipCode}
              onChangeText={(value) => handleInputChange('zipCode', value)}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information (Optional)</Text>

          <View style={styles.inputContainer}>
            <Icon name="phone" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Alternate Phone Number"
              value={formData.contactPhone}
              onChangeText={(value) => handleInputChange('contactPhone', value)}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
          <Text style={styles.helperText}>
            Use if different from your registered number
          </Text>
        </View>

        {/* Address Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Type</Text>
          <View style={styles.typeContainer}>
            {renderAddressTypeButton('HOME', 'home', 'Home')}
            {renderAddressTypeButton('WORK', 'work', 'Work')}
            {renderAddressTypeButton('OTHER', 'location-on', 'Other')}
          </View>
        </View>

        {/* Default Address */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleInputChange('isDefault', !formData.isDefault)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, formData.isDefault && styles.checkboxChecked]}>
            {formData.isDefault && <Icon name="check" size={16} color="#fff" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkboxLabel}>Set as default address</Text>
            <Text style={styles.checkboxHelper}>
              This address will be selected automatically for orders
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.7}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {mode === 'add' ? 'Add Address' : 'Update Address'}
            </Text>
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
  firstTimeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  firstTimeText: {
    flex: 1,
    fontSize: 14,
    color: '#0b8a0b',
    fontWeight: '500',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: -8,
    marginLeft: 4,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0b8a0b',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  typeButtonSelected: {
    backgroundColor: '#0b8a0b',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0b8a0b',
    marginLeft: 6,
  },
  typeButtonTextSelected: {
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#0b8a0b',
    borderColor: '#0b8a0b',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  checkboxHelper: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0b8a0b',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0b8a0b',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0b8a0b',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AddEditAddressScreen;