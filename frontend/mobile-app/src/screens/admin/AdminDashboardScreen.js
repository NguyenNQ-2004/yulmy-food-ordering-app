import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { AuthContext } from '../../context/AuthContext';

export default function AdminDashboardScreen() {
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Welcome, {currentUser.fullName}</Text>

      <View style={styles.row}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text>Total Orders</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text>Revenue</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Role</Text>
        <Text>{currentUser.role}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Next Admin Screens</Text>
        <Text>Restaurant CRUD, Food CRUD, Order Management</Text>
      </View>

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
    fontSize: 26,
    fontWeight: 'bold',
    color: RED,
  },
  subtitle: {
    color: '#666',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 14,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: RED,
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
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});