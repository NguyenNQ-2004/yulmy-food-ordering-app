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
  const [activeTab, setActiveTab] = useState('Past'); // Mock shows "Past" active by default
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
      const ordersArray = Array.isArray(data) ? data : (data?.orders || []);
      const sortedData = ordersArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status) => {
    if (status === 'Completed') return 'Delivered';
    return status;
  };

  const activeStatuses = ['Pending', 'Confirmed', 'Preparing', 'Delivering'];
  
  const currentOrders = orders.filter(o => activeStatuses.includes(o.orderStatus));
  const pastOrders = orders.filter(o => ['Completed', 'Cancelled'].includes(o.orderStatus));

  let displayOrders = [];
  if (activeTab === 'Current') displayOrders = currentOrders;
  else if (activeTab === 'Past') displayOrders = pastOrders;

  const renderOrderCard = (order) => {
    const items = order.items || [];
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const firstItemImage = items.length > 0 && items[0].food?.image 
      ? items[0].food.image 
      : 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150';
      
    const orderDate = new Date(order.createdAt);
    const dateString = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeString = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const isDelivered = order.orderStatus === 'Completed';

    return (
      <View key={order._id} style={styles.card}>
        <TouchableOpacity 
          style={styles.cardMainContent}
          activeOpacity={0.8}
          onPress={() => {
            if (activeStatuses.includes(order.orderStatus)) {
              navigation.navigate('Tracking', { orderId: order._id });
            }
          }}
        >
          {/* Left: Food Image */}
          <Image source={{ uri: firstItemImage }} style={styles.cardImage} />

          {/* Right: Info */}
          <View style={styles.cardInfo}>
            {/* Row 1: Restaurant Name & Status Badge */}
            <View style={styles.row1}>
              <Text style={styles.restaurantName} numberOfLines={1}>
                {order.restaurant?.name || 'Restaurant'}
              </Text>
              <View style={[
                styles.statusBadge, 
                isDelivered ? styles.deliveredBadge : styles.otherStatusBadge
              ]}>
                <Text style={[
                  styles.statusText, 
                  isDelivered ? styles.deliveredText : styles.otherStatusText
                ]}>
                  {getStatusText(order.orderStatus)}
                </Text>
              </View>
            </View>

            {/* Row 2: Items Summary */}
            <Text style={styles.itemsSummary} numberOfLines={1}>
              {items.map(i => `${i.quantity || 1}x ${i.food?.name || 'Item'}`).join(', ')}
            </Text>

            {/* Row 3: Date/Time & Price */}
            <View style={styles.row3}>
              <Text style={styles.dateTimeText}>
                {dateString} • {timeString}
              </Text>
              <Text style={styles.priceText}>
                ${(order.totalAmount || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Footer Actions */}
        {activeStatuses.includes(order.orderStatus) && (
          <View style={styles.cardFooter}>
            <TouchableOpacity 
              style={styles.trackButton}
              onPress={() => navigation.navigate('Tracking', { orderId: order._id })}
            >
              <Text style={styles.trackButtonText}>Track Order</Text>
            </TouchableOpacity>
          </View>
        )}
        {order.orderStatus === 'Completed' && (
          <View style={styles.cardFooter}>
            <TouchableOpacity 
              style={styles.reorderButton}
              onPress={() => {
                // Navigate to restaurant details to reorder
                if (order.restaurant?._id) {
                  navigation.navigate('RestaurantDetail', { restaurantId: order.restaurant._id });
                } else {
                  navigation.navigate('Home');
                }
              }}
            >
              <Text style={styles.reorderButtonText}>Reorder</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.rateButton}
              onPress={() => navigation.navigate('Review', { orderId: order._id, restaurantName: order.restaurant?.name })}
            >
              <Text style={styles.rateButtonText}>Rate</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

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

      {/* Large Page Title */}
      <Text style={styles.pageTitle}>Order History</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Past' ? styles.activeTab : styles.inactiveTab]}
          onPress={() => setActiveTab('Past')}
          activeOpacity={0.9}
        >
          <Text style={[styles.tabText, activeTab === 'Past' ? styles.activeTabText : styles.inactiveTabText]}>
            Past
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Current' ? styles.activeTab : styles.inactiveTab]}
          onPress={() => setActiveTab('Current')}
          activeOpacity={0.9}
        >
          <Text style={[styles.tabText, activeTab === 'Current' ? styles.activeTabText : styles.inactiveTabText]}>
            Current
          </Text>
          {currentOrders.length > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{currentOrders.length}</Text>
            </View>
          )}
        </TouchableOpacity>
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
              {activeTab === 'Current' ? '🛵' : '🍽️'}
            </Text>
            <Text style={styles.emptyTitle}>No {activeTab.toLowerCase()} orders</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'Current' 
                ? "You don't have any ongoing orders right now." 
                : "You haven't completed any orders yet."}
            </Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.browseButtonText}>Browse Restaurants</Text>
            </TouchableOpacity>
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
          <View style={styles.activeDot} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
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
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#222',
    marginHorizontal: 24,
    marginTop: 10,
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: RED,
  },
  inactiveTab: {
    backgroundColor: '#FFF0F2',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
  inactiveTabText: {
    color: RED,
  },
  badgeCount: {
    backgroundColor: RED,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#fff',
  },
  badgeCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fde8eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  cardMainContent: {
    flexDirection: 'row',
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deliveredBadge: {
    backgroundColor: '#FFF0F2',
  },
  otherStatusBadge: {
    backgroundColor: '#FFF8EB',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  deliveredText: {
    color: RED,
  },
  otherStatusText: {
    color: '#D97706',
  },
  itemsSummary: {
    fontSize: 13,
    color: GRAY,
    marginBottom: 6,
  },
  row3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 12,
    color: GRAY,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222',
  },
  cardFooter: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#fde8eb',
    gap: 10,
  },
  trackButton: {
    flex: 1,
    backgroundColor: RED,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  reorderButton: {
    flex: 1,
    backgroundColor: '#FFF0F2',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  reorderButtonText: {
    color: RED,
    fontWeight: '700',
    fontSize: 13,
  },
  rateButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  rateButtonText: {
    color: '#444',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: GRAY,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  browseButton: {
    backgroundColor: RED,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
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
