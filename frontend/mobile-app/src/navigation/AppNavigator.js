import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import AdminNavigator from './AdminNavigator';
import OwnerNavigator from './OwnerNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { currentUser } = useContext(AuthContext);

  if (currentUser?.role === 'admin') {
    return <AdminNavigator />;
  }

  if (currentUser?.role === 'restaurant_owner' || currentUser?.role === 'owner') {
    return <OwnerNavigator />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerRoot" component={CustomerNavigator} />
      {!currentUser && (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}