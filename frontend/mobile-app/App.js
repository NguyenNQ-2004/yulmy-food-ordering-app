import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { AuthContext, AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

function NavigationRoot() {
  const { currentUser } = useContext(AuthContext);
  const navigationKey = currentUser ? currentUser.role || 'authenticated' : 'guest';

  return (
    <NavigationContainer key={navigationKey}>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationRoot />
    </AuthProvider>
  );
}
