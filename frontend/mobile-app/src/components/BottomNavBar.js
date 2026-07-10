import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';

const RED = '#B11226';
const GRAY = '#8f6f6c';

export default function BottomNavBar({ navigation, activeRoute }) {
  const tabs = [
    { name: 'OwnerDashboard', label: 'Dashboard', icon: '📊' },
    { name: 'OwnerOrderManagement', label: 'Orders', icon: '📋' },
    { name: 'OwnerFoodManagement', label: 'Menu', icon: '🍔' },
    { name: 'OwnerRestaurantProfile', label: 'Profile', icon: '⚙️' }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = activeRoute === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabButton}
              onPress={() => {
                if (!isActive) {
                  navigation.navigate(tab.name);
                }
              }}
            >
              <Text style={[styles.icon, isActive && styles.activeIcon]}>
                {tab.icon}
              </Text>
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0e5e3',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 0 : 6,
    paddingTop: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    fontSize: 20,
    color: GRAY,
    opacity: 0.7,
  },
  activeIcon: {
    color: RED,
    opacity: 1,
  },
  label: {
    fontSize: 10,
    color: GRAY,
    fontWeight: '600',
    marginTop: 2,
  },
  activeLabel: {
    color: RED,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: RED,
    position: 'absolute',
    bottom: -2,
  },
});
