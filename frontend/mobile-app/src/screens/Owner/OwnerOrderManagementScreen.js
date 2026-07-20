import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Header from '../../components/Header';
import BottomNavBar from '../../components/BottomNavBar';
import api from '../../services/api';

const RED = '#B11226';
const LIGHT_BG = '#fff8f7';
const CARD_BG = '#ffffff';
const TEXT_COLOR = '#271816';

const STATUS_COLORS = {
  Pending: '#F59E0B',
  Confirmed: '#8B5CF6',
  Preparing: '#3B82F6',
  Delivering: '#0EA5E9',
  Completed: '#10B981',
  Cancelled: '#EF4444',
};

const TABS = ['Pending', 'Confirmed', 'Preparing', 'Delivering', 'Completed'];

export default function OwnerOrderManagementScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('Pending');
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/owner/orders');
      const data = response.data.data;

      const formatted = data.map((o) => ({
        id: o._id,
        orderId: `#${o._id.slice(-6).toUpperCase()}`,
        customer: o.user?.fullName || 'Customer',
        time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: o.items?.map(i => `${i.quantity}x ${i.food?.name || 'Item'}`).join(', ') || 'N/A',
        amount: `${o.totalAmount.toLocaleString()} VND`,
        status: o.orderStatus,
        statusColor: STATUS_COLORS[o.orderStatus] || '#8f6f6c',
      }));

      setOrders(formatted);
    } catch (error) {
      console.error('Fetch orders error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const filteredOrders = orders.filter(
    (order) => order.status.toLowerCase() === activeTab.toLowerCase()
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Manage Orders"
        onBack={() => navigation.navigate('OwnerDashboard')}
        rightIcon="💬"
        onRightPress={() => navigation.navigate('ChatList')}
      />

      {/* Tabs */}
      <View style={{ backgroundColor: '#fff' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabSection}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            const count = orders.filter(
              (o) => o.status.toLowerCase() === tab.toLowerCase()
            ).length;

            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
                {count > 0 && (
                  <View style={[styles.countBadge, { backgroundColor: isActive ? '#fff' : RED }]}>
                    <Text style={[styles.countText, { color: isActive ? RED : '#fff' }]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={RED} />
            <Text style={styles.emptyText}>Loading orders...</Text>
          </View>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('OwnerOrderDetail', { orderId: order.id })}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderId}>{order.orderId}</Text>
                  <Text style={styles.orderTime}>{order.time}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: order.statusColor + '20' }]}>
                  <Text style={[styles.statusText, { color: order.statusColor }]}>
                    {order.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardBody}>
                <Text style={styles.label}>Customer</Text>
                <Text style={styles.value}>{order.customer}</Text>

                <Text style={[styles.label, { marginTop: 6 }]}>Items</Text>
                <Text style={styles.itemsValue} numberOfLines={1}>
                  {order.items}
                </Text>

                <View style={styles.amountRow}>
                  <Text style={styles.label}>Total Amount</Text>
                  <Text style={styles.amountValue}>{order.amount}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} orders.</Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavBar navigation={navigation} activeRoute="OwnerOrderManagement" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  tabSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0e5e3',
    paddingHorizontal: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 4,
  },
  tabButtonActive: {
    borderBottomColor: RED,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8f6f6c',
  },
  tabTextActive: {
    color: RED,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 9,
    fontWeight: '750',
  },
  scrollContent: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0e5e3',
    marginBottom: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  orderTime: {
    fontSize: 11,
    color: '#8f6f6c',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f0e5e3',
    marginVertical: 12,
  },
  cardBody: {
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    color: '#8f6f6c',
    fontWeight: '550',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_COLOR,
    marginTop: 2,
  },
  itemsValue: {
    fontSize: 13,
    color: TEXT_COLOR,
    marginTop: 2,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#f0e5e3',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: RED,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: '#8f6f6c',
    fontSize: 15,
    fontWeight: '600',
  },
});
