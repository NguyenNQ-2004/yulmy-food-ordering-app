import React, { useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform,
  Dimensions,
} from 'react-native';

import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const RED = '#B11226';
const LIGHT_BG = '#fffaf9';
const GRAY = '#888';

const ProfileIcon = ({ type }) => {
  switch (type) {
    case 'orders':
      return (
        <View style={styles.documentIcon}>
          <View style={styles.documentLine} />
          <View style={styles.documentLine} />
          <View style={styles.documentLineShort} />
        </View>
      );
    case 'addresses':
      return (
        <View style={styles.pinIcon}>
          <View style={styles.pinDot} />
        </View>
      );
    case 'payments':
      return (
        <View style={styles.cardIconShape}>
          <View style={styles.cardStrip} />
          <View style={styles.cardDot} />
        </View>
      );
    case 'settings':
      return (
        <Text style={styles.gearIconText}>⚙︎</Text>
      );
    case 'help':
      return (
        <View style={styles.helpIconShape}>
          <Text style={styles.helpIconText}>?</Text>
        </View>
      );
    default:
      return null;
  }
};

export default function ProfileScreen({ navigation }) {
  const { currentUser, confirmLogout } = useContext(AuthContext);

  const menuOptions = [
    {
      id: 'orders',
      label: 'My Orders',
      action: () => navigation.navigate('OrderHistory'),
    },
    {
      id: 'addresses',
      label: 'My Addresses',
      action: () => navigation.navigate('AddressSelection'),
    },
    {
      id: 'payments',
      label: 'Payment Methods',
      action: () => navigation.navigate('PaymentMethod'),
    },
    {
      id: 'settings',
      label: 'Settings',
      action: () => navigation.navigate('Settings'),
    },
    {
      id: 'help',
      label: 'Help',
      action: () => {
        alert('For help, please contact support at support@epicurean.com or call 1-800-EPICUREAN.');
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backIcon}>{'<-'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Epicurean</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.headerEmoji}>👜</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card / User Info */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }} 
            style={styles.avatar} 
          />
          <Text style={styles.fullName}>{currentUser?.fullName || 'Eleanor Vance'}</Text>
          <Text style={styles.email}>{currentUser?.email || 'eleanor.vance@example.com'}</Text>
        </View>

        {/* Options List */}
        <View style={styles.optionsList}>
          {menuOptions.map((option) => (
            <TouchableOpacity 
              key={option.id} 
              style={styles.optionRow} 
              onPress={option.action}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={styles.iconContainer}>
                  <ProfileIcon type={option.id} />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </View>
              <Text style={styles.chevron}>&gt;</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => confirmLogout('Are you sure you want to log out of Epicurean?')}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Search')}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navLabel}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Favorites')}>
          <Text style={styles.navIcon}>♥</Text>
          <Text style={styles.navLabel}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('OrderHistory')}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navActiveIcon]}>👤</Text>
          <Text style={styles.navActiveText}>Profile</Text>
          <View style={styles.activeDot} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: LIGHT_BG,
  },
  headerIcon: {
    padding: 5,
  },
  backIcon: {
    fontSize: 20,
    color: RED,
  },
  headerEmoji: {
    fontSize: 20,
    color: RED,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: RED,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 15,
  },
  email: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  optionsList: {
    marginBottom: 20,
  },
  optionRow: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0e5e3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  documentIcon: {
    width: 18,
    height: 20,
    borderWidth: 2,
    borderColor: RED,
    borderRadius: 3,
    padding: 2,
    justifyContent: 'center',
    gap: 2,
  },
  documentLine: {
    height: 1.5,
    backgroundColor: RED,
    width: '100%',
  },
  documentLineShort: {
    height: 1.5,
    backgroundColor: RED,
    width: '60%',
  },
  pinIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: RED,
  },
  cardIconShape: {
    width: 22,
    height: 15,
    borderWidth: 2,
    borderColor: RED,
    borderRadius: 3,
    justifyContent: 'space-between',
    paddingVertical: 1.5,
  },
  cardStrip: {
    height: 2,
    backgroundColor: RED,
    width: '100%',
  },
  cardDot: {
    width: 4,
    height: 1.5,
    backgroundColor: RED,
    marginLeft: 2,
    marginBottom: 0.5,
  },
  gearIconText: {
    fontSize: 22,
    color: RED,
    fontWeight: 'bold',
    marginTop: -2,
  },
  helpIconShape: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIconText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: RED,
    textAlign: 'center',
    marginTop: -1.5,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  chevron: {
    fontSize: 16,
    color: '#b09491',
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fde8eb',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1.5,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutText: {
    color: RED,
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomPadding: {
    height: 80,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0e5e3',
    paddingBottom: Platform.OS === 'ios' ? 0 : 6,
    paddingTop: 6,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  navIcon: {
    fontSize: 20,
    color: '#a08582',
  },
  navActiveIcon: {
    color: RED,
  },
  navLabel: {
    color: '#a08582',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  navActiveText: {
    color: RED,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: RED,
    position: 'absolute',
    bottom: 2,
  },
});
