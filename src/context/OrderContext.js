import React, { createContext, useState, useContext } from 'react';

const OrderContext = createContext();

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [deliverySlot, setDeliverySlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  // Create new order
  const createOrder = (orderData) => {
    const newOrder = {
      id: `ORD${Date.now()}`,
      ...orderData,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    return newOrder;
  };

  // Update order status
  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      )
    );

    if (currentOrder?.id === orderId) {
      setCurrentOrder((prev) => ({
        ...prev,
        status,
        updatedAt: new Date().toISOString(),
      }));
    }
  };

  // Get order by ID
  const getOrderById = (orderId) => {
    return orders.find((order) => order.id === orderId);
  };

  // Get all orders
  const getAllOrders = () => {
    return orders;
  };

  // Set delivery slot
  const selectDeliverySlot = (slot) => {
    setDeliverySlot(slot);
  };

  // Set payment method
  const selectPaymentMethod = (method) => {
    setPaymentMethod(method);
  };

  // Clear current order data (after successful placement)
  const clearCurrentOrderData = () => {
    setDeliverySlot(null);
    setPaymentMethod(null);
  };

  // Calculate order totals
  const calculateOrderTotal = (items, deliveryCharge = 0) => {
    const subtotal = items.reduce((sum, item) => {
      const price = item.price;
      return sum + price * item.quantity;
    }, 0);

    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + deliveryCharge + tax;

    return {
      subtotal: Math.round(subtotal),
      deliveryCharge,
      tax: Math.round(tax),
      total: Math.round(total),
    };
  };

  const value = {
    orders,
    currentOrder,
    deliverySlot,
    paymentMethod,
    createOrder,
    updateOrderStatus,
    getOrderById,
    getAllOrders,
    selectDeliverySlot,
    selectPaymentMethod,
    clearCurrentOrderData,
    calculateOrderTotal,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};