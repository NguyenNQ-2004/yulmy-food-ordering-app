import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const RED = '#b11226';
const CARD = '#ffffff';
const BORDER = '#ece8e1';
const MUTED = '#7c7d85';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'DB', screen: 'AdminDashboard' },
  { key: 'users', label: 'Users', icon: 'US', screen: 'AdminUsers' },
  { key: 'restaurants', label: 'Shops', icon: 'RS', screen: 'AdminRestaurants' },
  { key: 'reviews', label: 'Reviews', icon: 'RV', screen: 'AdminReviews' },
  { key: 'settings', label: 'Settings', icon: 'ST', screen: 'AdminSettings' },
];

export default function AdminBottomBar({ activeTab, navigation }) {
  const handleTabPress = (tab) => {
    if (!tab.screen) {
      Alert.alert('Coming Soon', `${tab.label} screen will be implemented next.`);
      return;
    }

    if (tab.key !== activeTab) {
      navigation.navigate(tab.screen);
    }
  };

  return (
    <View style={styles.bottomBar}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.bottomItem}
            activeOpacity={0.85}
            onPress={() => handleTabPress(tab)}
          >
            <Text style={[styles.bottomIcon, isActive && styles.bottomIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.bottomLabel, isActive && styles.bottomLabelActive]}>
              {tab.label}
            </Text>
            {isActive ? <View style={styles.bottomDot} /> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  bottomIcon: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.6,
  },
  bottomIconActive: {
    color: RED,
  },
  bottomLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '600',
  },
  bottomLabelActive: {
    color: RED,
  },
  bottomDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: RED,
    marginTop: 5,
  },
});
