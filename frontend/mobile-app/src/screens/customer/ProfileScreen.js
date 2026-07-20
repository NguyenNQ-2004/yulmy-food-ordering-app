import React, { useContext } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const RED = '#B11226';
const LIGHT_BG = '#fffaf9';
const GRAY = '#888';

export default function ProfileScreen({ navigation }) {
  const { currentUser, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(currentUser?.fullName)}</Text>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{currentUser?.fullName || 'User'}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{currentUser?.email || 'user@example.com'}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.label}>Role</Text>
          <Text style={[styles.value, { textTransform: 'capitalize', fontSize: 16, color: '#222', fontWeight: 'bold' }]}>
            {currentUser?.role?.replace('_', ' ') || 'Customer'}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: RED,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 30,
  },
  label: {
    fontSize: 12,
    color: GRAY,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0e5e3',
    marginVertical: 15,
  },
  logoutButton: {
    backgroundColor: '#fbe8e8',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: RED,
    fontSize: 16,
    fontWeight: 'bold',
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
});
