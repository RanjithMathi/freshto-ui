import React from 'react';
import { CartProviderWithToast } from './src/context/CartProviderWithToast';
import { AddressProvider } from './src/context/AddressContext';
import { OrderProvider } from './src/context/OrderContext';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';


const App = () => {
  return (
    <AuthProvider>
    <CartProviderWithToast>
      <AddressProvider>
        <OrderProvider>
          <AppNavigator />
        </OrderProvider>
      </AddressProvider>
    </CartProviderWithToast>
    </AuthProvider>
  );
};

export default App;