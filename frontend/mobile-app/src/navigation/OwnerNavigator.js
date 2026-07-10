import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OwnerDashboardScreen from '../screens/Owner/OwnerDashboardScreen';
import OwnerRestaurantProfileScreen from '../screens/Owner/OwnerRestaurantProfileScreen';
import OwnerFoodManagementScreen from '../screens/Owner/OwnerFoodManagementScreen';
import AddEditFoodScreen from '../screens/Owner/AddEditFoodScreen';
import OwnerOrderManagementScreen from '../screens/Owner/OwnerOrderManagementScreen';
import OwnerOrderDetailScreen from '../screens/Owner/OwnerOrderDetailScreen';
import ChatListScreen from '../screens/Chat/ChatListScreen';
import ChatDetailScreen from '../screens/Chat/ChatDetailScreen';
import AIFoodAssistantScreen from '../screens/AI/AIFoodAssistantScreen';

const Stack = createNativeStackNavigator();

export default function OwnerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} />
      <Stack.Screen name="OwnerRestaurantProfile" component={OwnerRestaurantProfileScreen} />
      <Stack.Screen name="OwnerFoodManagement" component={OwnerFoodManagementScreen} />
      <Stack.Screen name="AddEditFood" component={AddEditFoodScreen} />
      <Stack.Screen name="OwnerOrderManagement" component={OwnerOrderManagementScreen} />
      <Stack.Screen name="OwnerOrderDetail" component={OwnerOrderDetailScreen} />
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <Stack.Screen name="AIFoodAssistant" component={AIFoodAssistantScreen} />
    </Stack.Navigator>
  );
}
