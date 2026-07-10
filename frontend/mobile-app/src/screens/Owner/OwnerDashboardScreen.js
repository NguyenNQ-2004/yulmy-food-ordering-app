import React, { useContext, useState, useEffect, useCallback } from 'react';
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

import { AuthContext } from '../../context/AuthContext';
import Header from '../../components/Header';
import BottomNavBar from '../../components/BottomNavBar';
import api from '../../services/api';

const RED = '#B11226';
const LIGHT_BG = '#fff8f7';
const CARD_BG = '#ffffff';
const TEXT_COLOR = '#271816';

export default function OwnerDashboardScreen({ navigation }) {
  const { currentUser } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Orders', value: '0', growth: '', color: '#e6f4ea' },
    { label: 'Revenue', value: '0 VND', growth: '', color: '#fce8e6' },
    { label: 'Active Dishes', value: '0', growth: '', color: '#e8f0fe' },
    { label: 'Rating', value: '0 ★', growth: '', color: '#fef7e0' },
  ]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]);

  const STATUS_COLORS = {
    Pending: '#F59E0B',
    Confirmed: '#8B5CF6',
    Preparing: '#3B82F6',
    Delivering: '#0EA5E9',
    Completed: '#10B981',
    Cancelled: '#EF4444',
  };

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/owner/dashboard');
      const data = response.data.data;

      setStats([
        { label: 'Total Orders', value: data.totalOrders.toLocaleString(), growth: '', color: '#e6f4ea' },
        { label: 'Revenue', value: `${data.totalRevenue.toLocaleString()} VND`, growth: '', color: '#fce8e6' },
        { label: 'Active Dishes', value: data.activeDishes.toString(), growth: '', color: '#e8f0fe' },
        { label: 'Rating', value: `${data.rating} ★`, growth: '', color: '#fef7e0' },
      ]);

      const formatted = data.recentOrders.map((o) => ({
        id: o._id,
        orderId: `#${o._id.slice(-6).toUpperCase()}`,
        customer: o.user?.fullName || 'Customer',
        time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: `${o.totalAmount.toLocaleString()} VND`,
        status: o.orderStatus,
        statusColor: STATUS_COLORS[o.orderStatus] || '#8f6f6c',
      }));
      setRecentOrders(formatted);

      // Normalize chart data for percentage-based bar heights
      const maxVal = Math.max(...data.chartData, 1);
      setChartData(data.chartData.map((v) => Math.round((v / maxVal) * 100)));
    } catch (error) {
      console.error('Dashboard fetch error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Epicurean Owner"
          subtitle={`Welcome back, ${currentUser?.fullName || 'Owner'}`}
          rightIcon="💬"
          onRightPress={() => navigation.navigate('ChatList')}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={RED} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Epicurean Owner"
        subtitle={`Welcome back, ${currentUser?.fullName || 'Owner'}`}
        rightIcon="💬"
        onRightPress={() => navigation.navigate('ChatList')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Quick AI Trigger Banner */}
        <TouchableOpacity 
          style={styles.aiBanner} 
          onPress={() => navigation.navigate('AIFoodAssistant')}
        >
          <View style={styles.aiBannerLeft}>
            <Text style={styles.aiIcon}>🤖</Text>
            <View>
              <Text style={styles.aiBannerTitle}>AI Culinary Assistant</Text>
              <Text style={styles.aiBannerSubtitle}>Get smart menu suggestions & customer insights</Text>
            </View>
          </View>
          <Text style={styles.aiBannerArrow}>→</Text>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <View style={styles.statValueRow}>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Revenue Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Revenue Overview (7 Days)</Text>
            <Text style={styles.chartPeriod}>This Week</Text>
          </View>
          
          <View style={styles.barChartContainer}>
            {chartData.map((val, idx) => (
              <View key={idx} style={styles.chartBarCol}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${val}%` }]} />
                </View>
                <Text style={styles.chartLabel}>{'MonTueWedThuFriSatSun'.substr(idx * 3, 3)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddEditFood')}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionLabel}>Add Dish</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('OwnerFoodManagement')}
          >
            <Text style={styles.actionIcon}>🍔</Text>
            <Text style={styles.actionLabel}>Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('OwnerOrderManagement')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionLabel}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('OwnerRestaurantProfile')}
          >
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionLabel}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Orders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('OwnerOrderManagement')}>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>

        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('OwnerOrderDetail', { orderId: order.id })}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderIdText}>{order.orderId}</Text>
                <View style={[styles.orderStatusBadge, { backgroundColor: order.statusColor + '20' }]}>
                  <Text style={[styles.orderStatusText, { color: order.statusColor }]}>
                    {order.status}
                  </Text>
                </View>
              </View>
              <View style={styles.orderBody}>
                <Text style={styles.orderCustomer}>{order.customer}</Text>
                <Text style={styles.orderAmount}>{order.amount}</Text>
              </View>
              <Text style={styles.orderTime}>{order.time}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No recent orders yet.</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavBar navigation={navigation} activeRoute="OwnerDashboard" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT_BG },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#8f6f6c', fontWeight: '600' },
  scrollContent: { padding: 20 },
  aiBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#271816', borderRadius: 16, padding: 16, marginBottom: 20,
  },
  aiBannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  aiIcon: { fontSize: 28, marginRight: 12 },
  aiBannerTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
  aiBannerSubtitle: { color: '#e4beb9', fontSize: 11, marginTop: 2 },
  aiBannerArrow: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  statCard: {
    width: '48%', backgroundColor: CARD_BG, borderRadius: 14,
    padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#f0e5e3',
  },
  statLabel: { fontSize: 11, color: '#8f6f6c', fontWeight: '600', marginBottom: 6 },
  statValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statValue: { fontSize: 20, fontWeight: '700', color: TEXT_COLOR },
  chartCard: {
    backgroundColor: CARD_BG, borderRadius: 16, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: '#f0e5e3',
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chartTitle: { fontSize: 15, fontWeight: '700', color: TEXT_COLOR },
  chartPeriod: { fontSize: 11, fontWeight: '600', color: '#8f6f6c' },
  barChartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 120, justifyContent: 'space-between' },
  chartBarCol: { alignItems: 'center', flex: 1 },
  barTrack: {
    width: 16, height: 100, backgroundColor: '#ffe9e6', borderRadius: 8,
    justifyContent: 'flex-end', overflow: 'hidden',
  },
  barFill: { width: '100%', backgroundColor: RED, borderRadius: 8 },
  chartLabel: { fontSize: 9, fontWeight: '600', color: '#8f6f6c', marginTop: 6 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT_COLOR },
  viewAll: { fontSize: 12, fontWeight: '600', color: RED },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionButton: {
    backgroundColor: CARD_BG, borderRadius: 14, padding: 14, alignItems: 'center',
    width: '23%', borderWidth: 1, borderColor: '#f0e5e3',
  },
  actionIcon: { fontSize: 22, marginBottom: 6 },
  actionLabel: { fontSize: 10, fontWeight: '700', color: TEXT_COLOR },
  orderCard: {
    backgroundColor: CARD_BG, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#f0e5e3',
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderIdText: { fontSize: 13, fontWeight: '700', color: TEXT_COLOR },
  orderStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  orderStatusText: { fontSize: 10, fontWeight: '700' },
  orderBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderCustomer: { fontSize: 13, color: '#8f6f6c', fontWeight: '550' },
  orderAmount: { fontSize: 14, fontWeight: '700', color: RED },
  orderTime: { fontSize: 10, color: '#8f6f6c', marginTop: 4 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { color: '#8f6f6c', fontSize: 14, fontWeight: '600' },
});
