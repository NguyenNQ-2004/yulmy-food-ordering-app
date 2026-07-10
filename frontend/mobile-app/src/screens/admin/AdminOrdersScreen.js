import React, { useContext, useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AdminBottomBar from '../../components/admin/AdminBottomBar';
import AdminHeader from '../../components/admin/AdminHeader';
import { AdminContext } from '../../context/AdminContext';
import { AuthContext } from '../../context/AuthContext';

const RED = '#b11226';
const BACKGROUND = '#f7f5f2';
const CARD = '#ffffff';
const TEXT = '#151515';
const MUTED = '#7b7b86';

const FILTERS = ['all', 'Pending', 'Preparing', 'Delivering', 'Completed'];
const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Delivering',
  'Completed',
  'Cancelled',
];

export default function AdminOrdersScreen({ navigation }) {
  const { currentUser, logout } = useContext(AuthContext);
  const { orders, updateOrderStatus, error, loading } = useContext(AdminContext);
  const [keyword, setKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const avatarLabel = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'AD';

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === 'all' ? true : order.orderStatus === activeFilter;

      const searchText = keyword.trim().toLowerCase();
      const matchesSearch = !searchText
        ? true
        : [
            order.code,
            order.customerName,
            order.customerEmail,
            order.restaurantName,
            order.orderStatus,
          ]
            .join(' ')
            .toLowerCase()
            .includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, keyword, orders]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Do you want to logout from admin portal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleStatusChange = (order) => {
    Alert.alert(
      `Order #${order.code}`,
      'Select the next order status',
      [
        ...ORDER_STATUSES.map((status) => ({
          text: status,
          onPress: async () => {
            try {
              await updateOrderStatus(order.id, status);
            } catch (requestError) {
              Alert.alert(
                'Update Failed',
                requestError.response?.data?.message ||
                  'Could not update order status.'
              );
            }
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <AdminHeader
            avatarLabel={avatarLabel}
            onAvatarPress={handleLogout}
            onBackPress={() => navigation.navigate('AdminDashboard')}
          />

          <Text style={styles.screenTitle}>Order Management</Text>
          <Text style={styles.screenSubtitle}>
            Review order progress and update fulfillment statuses.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.searchBox}>
            <Text style={styles.searchPrefix}>Q</Text>
            <TextInput
              value={keyword}
              onChangeText={setKeyword}
              placeholder="Search orders..."
              placeholderTextColor="#9a9aa5"
              style={styles.searchInput}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text
                    style={[styles.filterText, isActive && styles.filterTextActive]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {loading.orders && orders.length === 0 ? (
            <Text style={styles.helperText}>Loading orders...</Text>
          ) : null}

          {filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderCode}>Order #{order.code}</Text>
                <Text style={styles.orderAmount}>{order.totalAmountLabel}</Text>
              </View>
              <Text style={styles.metaText}>{order.customerName}</Text>
              <Text style={styles.metaText}>{order.restaurantName}</Text>
              <Text style={styles.metaText}>
                {order.itemCount} items • {order.paymentMethod} • {order.paymentStatus}
              </Text>
              <Text style={styles.metaText}>{order.createdAtLabel}</Text>
              <Text style={styles.addressText} numberOfLines={2}>
                {order.deliveryAddress}
              </Text>

              <View style={styles.bottomRow}>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{order.orderStatus}</Text>
                </View>

                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={() => handleStatusChange(order)}
                >
                  <Text style={styles.updateButtonText}>Update Status</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <AdminBottomBar activeTab="orders" navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  root: { flex: 1, backgroundColor: BACKGROUND },
  scrollContent: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 132 },
  screenTitle: { color: TEXT, fontSize: 29, fontWeight: '800', marginBottom: 6 },
  screenSubtitle: { color: MUTED, fontSize: 13, lineHeight: 18, marginBottom: 16 },
  errorText: { color: RED, fontSize: 12, fontWeight: '700', marginBottom: 12 },
  helperText: { color: MUTED, fontSize: 13, marginBottom: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ecd8d5',
    paddingHorizontal: 14,
    minHeight: 54,
    marginBottom: 14,
  },
  searchPrefix: { color: RED, fontSize: 13, fontWeight: '800', marginRight: 10 },
  searchInput: { flex: 1, color: TEXT, fontSize: 14 },
  filterRow: { paddingRight: 10, gap: 10, marginBottom: 18 },
  filterPill: {
    backgroundColor: CARD,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ecd8d5',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  filterPillActive: { backgroundColor: RED, borderColor: RED },
  filterText: { color: MUTED, fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: '#fff' },
  orderCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f1eee8',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderCode: { color: TEXT, fontSize: 16, fontWeight: '800' },
  orderAmount: { color: TEXT, fontSize: 16, fontWeight: '800' },
  metaText: { color: MUTED, fontSize: 12, marginBottom: 3 },
  addressText: { color: '#4e5260', fontSize: 12, marginTop: 4, marginBottom: 10 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: { backgroundColor: '#fff5f6', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { color: RED, fontSize: 10, fontWeight: '800' },
  updateButton: { backgroundColor: RED, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  updateButtonText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
