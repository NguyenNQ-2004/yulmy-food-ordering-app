import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { checkoutOrder, mockOrderPayment } from '../../services/customerOrderApi';

const RED = '#B11226';
const DARK_RED = '#C71923';
const BG = '#fff9f8';
const CARD = '#fff8f7';
const BORDER = '#f3dedc';
const MUTED = '#6f4b4b';

const ORDER_ITEMS = [
  {
    id: 'wagyu-truffle',
    name: 'Wagyu Truffle Tartare',
    description: 'Medium Rare - Extra Truffle',
    price: 85,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=240&h=240&fit=crop',
  },
  {
    id: 'matcha-mousse',
    name: 'Matcha Gold Mousse',
    description: 'Contains Dairy',
    price: 24,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=240&h=240&fit=crop',
  },
];

const CHECKOUT_ADDRESS_STORAGE_KEY = 'checkout_delivery_address';
const CHECKOUT_PAYMENT_STORAGE_KEY = 'checkout_payment_method';

const DEFAULT_ADDRESS = {
  id: 'home',
  label: 'Home',
  receiverName: 'Nguyen Customer',
  phone: '0988888888',
  line1: '123 Culinary Lane, Apt 4B',
  line2: 'Gourmet District, NY 10001',
  note: 'Leave at front desk.',
};

const DEFAULT_PAYMENT_METHOD = {
  id: 'card',
  method: 'MOCK_PAYMENT',
  title: 'Credit Card',
  brand: 'VISA',
  maskedNumber: '•••• •••• •••• 4242',
  subtitle: 'Expires 12/25',
};

function formatMoney(value) {
  if (value >= 1000) {
    return `${Math.round(value).toLocaleString('vi-VN')} đ`;
  }

  return `$${value.toFixed(2)}`;
}

export default function CheckoutScreen({ navigation, route }) {
  const [note, setNote] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(DEFAULT_ADDRESS);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(DEFAULT_PAYMENT_METHOD);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartData = route?.params?.cart;
  const orderItems = cartData?.items?.length ? cartData.items : ORDER_ITEMS;
  const deliveryFee = cartData?.totals?.deliveryFee ?? 15000;

  useEffect(() => {
    let isMounted = true;

    const loadSavedCheckoutData = async () => {
      try {
        const [[, savedAddress], [, savedPaymentMethod]] = await AsyncStorage.multiGet([
          CHECKOUT_ADDRESS_STORAGE_KEY,
          CHECKOUT_PAYMENT_STORAGE_KEY,
        ]);

        if (!isMounted) {
          return;
        }

        if (!route?.params?.selectedAddress && savedAddress) {
          setSelectedAddress(JSON.parse(savedAddress));
        }

        if (!route?.params?.selectedPaymentMethod && savedPaymentMethod) {
          setSelectedPaymentMethod(JSON.parse(savedPaymentMethod));
        }
      } catch (error) {
        console.warn('Cannot load checkout data:', error);
      }
    };

    loadSavedCheckoutData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const address = route?.params?.selectedAddress;

    if (!address) {
      return;
    }

    setSelectedAddress(address);
    AsyncStorage.setItem(CHECKOUT_ADDRESS_STORAGE_KEY, JSON.stringify(address)).catch((error) =>
      console.warn('Cannot save checkout address:', error)
    );
  }, [route?.params?.selectedAddress]);

  useEffect(() => {
    const paymentMethod = route?.params?.selectedPaymentMethod;

    if (!paymentMethod) {
      return;
    }

    setSelectedPaymentMethod(paymentMethod);
    AsyncStorage.setItem(CHECKOUT_PAYMENT_STORAGE_KEY, JSON.stringify(paymentMethod)).catch(
      (error) => console.warn('Cannot save checkout payment method:', error)
    );
  }, [route?.params?.selectedPaymentMethod]);

  const total = useMemo(() => {
    if (cartData?.totals?.total) {
      return cartData.totals.total;
    }

    const itemsTotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return itemsTotal + 17.45;
  }, [cartData?.totals?.total, orderItems]);

  const handlePlaceOrder = async () => {
    Keyboard.dismiss();

    const checkoutPayload = {
      receiverName: selectedAddress.receiverName,
      deliveryAddress: `${selectedAddress.line1}, ${selectedAddress.line2}`,
      phone: selectedAddress.phone,
      note: String(note || '').trim(),
      paymentMethod: selectedPaymentMethod.method,
      voucherCode: cartData?.voucherCode || '',
      deliveryFee,
    };

    setIsSubmitting(true);

    try {
      let orderPayload = await checkoutOrder(checkoutPayload);

      if (selectedPaymentMethod.method === 'MOCK_PAYMENT') {
        const orderId = orderPayload.order?._id;

        if (orderId) {
          orderPayload = await mockOrderPayment(orderId, 'success');
        }
      }

      navigation.navigate('OrderSuccess', {
        checkoutPayload,
        orderPayload,
      });
    } catch (error) {
      Alert.alert(
        'Checkout failed',
        error.response?.data?.message ||
          'Cannot place this order. Please make sure backend and MongoDB are running.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('AddressSelection', {
                  selectedAddressId: selectedAddress.id,
                  selectedPaymentMethod,
                  cart: cartData,
                })
              }
            >
              <Text style={styles.actionText}>EDIT</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addressCard}>
            <View style={styles.pinCircle}>
              <View style={styles.pinDot} />
            </View>
            <View style={styles.addressContent}>
              <Text style={styles.addressName}>{selectedAddress.label}</Text>
              <Text style={styles.addressText}>{selectedAddress.line1}</Text>
              <Text style={styles.addressText}>{selectedAddress.line2}</Text>
              <Text style={styles.addressText}>
                Delivery instructions: {selectedAddress.note || 'No note'}
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, styles.standaloneTitle]}>Order Summary</Text>
          <View style={styles.orderCard}>
            {orderItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.orderItem,
                  index < orderItems.length - 1 && styles.orderItemBorder,
                ]}
              >
                <Image source={{ uri: item.image }} style={styles.foodImage} />
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.foodDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
                <View style={styles.priceColumn}>
                  <Text style={styles.foodPrice}>{formatMoney(item.price)}</Text>
                  <Text style={styles.qtyText}>Qty: {item.quantity}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('PaymentMethod', {
                  selectedPaymentMethodId: selectedPaymentMethod.id,
                  selectedAddress,
                  cart: cartData,
                })
              }
            >
              <Text style={styles.actionText}>CHANGE</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.paymentCard}>
            <View style={styles.visaBadge}>
              <Text style={styles.visaText}>{selectedPaymentMethod.brand}</Text>
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.cardNumber}>{selectedPaymentMethod.maskedNumber}</Text>
              <Text style={styles.cardExpiry}>{selectedPaymentMethod.subtitle}</Text>
            </View>
            <View style={styles.checkCircle}>
              <Text style={styles.checkText}>✓</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, styles.noteTitle]}>Add a Note</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Add delivery notes for the restaurant"
            placeholderTextColor="#b79f9d"
            multiline
          />
        </ScrollView>

        <View style={styles.bottomPanel}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatMoney(total)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.placeOrderButton, isSubmitting && styles.placeOrderButtonDisabled]}
            onPress={handlePlaceOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.placeOrderText}>Place Order</Text>
                <Text style={styles.placeOrderArrow}>-&gt;</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  backIcon: {
    color: '#4a3030',
    fontSize: 26,
    lineHeight: 28,
  },
  headerTitle: {
    color: RED,
    fontSize: 20,
    fontWeight: '900',
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 178,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#090606',
    fontSize: 16,
    fontWeight: '900',
  },
  actionText: {
    color: RED,
    fontSize: 10,
    fontWeight: '900',
  },
  addressCard: {
    minHeight: 120,
    flexDirection: 'row',
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 14,
  },
  pinCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ffe8e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#704041',
  },
  addressContent: {
    flex: 1,
    minWidth: 0,
  },
  addressName: {
    color: '#100909',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 7,
  },
  addressText: {
    color: '#592e31',
    fontSize: 12,
    lineHeight: 20,
  },
  standaloneTitle: {
    marginTop: 28,
    marginBottom: 8,
  },
  orderCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    overflow: 'hidden',
  },
  orderItem: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f2e1df',
  },
  foodImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  foodInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    paddingRight: 8,
  },
  foodName: {
    color: '#0b0707',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 5,
  },
  foodDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 16,
  },
  priceColumn: {
    width: 70,
    alignItems: 'flex-end',
  },
  foodPrice: {
    color: '#090606',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 9,
  },
  qtyText: {
    color: '#4f3535',
    fontSize: 12,
  },
  paymentCard: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  visaBadge: {
    width: 40,
    height: 28,
    borderRadius: 3,
    backgroundColor: '#121b4f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  visaText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  paymentInfo: {
    flex: 1,
    minWidth: 0,
  },
  cardNumber: {
    color: '#110909',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 5,
  },
  cardExpiry: {
    color: MUTED,
    fontSize: 12,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: RED,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 13,
  },
  noteTitle: {
    marginTop: 28,
    marginBottom: 10,
  },
  noteInput: {
    minHeight: 82,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f2e3e1',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#1a0c0c',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  bottomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: '#f6eeee',
    elevation: 30,
  },
  totalRow: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalLabel: {
    color: '#5b4545',
    fontSize: 16,
    fontWeight: '900',
  },
  totalValue: {
    color: RED,
    fontSize: 18,
    fontWeight: '900',
  },
  placeOrderButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: DARK_RED,
    shadowColor: DARK_RED,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  placeOrderButtonDisabled: {
    opacity: 0.72,
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  placeOrderArrow: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 10,
  },
});
