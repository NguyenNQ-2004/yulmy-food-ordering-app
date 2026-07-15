import React, { useContext, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
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

const FILTERS = [
  'all',
  'Pending',
  'Confirmed',
  'Preparing',
  'Delivering',
  'Completed',
  'Cancelled',
];

const STATUS_TONE = {
  Pending: { bg: '#fff4e6', text: '#cc7a00' },
  Confirmed: { bg: '#fef1f3', text: RED },
  Preparing: { bg: '#fff7dd', text: '#a06a00' },
  Delivering: { bg: '#eef6ff', text: '#2563eb' },
  Completed: { bg: '#edf8f0', text: '#1f8f4d' },
  Cancelled: { bg: '#f3f4f6', text: '#6b7280' },
};

function StatChip({ label, value, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.statChip, active && styles.statChipActive]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.statChipValue, active && styles.statChipValueActive]}>
        {value}
      </Text>
      <Text style={[styles.statChipLabel, active && styles.statChipLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function AdminOrdersScreen({ navigation }) {
  const { currentUser, confirmLogout } = useContext(AuthContext);
  const {
    orders,
    loadOrders,
    loadDashboard,
    getOrderDetail,
    updateOrderStatus,
    error,
    loading,
  } = useContext(AdminContext);
  const [keyword, setKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusVisible, setStatusVisible] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');

  const avatarLabel = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'AD';

  const summary = useMemo(() => {
    const counts = {
      all: orders.length,
      Pending: 0,
      Confirmed: 0,
      Preparing: 0,
      Delivering: 0,
      Completed: 0,
      Cancelled: 0,
    };

    orders.forEach((order) => {
      if (counts[order.orderStatus] !== undefined) {
        counts[order.orderStatus] += 1;
      }
    });

    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const searchText = keyword.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === 'all' ? true : order.orderStatus === activeFilter;

      const matchesSearch = !searchText
        ? true
        : [
            order.code,
            order.customerName,
            order.customerEmail,
            order.receiverName,
            order.customerPhone,
            order.phone,
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
    confirmLogout('Do you want to logout from admin portal?');
  };

  const openNotice = (title, message) => {
    setNoticeTitle(title);
    setNoticeMessage(message);
    setNoticeVisible(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadOrders(), loadDashboard()]);
    setRefreshing(false);
  };

  const handleOpenDetail = async (orderId) => {
    try {
      setDetailVisible(true);
      setDetailLoading(true);
      setDetailError('');
      const detail = await getOrderDetail(orderId);
      setSelectedOrder(detail);
    } catch (requestError) {
      setDetailError(
        requestError.response?.data?.message || 'Could not load order details.'
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenStatus = (order) => {
    setStatusTarget(order);
    setStatusVisible(true);
  };

  const handleSubmitStatus = async (nextStatus) => {
    if (!statusTarget) {
      return;
    }

    try {
      setStatusSubmitting(true);
      const updatedOrder = await updateOrderStatus(statusTarget.id, nextStatus);
      setStatusTarget(updatedOrder);
      setStatusVisible(false);

      if (selectedOrder?.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder);
      }
    } catch (requestError) {
      openNotice(
        'Update Failed',
        requestError.response?.data?.message || 'Could not update order status.'
      );
    } finally {
      setStatusSubmitting(false);
    }
  };

  const detailTone = STATUS_TONE[selectedOrder?.orderStatus] || STATUS_TONE.Pending;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={RED}
            />
          }
        >
          <AdminHeader
            avatarLabel={avatarLabel}
            onAvatarPress={handleLogout}
            onBackPress={() => navigation.navigate('AdminDashboard')}
          />

          <Text style={styles.screenTitle}>Order Management</Text>
          <Text style={styles.screenSubtitle}>
            Review each order, inspect line items, and move fulfillment forward.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.searchBox}>
            <Text style={styles.searchPrefix}>Search</Text>
            <TextInput
              value={keyword}
              onChangeText={setKeyword}
              placeholder="Order code, customer, restaurant..."
              placeholderTextColor="#9a9aa5"
              style={styles.searchInput}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsRow}
          >
            {FILTERS.map((filter) => (
              <StatChip
                key={filter}
                label={filter === 'all' ? 'All' : filter}
                value={summary[filter] || 0}
                active={activeFilter === filter}
                onPress={() => setActiveFilter(filter)}
              />
            ))}
          </ScrollView>

          {loading.orders && orders.length === 0 ? (
            <Text style={styles.helperText}>Loading orders...</Text>
          ) : null}

          {!loading.orders && filteredOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No orders match this view</Text>
              <Text style={styles.emptyText}>
                Try another status filter or clear the search keyword.
              </Text>
            </View>
          ) : null}

          {filteredOrders.map((order) => {
            const tone = STATUS_TONE[order.orderStatus] || STATUS_TONE.Pending;

            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                activeOpacity={0.92}
                onPress={() => handleOpenDetail(order.id)}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderCode}>{order.code}</Text>
                  <Text style={styles.orderAmount}>{order.totalAmountLabel}</Text>
                </View>

                <Text style={styles.primaryMeta}>{order.receiverName}</Text>
                <Text style={styles.metaText}>
                  {order.customerName} {'\u2022'} {order.restaurantName}
                </Text>
                <Text style={styles.metaText}>
                  {order.itemCount} items {'\u2022'} {order.paymentMethod} {'\u2022'}{' '}
                  {order.paymentStatus}
                </Text>
                <Text style={styles.metaText}>{order.createdAtLabel}</Text>
                <Text style={styles.addressText} numberOfLines={2}>
                  {order.deliveryAddress}
                </Text>

                <View style={styles.bottomRow}>
                  <View style={[styles.statusPill, { backgroundColor: tone.bg }]}>
                    <Text style={[styles.statusText, { color: tone.text }]}>
                      {order.orderStatus}
                    </Text>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => handleOpenDetail(order.id)}
                    >
                      <Text style={styles.secondaryButtonText}>Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.updateButton}
                      onPress={() => handleOpenStatus(order)}
                    >
                      <Text style={styles.updateButtonText}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <AdminBottomBar activeTab="orders" navigation={navigation} />
      </View>

      <Modal
        visible={detailVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailSheet}>
            <View style={styles.modalTopRow}>
              <Text style={styles.modalTitle}>Order Detail</Text>
              <TouchableOpacity onPress={() => setDetailVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>

            {detailLoading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={RED} />
                <Text style={styles.helperText}>Loading order detail...</Text>
              </View>
            ) : detailError ? (
              <Text style={styles.errorText}>{detailError}</Text>
            ) : selectedOrder ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailHeader}>
                  <View>
                    <Text style={styles.detailCode}>{selectedOrder.code}</Text>
                    <Text style={styles.detailMeta}>
                      {selectedOrder.createdAtLabel}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.detailStatusBadge,
                      { backgroundColor: detailTone.bg },
                    ]}
                  >
                    <Text
                      style={[styles.detailStatusText, { color: detailTone.text }]}
                    >
                      {selectedOrder.orderStatus}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Customer</Text>
                  <Text style={styles.detailLine}>{selectedOrder.receiverName}</Text>
                  <Text style={styles.detailSubLine}>{selectedOrder.customerEmail}</Text>
                  <Text style={styles.detailSubLine}>{selectedOrder.phone}</Text>
                  <Text style={styles.detailSubLine}>
                    {selectedOrder.deliveryAddress}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Restaurant</Text>
                  <Text style={styles.detailLine}>{selectedOrder.restaurantName}</Text>
                  {selectedOrder.restaurantAddress ? (
                    <Text style={styles.detailSubLine}>
                      {selectedOrder.restaurantAddress}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Items</Text>
                  {selectedOrder.items?.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={styles.itemCopy}>
                        <Text style={styles.itemName}>{item.foodName}</Text>
                        <Text style={styles.itemMeta}>
                          Qty {item.quantity} {'\u2022'} {item.priceLabel}
                        </Text>
                      </View>
                      <Text style={styles.itemSubtotal}>{item.subtotalLabel}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Payment</Text>
                  <Text style={styles.detailLine}>
                    {selectedOrder.paymentMethod} {'\u2022'} {selectedOrder.paymentStatus}
                  </Text>
                  {selectedOrder.payment?.transactionCode ? (
                    <Text style={styles.detailSubLine}>
                      Transaction: {selectedOrder.payment.transactionCode}
                    </Text>
                  ) : null}
                  {selectedOrder.payment?.failureReason ? (
                    <Text style={styles.detailSubLine}>
                      Failure: {selectedOrder.payment.failureReason}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Summary</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Items</Text>
                    <Text style={styles.summaryValue}>
                      {selectedOrder.itemsAmountLabel}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery fee</Text>
                    <Text style={styles.summaryValue}>
                      {selectedOrder.deliveryFeeLabel}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Discount</Text>
                    <Text style={styles.summaryValue}>
                      -{selectedOrder.discountAmountLabel}
                    </Text>
                  </View>
                  <View style={[styles.summaryRow, styles.summaryRowStrong]}>
                    <Text style={styles.summaryStrongLabel}>Total</Text>
                    <Text style={styles.summaryStrongValue}>
                      {selectedOrder.totalAmountLabel}
                    </Text>
                  </View>
                </View>

                {selectedOrder.note ? (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Note</Text>
                    <Text style={styles.detailSubLine}>{selectedOrder.note}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.updateButton,
                    styles.modalPrimaryButton,
                  ]}
                  onPress={() => handleOpenStatus(selectedOrder)}
                >
                  <Text style={styles.updateButtonText}>Change Status</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        visible={statusVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusCard}>
            <Text style={styles.modalTitle}>Update Status</Text>
            <Text style={styles.statusSubtitle}>
              {statusTarget
                ? `${statusTarget.code} is currently ${statusTarget.orderStatus}. Choose any other status below.`
                : ''}
            </Text>

            {statusTarget?.allowedNextStatuses?.map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.statusOption}
                disabled={statusSubmitting}
                onPress={() => handleSubmitStatus(status)}
              >
                <Text style={styles.statusOptionText}>{status}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.cancelButton}
              disabled={statusSubmitting}
              onPress={() => setStatusVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={noticeVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNoticeVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.noticeCard}>
            <Text style={styles.modalTitle}>{noticeTitle}</Text>
            <Text style={styles.noticeText}>{noticeMessage}</Text>

            <TouchableOpacity
              style={[styles.updateButton, styles.noticeButton]}
              onPress={() => setNoticeVisible(false)}
            >
              <Text style={styles.updateButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  helperText: { color: MUTED, fontSize: 13, marginTop: 10 },
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
  searchPrefix: { color: RED, fontSize: 12, fontWeight: '800', marginRight: 10 },
  searchInput: { flex: 1, color: TEXT, fontSize: 14 },
  statsRow: { paddingRight: 12, gap: 10, marginBottom: 18 },
  statChip: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ecd8d5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 86,
  },
  statChipActive: {
    backgroundColor: RED,
    borderColor: RED,
  },
  statChipValue: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statChipValueActive: { color: '#fff' },
  statChipLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
  },
  statChipLabelActive: { color: '#ffe7ea' },
  emptyCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f1eee8',
    padding: 18,
  },
  emptyTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyText: { color: MUTED, fontSize: 13, lineHeight: 18 },
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderCode: { color: TEXT, fontSize: 16, fontWeight: '800' },
  orderAmount: { color: TEXT, fontSize: 16, fontWeight: '800' },
  primaryMeta: { color: TEXT, fontSize: 13, fontWeight: '700', marginBottom: 3 },
  metaText: { color: MUTED, fontSize: 12, marginBottom: 3 },
  addressText: { color: '#4e5260', fontSize: 12, marginTop: 4, marginBottom: 10 },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: { fontSize: 10, fontWeight: '800' },
  actionRow: { flexDirection: 'row' },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#eadcd8',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
  },
  secondaryButtonText: { color: TEXT, fontSize: 11, fontWeight: '800' },
  updateButton: {
    backgroundColor: RED,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  updateButtonText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 21, 21, 0.36)',
    justifyContent: 'flex-end',
  },
  detailSheet: {
    backgroundColor: CARD,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: '86%',
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { color: TEXT, fontSize: 22, fontWeight: '800' },
  closeText: { color: RED, fontSize: 14, fontWeight: '700' },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  detailCode: { color: TEXT, fontSize: 18, fontWeight: '800' },
  detailMeta: { color: MUTED, fontSize: 12, marginTop: 4 },
  detailStatusBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  detailStatusText: { fontSize: 11, fontWeight: '800' },
  detailSection: {
    borderWidth: 1,
    borderColor: '#f1eee8',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  detailSectionTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  detailLine: { color: TEXT, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  detailSubLine: { color: MUTED, fontSize: 12, lineHeight: 18, marginBottom: 3 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f4efea',
  },
  itemCopy: { flex: 1, paddingRight: 12 },
  itemName: { color: TEXT, fontSize: 13, fontWeight: '700', marginBottom: 3 },
  itemMeta: { color: MUTED, fontSize: 12 },
  itemSubtotal: { color: TEXT, fontSize: 13, fontWeight: '800' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryRowStrong: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1eee8',
    marginBottom: 0,
  },
  summaryLabel: { color: MUTED, fontSize: 12 },
  summaryValue: { color: TEXT, fontSize: 13, fontWeight: '700' },
  summaryStrongLabel: { color: TEXT, fontSize: 14, fontWeight: '800' },
  summaryStrongValue: { color: RED, fontSize: 16, fontWeight: '800' },
  modalPrimaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  statusCard: {
    marginHorizontal: 18,
    marginBottom: 28,
    marginTop: 'auto',
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 18,
  },
  statusSubtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 14,
  },
  statusOption: {
    borderWidth: 1,
    borderColor: '#eadcd8',
    borderRadius: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statusOptionText: { color: TEXT, fontSize: 14, fontWeight: '700' },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#eadcd8',
    borderRadius: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cancelButtonText: { color: MUTED, fontSize: 14, fontWeight: '700' },
  noticeCard: {
    marginHorizontal: 18,
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 20,
  },
  noticeText: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  noticeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
});
