// AdminDashboard.js - Main Admin Screen for React Native
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [orders, setOrders] = useState([
    { id: 'ORD001', customer: 'John Doe', items: 'Whole Chicken (2kg)', total: 450, status: 'pending', date: '2025-10-31', address: '123 Main St' },
    { id: 'ORD002', customer: 'Jane Smith', items: 'Chicken Legs (1kg)', total: 220, status: 'processing', date: '2025-10-31', address: '456 Oak Ave' },
    { id: 'ORD003', customer: 'Mike Johnson', items: 'Chicken Breast (1.5kg)', total: 380, status: 'delivered', date: '2025-10-30', address: '789 Pine Rd' },
    { id: 'ORD004', customer: 'Sarah Wilson', items: 'Wings & Drumsticks', total: 320, status: 'cancelled', date: '2025-10-30', address: '321 Elm St' },
  ]);

  const [products, setProducts] = useState([
    { id: 'P001', name: 'Whole Chicken', price: 225, stock: 45, unit: 'kg', category: 'Fresh' },
    { id: 'P002', name: 'Chicken Breast', price: 280, stock: 30, unit: 'kg', category: 'Fresh' },
    { id: 'P003', name: 'Chicken Legs', price: 200, stock: 50, unit: 'kg', category: 'Fresh' },
    { id: 'P004', name: 'Chicken Wings', price: 240, stock: 25, unit: 'kg', category: 'Fresh' },
    { id: 'P005', name: 'Minced Chicken', price: 260, stock: 20, unit: 'kg', category: 'Processed' },
  ]);

  const [customers, setCustomers] = useState([
    { id: 'C001', name: 'John Doe', email: 'john@email.com', phone: '9876543210', orders: 12, totalSpent: 5400 },
    { id: 'C002', name: 'Jane Smith', email: 'jane@email.com', phone: '9876543211', orders: 8, totalSpent: 3200 },
    { id: 'C003', name: 'Mike Johnson', email: 'mike@email.com', phone: '9876543212', orders: 15, totalSpent: 6750 },
  ]);

  const [drivers, setDrivers] = useState([
    { id: 'D001', name: 'Raj Kumar', phone: '9123456789', status: 'active', deliveries: 45, rating: 4.8 },
    { id: 'D002', name: 'Priya Singh', phone: '9123456790', status: 'active', deliveries: 38, rating: 4.9 },
    { id: 'D003', name: 'Amit Patel', phone: '9123456791', status: 'offline', deliveries: 52, rating: 4.7 },
  ]);

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalRevenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0),
    activeCustomers: customers.length,
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#FEF3C7';
      case 'processing': return '#DBEAFE';
      case 'delivered': return '#D1FAE5';
      case 'cancelled': return '#FEE2E2';
      default: return '#F3F4F6';
    }
  };

  const getStatusTextColor = (status) => {
    switch(status) {
      case 'pending': return '#92400E';
      case 'processing': return '#1E40AF';
      case 'delivered': return '#065F46';
      case 'cancelled': return '#991B1B';
      default: return '#374151';
    }
  };

  const StatCard = ({ title, value, subtitle, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  const OrderCard = ({ order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.orderCustomer}>{order.customer}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={[styles.statusText, { color: getStatusTextColor(order.status) }]}>
            {order.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.orderItems}>{order.items}</Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>₹{order.total}</Text>
        <Text style={styles.orderDate}>{order.date}</Text>
      </View>
      <View style={styles.orderActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.processingButton]}
          onPress={() => updateOrderStatus(order.id, 'processing')}
        >
          <Text style={styles.actionButtonText}>Process</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deliveredButton]}
          onPress={() => updateOrderStatus(order.id, 'delivered')}
        >
          <Text style={styles.actionButtonText}>Delivered</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => {
            Alert.alert(
              'Cancel Order',
              'Are you sure you want to cancel this order?',
              [
                { text: 'No', style: 'cancel' },
                { text: 'Yes', onPress: () => updateOrderStatus(order.id, 'cancelled') }
              ]
            );
          }}
        >
          <Text style={styles.actionButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ProductCard = ({ product }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
        </View>
        <View style={[
          styles.stockBadge, 
          { backgroundColor: product.stock < 30 ? '#FEE2E2' : '#D1FAE5' }
        ]}>
          <Text style={[
            styles.stockText,
            { color: product.stock < 30 ? '#991B1B' : '#065F46' }
          ]}>
            {product.stock < 30 ? 'Low Stock' : 'In Stock'}
          </Text>
        </View>
      </View>
      <View style={styles.productDetails}>
        <View style={styles.productRow}>
          <Text style={styles.productLabel}>Price:</Text>
          <Text style={styles.productValue}>₹{product.price}/{product.unit}</Text>
        </View>
        <View style={styles.productRow}>
          <Text style={styles.productLabel}>Stock:</Text>
          <Text style={styles.productValue}>{product.stock} {product.unit}</Text>
        </View>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]}>
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const CustomerCard = ({ customer }) => (
    <View style={styles.customerCard}>
      <View style={styles.customerHeader}>
        <View style={styles.customerAvatar}>
          <Text style={styles.customerAvatarText}>
            {customer.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{customer.name}</Text>
          <Text style={styles.customerEmail}>{customer.email}</Text>
          <Text style={styles.customerPhone}>{customer.phone}</Text>
        </View>
      </View>
      <View style={styles.customerStats}>
        <View style={styles.customerStat}>
          <Text style={styles.customerStatValue}>{customer.orders}</Text>
          <Text style={styles.customerStatLabel}>Orders</Text>
        </View>
        <View style={styles.customerStat}>
          <Text style={styles.customerStatValue}>₹{customer.totalSpent}</Text>
          <Text style={styles.customerStatLabel}>Total Spent</Text>
        </View>
      </View>
    </View>
  );

  const DriverCard = ({ driver }) => (
    <View style={styles.driverCard}>
      <View style={styles.driverHeader}>
        <View style={styles.driverAvatar}>
          <Text style={styles.driverAvatarText}>🚚</Text>
        </View>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.driverPhone}>{driver.phone}</Text>
        </View>
        <View style={[
          styles.driverStatusBadge,
          { backgroundColor: driver.status === 'active' ? '#D1FAE5' : '#F3F4F6' }
        ]}>
          <Text style={[
            styles.driverStatusText,
            { color: driver.status === 'active' ? '#065F46' : '#374151' }
          ]}>
            {driver.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.driverStats}>
        <View style={styles.driverStat}>
          <Text style={styles.driverStatLabel}>Deliveries</Text>
          <Text style={styles.driverStatValue}>{driver.deliveries}</Text>
        </View>
        <View style={styles.driverStat}>
          <Text style={styles.driverStatLabel}>Rating</Text>
          <Text style={styles.driverStatValue}>⭐ {driver.rating}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.assignButton}>
        <Text style={styles.assignButtonText}>Assign Order</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ScrollView style={styles.content}>
            <View style={styles.statsContainer}>
              <StatCard 
                title="Total Orders" 
                value={stats.totalOrders} 
                subtitle="+12% from last week"
                color="#3B82F6"
              />
              <StatCard 
                title="Pending Orders" 
                value={stats.pendingOrders} 
                subtitle="Need attention"
                color="#F59E0B"
              />
              <StatCard 
                title="Total Revenue" 
                value={`₹${stats.totalRevenue}`} 
                subtitle="+8% from last week"
                color="#10B981"
              />
              <StatCard 
                title="Active Customers" 
                value={stats.activeCustomers} 
                subtitle="+5% from last week"
                color="#8B5CF6"
              />
            </View>
            
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            {orders.slice(0, 3).map(order => (
              <OrderCard key={order.id} order={order} />
            ))}

            <Text style={styles.sectionTitle}>Low Stock Alert</Text>
            {products.filter(p => p.stock < 30).map(product => (
              <View key={product.id} style={styles.alertCard}>
                <Text style={styles.alertTitle}>{product.name}</Text>
                <Text style={styles.alertText}>Stock: {product.stock} {product.unit}</Text>
                <TouchableOpacity style={styles.restockButton}>
                  <Text style={styles.restockButtonText}>Restock Now</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        );

      case 'orders':
        return (
          <ScrollView style={styles.content}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search orders..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </ScrollView>
        );

      case 'products':
        return (
          <ScrollView style={styles.content}>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add New Product</Text>
            </TouchableOpacity>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ScrollView>
        );

      case 'customers':
        return (
          <ScrollView style={styles.content}>
            {customers.map(customer => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </ScrollView>
        );

      case 'drivers':
        return (
          <ScrollView style={styles.content}>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add New Driver</Text>
            </TouchableOpacity>
            {drivers.map(driver => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ChickenFresh Admin</Text>
          <Text style={styles.headerSubtitle}>Manage your delivery operations</Text>
        </View>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>A</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'orders', label: 'Orders', icon: '🛒' },
            { id: 'products', label: 'Products', icon: '📦' },
            { id: 'customers', label: 'Customers', icon: '👥' },
            { id: 'drivers', label: 'Drivers', icon: '🚚' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.id && styles.activeTabLabel
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#F97316',
  },
  tabIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#F97316',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#10B981',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
    marginBottom: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  orderCustomer: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  orderItems: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  processingButton: {
    backgroundColor: '#3B82F6',
  },
  deliveredButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  productCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  productDetails: {
    marginBottom: 12,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  productValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  customerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  customerEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  customerPhone: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  customerStat: {
    alignItems: 'center',
  },
  customerStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  customerStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  driverCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverAvatarText: {
    fontSize: 24,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  driverPhone: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  driverStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  driverStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  driverStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  driverStat: {
    flex: 1,
  },
  driverStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  driverStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
  },
  assignButton: {
    backgroundColor: '#F97316',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#F97316',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertCard: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#7F1D1D',
    marginBottom: 12,
  },
  restockButton: {
    backgroundColor: '#DC2626',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  restockButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AdminDashboard;