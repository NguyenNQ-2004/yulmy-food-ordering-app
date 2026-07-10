import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';

import Header from '../../components/Header';
import api from '../../services/api';

const RED = '#B11226';
const LIGHT_BG = '#fff8f7';
const CARD_BG = '#ffffff';
const TEXT_COLOR = '#271816';

export default function OwnerOrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params || {};
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await api.get('/owner/orders');
        const found = response.data.data.find(o => o._id === orderId);
        if (found) {
          setOrder(found);
        }
      } catch (error) {
        console.error('Fetch order detail error:', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetail();
  }, [orderId]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setIsUpdating(true);
      await api.put(`/owner/orders/${orderId}/status`, { status: newStatus });
      setOrder(prev => ({ ...prev, orderStatus: newStatus }));
      setShowStatusOptions(false);
      Alert.alert('Status Updated', `Order status changed to ${newStatus}.`);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Order Details" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={RED} />
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = order.orderStatus;
  const shortId = `#${order._id.slice(-6).toUpperCase()}`;
  const items = order.items || [];
  const customer = order.user || {};
  const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const total = order.totalAmount;
  const deliveryFee = Math.max(total - subtotal, 0); // derive so subtotal + fee === total

  const timeline = [
    { title: 'Order Placed', time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), completed: true },
    { title: 'Confirmed', time: '', completed: ['Confirmed', 'Preparing', 'Delivering', 'Completed'].includes(status) },
    { title: 'Preparing', time: '', completed: ['Preparing', 'Delivering', 'Completed'].includes(status) },
    { title: 'Delivering', time: '', completed: ['Delivering', 'Completed'].includes(status) },
    { title: 'Completed', time: '', completed: status === 'Completed' },
  ];

  const allowedTransitions = {
    Pending: ['Confirmed', 'Cancelled'],
    Confirmed: ['Preparing', 'Cancelled'],
    Preparing: ['Delivering'],
    Delivering: ['Completed'],
    Completed: [],
    Cancelled: [],
  };

  const statusList = allowedTransitions[status] || [];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={`Order: ${shortId}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Customer Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Info</Text>
          <Text style={styles.customerName}>{customer.fullName || 'Customer'}</Text>
          <Text style={styles.customerPhone}>{order.phone}</Text>
          
          <View style={styles.cardDivider} />
          
          <Text style={styles.label}>Delivery Address</Text>
          <Text style={styles.addressValue}>{order.deliveryAddress}</Text>
          
          {order.note ? (
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>Note:</Text>
              <Text style={styles.notesText}>{order.note}</Text>
            </View>
          ) : null}
        </View>

        {/* Receipt Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ordered Items</Text>
          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemNameCol}>
                <Text style={styles.itemQty}>{item.quantity}x</Text>
                <Text style={styles.itemName}>{item.food?.name || 'Item'}</Text>
              </View>
              <Text style={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()} VND</Text>
            </View>
          ))}

          <View style={styles.cardDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{subtotal.toLocaleString()} VND</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>{deliveryFee.toLocaleString()} VND</Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>{total.toLocaleString()} VND</Text>
          </View>

          <View style={styles.paymentMethodCard}>
            <Text style={styles.paymentMethodText}>💳 Payment: {order.paymentMethod} ({order.paymentStatus})</Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Timeline</Text>
          {timeline.map((step, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, step.completed && styles.timelineDotCompleted]} />
                {idx < timeline.length - 1 && (
                  <View style={[styles.timelineLine, step.completed && styles.timelineLineCompleted]} />
                )}
              </View>
              <View style={styles.timelineRight}>
                <Text style={[styles.timelineStepTitle, step.completed && styles.timelineStepTitleActive]}>
                  {step.title}
                </Text>
                <Text style={styles.timelineStepTime}>{step.completed ? (step.time || '✓') : 'Pending'}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Button */}
        {statusList.length > 0 && (
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => setShowStatusOptions(true)}
          >
            <Text style={styles.updateButtonText}>Update Status ({status})</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Status Options Action Sheet Overlay */}
      {showStatusOptions && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.overlayClose} onPress={() => setShowStatusOptions(false)} />
          <View style={styles.actionSheet}>
            <Text style={styles.sheetTitle}>Select New Status</Text>
            {statusList.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.sheetItem}
                onPress={() => handleUpdateStatus(s)}
                disabled={isUpdating}
              >
                <Text style={styles.sheetText}>{s}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelSheetBtn}
              onPress={() => setShowStatusOptions(false)}
            >
              <Text style={styles.cancelSheetText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT_BG },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#8f6f6c', fontWeight: '600' },
  scrollContent: { padding: 20 },
  card: {
    backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1,
    borderColor: '#f0e5e3', padding: 16, marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: TEXT_COLOR, marginBottom: 12 },
  customerName: { fontSize: 15, fontWeight: '600', color: TEXT_COLOR },
  customerPhone: { fontSize: 13, color: '#8f6f6c', marginTop: 4 },
  cardDivider: { height: 1, backgroundColor: '#f0e5e3', marginVertical: 12 },
  label: { fontSize: 11, color: '#8f6f6c', fontWeight: '600' },
  addressValue: { fontSize: 13, color: TEXT_COLOR, lineHeight: 18, marginTop: 4 },
  notesContainer: {
    backgroundColor: '#ffe9e6', borderRadius: 8, padding: 10,
    marginTop: 12, borderWidth: 0.5, borderColor: '#e4beb9',
  },
  notesTitle: { fontSize: 11, fontWeight: '700', color: RED },
  notesText: { fontSize: 12, color: TEXT_COLOR, marginTop: 4, fontStyle: 'italic' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  itemNameCol: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  itemQty: { fontSize: 14, fontWeight: '700', color: RED, marginRight: 8 },
  itemName: { fontSize: 14, color: TEXT_COLOR },
  itemPrice: { fontSize: 14, fontWeight: '600', color: TEXT_COLOR },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: '#8f6f6c' },
  summaryValue: { fontSize: 13, color: TEXT_COLOR, fontWeight: '550' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: TEXT_COLOR },
  totalValue: { fontSize: 18, fontWeight: '700', color: RED },
  paymentMethodCard: { backgroundColor: '#e6f4ea', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 6 },
  paymentMethodText: { fontSize: 12, fontWeight: '700', color: '#137333' },
  timelineItem: { flexDirection: 'row', height: 60 },
  timelineLeft: { width: 24, alignItems: 'center', marginRight: 12 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#f0e5e3', zIndex: 1 },
  timelineDotCompleted: { backgroundColor: RED },
  timelineLine: {
    width: 2, flex: 1, backgroundColor: '#f0e5e3',
    position: 'absolute', top: 10, bottom: -10,
  },
  timelineLineCompleted: { backgroundColor: RED },
  timelineRight: { flex: 1 },
  timelineStepTitle: { fontSize: 13, fontWeight: '600', color: '#8f6f6c' },
  timelineStepTitleActive: { color: TEXT_COLOR, fontWeight: '700' },
  timelineStepTime: { fontSize: 11, color: '#8f6f6c', marginTop: 2 },
  updateButton: {
    backgroundColor: RED, height: 54, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  updateButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end', zIndex: 1000,
  },
  overlayClose: { flex: 1 },
  actionSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: TEXT_COLOR, textAlign: 'center', marginBottom: 20 },
  sheetItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0e5e3',
  },
  sheetText: { fontSize: 16, color: '#8f6f6c', fontWeight: '600' },
  cancelSheetBtn: {
    backgroundColor: '#fff0ee', height: 50, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginTop: 20,
    borderWidth: 1, borderColor: '#e4beb9',
  },
  cancelSheetText: { color: RED, fontSize: 15, fontWeight: '700' },
});
