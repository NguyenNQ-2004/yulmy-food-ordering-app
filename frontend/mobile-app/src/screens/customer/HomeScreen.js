import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { AuthContext } from '../../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {currentUser.fullName}</Text>
      <Text style={styles.subtitle}>Customer Home Screen</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Role</Text>
        <Text>{currentUser.role}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Next Customer Screens</Text>
        <Text>Restaurant List, Food Detail, Cart, Checkout</Text>
      </View>

      <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
        <Text style={styles.cartText}>Open Cart</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const RED = '#B11226';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: RED,
  },
  subtitle: {
    color: '#666',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  logoutButton: {
    backgroundColor: RED,
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  cartButton: {
    borderWidth: 1,
    borderColor: RED,
    padding: 14,
    borderRadius: 12,
    marginTop: 6,
  },
  cartText: {
    color: RED,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
