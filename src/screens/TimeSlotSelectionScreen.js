import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useOrder } from '../context/OrderContext';

const TimeSlotSelectionScreen = ({ navigation, route }) => {
   const { address,customerId } = route.params || {};
  const { selectDeliverySlot } = useOrder();
  
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedSlot, setSelectedSlot] = useState(null);

  const timeSlots = [
    { id: '1', time: '6:00 AM - 9:00 AM', label: 'Early Morning', available: true },
    { id: '2', time: '9:00 AM - 12:00 PM', label: 'Morning', available: true },
    { id: '3', time: '12:00 PM - 3:00 PM', label: 'Afternoon', available: true },
    { id: '4', time: '3:00 PM - 6:00 PM', label: 'Evening', available: false },
    { id: '5', time: '6:00 PM - 9:00 PM', label: 'Night', available: true },
  ];

  const getDateDisplay = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (selectedDate === 'today') {
      return today.toDateString();
    } else if (selectedDate === 'tomorrow') {
      return tomorrow.toDateString();
    }
    return selectedDate;
  };

  const handleContinue = () => {
    if (!selectedSlot) {
      Alert.alert('No Time Slot Selected', 'Please select a delivery time slot');
      return;
    }

    const deliverySlot = {
      date: getDateDisplay(),
      time: selectedSlot.time,
      label: selectedSlot.label,
    };

    selectDeliverySlot(deliverySlot);
    console.log("address route",address);
    console.log("time slot screen:",customerId);
    navigation.navigate('OrderSummary', { address: address ,customerId: customerId });
  };

  const renderDateButton = (dateType, label) => {
    const isSelected = selectedDate === dateType;
    return (
      <TouchableOpacity
        style={[styles.dateButton, isSelected && styles.dateButtonSelected]}
        onPress={() => setSelectedDate(dateType)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dateButtonText, isSelected && styles.dateButtonTextSelected]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTimeSlot = (slot) => {
    const isSelected = selectedSlot?.id === slot.id;
    const isAvailable = slot.available;

    return (
      <TouchableOpacity
        key={slot.id}
        style={[
          styles.slotCard,
          isSelected && styles.slotCardSelected,
          !isAvailable && styles.slotCardDisabled,
        ]}
        onPress={() => isAvailable && setSelectedSlot(slot)}
        disabled={!isAvailable}
        activeOpacity={0.7}
      >
        <View style={styles.slotContent}>
          <View style={styles.slotLeft}>
            <Icon
              name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={24}
              color={isSelected ? '#0b8a0b' : '#ccc'}
            />
            <View style={styles.slotInfo}>
              <Text style={[styles.slotLabel, !isAvailable && styles.slotTextDisabled]}>
                {slot.label}
              </Text>
              <Text style={[styles.slotTime, !isAvailable && styles.slotTextDisabled]}>
                {slot.time}
              </Text>
            </View>
          </View>

          {!isAvailable && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Not Available</Text>
            </View>
          )}

          {isSelected && (
            <Icon name="check-circle" size={24} color="#0b8a0b" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Delivery Time</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <View style={styles.dateContainer}>
            {renderDateButton('today', 'Today')}
            {renderDateButton('tomorrow', 'Tomorrow')}
          </View>
          
          <View style={styles.selectedDateContainer}>
            <Icon name="calendar-today" size={18} color="#0b8a0b" />
            <Text style={styles.selectedDateText}>{getDateDisplay()}</Text>
          </View>
        </View>

        {/* Time Slot Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time Slot</Text>
          {timeSlots.map((slot) => renderTimeSlot(slot))}
        </View>

        {/* Information Box */}
        <View style={styles.infoBox}>
          <Icon name="info" size={20} color="#0b8a0b" />
          <Text style={styles.infoText}>
            Our delivery partner will call you 30 minutes before delivery
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedSlot && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedSlot}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Icon name="arrow-forward" size={20} color="#fff" />
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
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dateButtonSelected: {
    borderColor: '#0b8a0b',
    backgroundColor: '#f0f9f0',
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  dateButtonTextSelected: {
    color: '#0b8a0b',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  selectedDateText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
  },
  slotCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  slotCardSelected: {
    borderColor: '#0b8a0b',
    backgroundColor: '#f0f9f0',
  },
  slotCardDisabled: {
    backgroundColor: '#f9f9f9',
    opacity: 0.6,
  },
  slotContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  slotInfo: {
    marginLeft: 12,
    flex: 1,
  },
  slotLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 14,
    color: '#666',
  },
  slotTextDisabled: {
    color: '#999',
  },
  unavailableBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  unavailableText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0b8a0b',
  },
  infoText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
});

export default TimeSlotSelectionScreen;