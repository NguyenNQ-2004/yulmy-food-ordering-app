import React, { useContext } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import AdminNavigator from './AdminNavigator';

export default function AppNavigator() {
  const { authLoading, currentUser } = useContext(AuthContext);

  if (authLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#b11226" />
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    return <AuthNavigator />;
  }

  if (currentUser.role === 'admin') {
    return <AdminNavigator />;
  }

  return <CustomerNavigator />;
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f5f2',
  },
});
