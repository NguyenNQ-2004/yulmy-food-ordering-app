import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/customer/HomeScreen';
import CartScreen from '../screens/customer/CartScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import AddressSelectionScreen from '../screens/customer/AddressSelectionScreen';
import PaymentMethodScreen from '../screens/customer/PaymentMethodScreen';
import VoucherScreen from '../screens/customer/VoucherScreen';
import OrderSuccessScreen from '../screens/customer/OrderSuccessScreen';

const Stack = createNativeStackNavigator();

export default function CustomerNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddressSelection"
        component={AddressSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PaymentMethod"
        component={PaymentMethodScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Vouchers"
        component={VoucherScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderSuccess"
        component={OrderSuccessScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
