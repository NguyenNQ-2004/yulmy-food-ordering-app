import React, { useContext } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import AdminNavigator from './AdminNavigator';

export default function AppNavigator() {
  const { authLoading, currentUser } = useContext(AuthContext);
  const navigationKey = currentUser ? currentUser.role || 'authenticated' : 'guest';

  if (authLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#b11226" />
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    return <AuthNavigator key={navigationKey} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminNavigator key={navigationKey} />;
  }

  return <CustomerNavigator key={navigationKey} />;
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f5f2',
  },
});
