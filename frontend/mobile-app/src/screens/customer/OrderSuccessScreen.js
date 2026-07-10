import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getOrderStatus } from '../../services/customerOrderApi';

const RED = '#B11226';
const DARK_RED = '#C71923';
const BG = '#fff7f6';
const BORDER = '#f1d8d5';
const MUTED = '#5d3434';

export default function OrderSuccessScreen({ navigation, route }) {
  const [isTracking, setIsTracking] = useState(false);
  const orderPayload = route?.params?.orderPayload;
  const order = orderPayload?.order;
  const payment = orderPayload?.payment;
  const orderId = order?._id;
  const orderCode = order?.orderCode ? `#${order.orderCode}` : '#EPC-7492A';
  const orderStatus = order?.orderStatus || 'Confirmed';
  const paymentStatus = payment?.status || order?.paymentStatus || 'pending';

  const handleTrackOrder = async () => {
    if (!orderId) {
      Alert.alert('Track Order', 'This demo order has no backend order id.');
      return;
    }

    setIsTracking(true);

    try {
      const status = await getOrderStatus(orderId);
      Alert.alert(
        'Order Status',
        `Order: ${status.orderStatus}\nPayment: ${status.paymentStatus}`
      );
    } catch (error) {
      Alert.alert(
        'Track Order failed',
        error.response?.data?.message || 'Cannot load this order status.'
      );
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.successCircle}>
          <View style={styles.checkStem} />
          <View style={styles.checkArm} />
        </View>

        <Text style={styles.title}>Order Confirmed</Text>
        <Text style={styles.subtitle}>Your culinary experience is being prepared.</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order ID</Text>
            <Text style={styles.summaryValue}>{orderCode}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order Status</Text>
            <Text style={styles.timeValue}>{orderStatus}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment</Text>
            <Text style={styles.timeValue}>{paymentStatus}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.trackButton, isTracking && styles.trackButtonDisabled]}
          onPress={handleTrackOrder}
          disabled={isTracking}
        >
          {isTracking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.trackText}>Track Order</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.homeText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  screen: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  successCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: '#e85c64',
    backgroundColor: '#fae0df',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  checkStem: {
    width: 16,
    height: 32,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: RED,
    transform: [{ rotate: '45deg' }],
    marginTop: -8,
  },
  checkArm: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  title: {
    color: '#060505',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: MUTED,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 42,
  },
  summaryCard: {
    width: '100%',
    minHeight: 100,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff2f0',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 38,
  },
  summaryRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: MUTED,
    fontSize: 13,
  },
  summaryValue: {
    color: '#080606',
    fontSize: 16,
    fontWeight: '900',
  },
  timeValue: {
    color: RED,
    fontSize: 16,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: '#edd8d5',
    marginVertical: 6,
  },
  trackButton: {
    width: '100%',
    height: 46,
    borderRadius: 6,
    backgroundColor: DARK_RED,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DARK_RED,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 14,
  },
  trackButtonDisabled: {
    opacity: 0.72,
  },
  trackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  homeButton: {
    width: '100%',
    height: 46,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeText: {
    color: '#100909',
    fontSize: 15,
    fontWeight: '900',
  },
});
