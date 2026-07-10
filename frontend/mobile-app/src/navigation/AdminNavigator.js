import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AdminProvider } from '../context/AdminContext';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminFoodFormScreen from '../screens/admin/AdminFoodFormScreen';
import AdminFoodsScreen from '../screens/admin/AdminFoodsScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminRestaurantFormScreen from '../screens/admin/AdminRestaurantFormScreen';
import AdminRestaurantsScreen from '../screens/admin/AdminRestaurantsScreen';
import AdminReviewsScreen from '../screens/admin/AdminReviewsScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <AdminProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="AdminRestaurants" component={AdminRestaurantsScreen} />
        <Stack.Screen
          name="AdminRestaurantForm"
          component={AdminRestaurantFormScreen}
        />
        <Stack.Screen name="AdminFoods" component={AdminFoodsScreen} />
        <Stack.Screen name="AdminFoodForm" component={AdminFoodFormScreen} />
        <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
        <Stack.Screen name="AdminReviews" component={AdminReviewsScreen} />
        <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
        <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
      </Stack.Navigator>
    </AdminProvider>
  );
}
