import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMyOrders } from '../../services/customerOrderApi';

const { width } = Dimensions.get('window');

const RED = '#B11226';
const LIGHT_BG = '#fffaf9';
const GRAY = '#888';
const LIGHT_GRAY = '#f0f0f0';

export default function OrderHistoryScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Active');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getMyOrders();
      // handle both { orders: [] } and [] just in case the backend hasn't reloaded
      const ordersArray = Array.isArray(data) ? data : (data?.orders || []);
      // sort by creation date descending
      const sortedData = ordersArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
      case 'Confirmed': return '#FFA500';
      case 'Preparing': return '#3b82f6';
      case 'Delivering': return '#8b5cf6';
      case 'Completed': return '#10b981';
      case 'Cancelled': return '#ef4444';
      default: return GRAY;
    }
  };

  const getStatusText = (status) => {
    return status;
  };

  // Filter orders based on tabs
  const activeStatuses = ['Pending', 'Confirmed', 'Preparing', 'Delivering'];
  
  const activeOrders = orders.filter(o => activeStatuses.includes(o.orderStatus));
  const completedOrders = orders.filter(o => o.orderStatus === 'Completed');
  const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled');

  let displayOrders = [];
  if (activeTab === 'Active') displayOrders = activeOrders;
  else if (activeTab === 'Completed') displayOrders = completedOrders;
  else if (activeTab === 'Cancelled') displayOrders = cancelledOrders;

  const renderOrderCard = (order) => {
    const items = order.items || [];
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const firstItemImage = items.length > 0 && items[0].food?.image 
      ? items[0].food.image 
      : 'https://via.placeholder.com/150';
      
    // Date formatting
    const orderDate = new Date(order.createdAt);
    const dateString = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeString = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity 
        key={order._id} 
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => {
          // If active order, could navigate to an OrderTrackingScreen, but for now we'll just show it here.
          // Or we can navigate to OrderSuccess for completed? 
          // Let's just log for now or show alert.
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.restaurantInfo}>
            <Image source={{ uri: firstItemImage }} style={styles.restaurantLogo} />
            <View>
              <Text style={styles.restaurantName}>{order.restaurant?.name || 'Restaurant'}</Text>
              <Text style={styles.dateText}>{dateString} • {timeString}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.orderStatus) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(order.orderStatus) }]}>
              {getStatusText(order.orderStatus)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.orderDetails}>
          <View>
            <Text style={styles.itemsText}>
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
            </Text>
            <Text style={styles.itemsList} numberOfLines={1}>
              {items.map(i => `${i.quantity || 1}x ${i.food?.name || 'Item'}`).join(', ')}
            </Text>
          </View>
          <Text style={styles.totalPrice}>${(order.totalAmount || 0).toFixed(2)}</Text>
        </View>

        {activeTab === 'Active' && (
          <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.trackButton}>
              <Text style={styles.trackButtonText}>Track Order</Text>
            </TouchableOpacity>
          </View>
        )}
        {activeTab === 'Completed' && (
          <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.reorderButton}>
              <Text style={styles.reorderButtonText}>Reorder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rateButton}>
              <Text style={styles.rateButtonText}>Rate</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity style={styles.searchIconBtn}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['Active', 'Completed', 'Cancelled'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
            {/* Show dot indicator if there are active orders */}
            {tab === 'Active' && activeOrders.length > 0 && (
              <View style={styles.notificationDot} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color={RED} style={{ marginTop: 50 }} />
        ) : displayOrders.length > 0 ? (
          displayOrders.map(renderOrderCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>
              {activeTab === 'Active' ? '🛵' : activeTab === 'Completed' ? '🍽️' : '📝'}
            </Text>
            <Text style={styles.emptyTitle}>No {activeTab.toLowerCase()} orders</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'Active' 
                ? "You don't have any active orders right now." 
                : activeTab === 'Completed' 
                  ? "You haven't completed any orders yet."
                  : "You have no cancelled orders."}
            </Text>
            {activeTab === 'Active' && (
              <TouchableOpacity 
                style={styles.browseButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.browseButtonText}>Browse Restaurants</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navActiveIcon]}>📋</Text>
          <Text style={styles.navActiveText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#222',
  },
  searchIconBtn: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    color: '#222',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e5e3',
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 12,
    marginRight: 30,
    position: 'relative',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: RED,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: GRAY,
  },
  activeTabText: {
    color: RED,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: -10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0e5e3',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: GRAY,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0e5e3',
    marginVertical: 16,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  itemsList: {
    fontSize: 13,
    color: GRAY,
    maxWidth: width * 0.5,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: RED,
  },
  cardFooter: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  trackButton: {
    flex: 1,
    backgroundColor: RED,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  reorderButton: {
    flex: 1,
    backgroundColor: '#fbe8e8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  reorderButtonText: {
    color: RED,
    fontWeight: '700',
    fontSize: 14,
  },
  rateButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  rateButtonText: {
    color: '#222',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: GRAY,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  browseButton: {
    backgroundColor: RED,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 100,
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
