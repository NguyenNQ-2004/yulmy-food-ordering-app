import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getMyCart,
  updateCartItem,
  validateVoucher,
} from '../../services/customerOrderApi';
import {
  clearLocalCartItems,
  clearLocalCartVoucher,
  loadLocalCartItems,
  loadLocalCartVoucher,
  saveLocalCartItems,
  saveLocalCartVoucher,
} from '../../services/localCartStorage';
import { AuthContext } from '../../context/AuthContext';

const RED = '#B11226';
const DARK_RED = '#980F20';
const BG = '#fff7f6';
const MUTED = '#7a5d5d';
const BORDER = '#f3d6d3';

function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}

function normalizeCart(cart) {
  if (!cart) {
    return {
      items: [],
      restaurantName: 'Restaurant',
      subtotal: 0,
      totalItems: 0,
    };
  }

  const items = (cart.items || []).map((item) => {
    const food = item.food || {};
    const foodId = food._id || item.food;

    return {
      id: foodId,
      foodId,
      name: item.name || food.name,
      description: food.description || '',
      price: Number(item.price || food.price || 0),
      image: item.image || food.image || '',
      quantity: Number(item.quantity || 0),
      fromApi: true,
    };
  });

  return {
    items,
    restaurantName: cart.restaurant?.name || 'Restaurant',
    subtotal: Number(cart.totalAmount || 0),
    totalItems: Number(cart.totalItems || 0),
  };
}

export default function CartScreen({ navigation, route }) {
  const { currentUser } = React.useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [restaurantName, setRestaurantName] = useState('Il Cortile');
  const [isBackendCart, setIsBackendCart] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [cartError, setCartError] = useState('');
  const [pendingRemoveItem, setPendingRemoveItem] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const localCartItems = route?.params?.localCartItems || [];
  const localRestaurantName = route?.params?.localRestaurantName || 'Epicurean';
  const selectedVoucherParam = route?.params?.selectedVoucher;

  const loadCart = useCallback(async () => {
    setIsLoadingCart(true);
    setCartError('');

    // If user is not logged in, load from local storage only
    if (!currentUser) {
      const storedItems = await loadLocalCartItems();
      const storedVoucher = await loadLocalCartVoucher();
      setItems(storedItems);
      setRestaurantName(storedItems[0]?.restaurant || localRestaurantName);
      setAppliedVoucher(storedItems.length > 0 ? storedVoucher : null);
      setPromoCode(storedItems.length > 0 ? storedVoucher?.code || '' : '');
      setIsBackendCart(false);
      setIsLoadingCart(false);
      return;
    }

    try {
      const storedVoucher = await loadLocalCartVoucher();
      const cart = await getMyCart();
      const normalizedCart = normalizeCart(cart);

      if (normalizedCart.items.length > 0) {
        setItems(normalizedCart.items);
        setRestaurantName(normalizedCart.restaurantName);
        setIsBackendCart(true);
        if (!selectedVoucherParam) {
          setAppliedVoucher(storedVoucher);
          setPromoCode(storedVoucher?.code || '');
        }
      } else {
        setItems([]);
        setRestaurantName('Restaurant');
        setIsBackendCart(false);
        setAppliedVoucher(null);
        setPromoCode('');
        await clearLocalCartItems();
        await clearLocalCartVoucher();
      }
    } catch (error) {
      const storedItems = await loadLocalCartItems();
      const storedVoucher = await loadLocalCartVoucher();
      const fallbackItems = storedItems.length > 0 ? storedItems : localCartItems;

      setCartError(fallbackItems.length === 0 ? error.response?.data?.message || 'Cart API is unavailable.' : '');
      setItems(fallbackItems);
      setRestaurantName(fallbackItems[0]?.restaurant || localRestaurantName);
      setAppliedVoucher(fallbackItems.length > 0 ? storedVoucher : null);
      setPromoCode(fallbackItems.length > 0 ? storedVoucher?.code || '' : '');
      setIsBackendCart(false);
    } finally {
      setIsLoadingCart(false);
    }
  }, [currentUser, localCartItems, localRestaurantName, selectedVoucherParam]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadCart);

    return unsubscribe;
  }, [loadCart, navigation]);

  useEffect(() => {
    if (localCartItems.length > 0 && !isBackendCart) {
      setItems(localCartItems);
      setRestaurantName(localCartItems[0]?.restaurant || localRestaurantName);
    }
  }, [isBackendCart, localCartItems, localRestaurantName]);

  useEffect(() => {
    if (isBackendCart) {
      return;
    }

    if (items.length > 0) {
      saveLocalCartItems(items).catch(() => {});
      return;
    }

    clearLocalCartItems().catch(() => {});
  }, [isBackendCart, items]);

  useEffect(() => {
    if (appliedVoucher) {
      saveLocalCartVoucher(appliedVoucher).catch(() => {});
      return;
    }

    clearLocalCartVoucher().catch(() => {});
  }, [appliedVoucher]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 0 ? 1.5 : 0;
    const serviceFee = 0; // Removed to match backend
    const discount = appliedVoucher?.discountAmount || 0;
    const total = Math.max(subtotal + deliveryFee + serviceFee - discount, 0);

    return {
      subtotal,
      deliveryFee,
      serviceFee,
      discount,
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [items, appliedVoucher]);

  useEffect(() => {
    const selectedVoucher = selectedVoucherParam;

    if (!selectedVoucher) {
      return;
    }

    setAppliedVoucher(selectedVoucher);
    setPromoCode(selectedVoucher.code);
    navigation.setParams({ selectedVoucher: undefined });
  }, [navigation, selectedVoucherParam]);

  const updateQuantityDirectly = async (itemId, change) => {
    const currentItem = items.find((item) => item.id === itemId);

    if (isBackendCart && currentItem?.fromApi) {
      const nextQuantity = Math.max(currentItem.quantity + change, 0);

      try {
        const cart = await updateCartItem(currentItem.foodId, nextQuantity);
        const normalizedCart = normalizeCart(cart);

        if (normalizedCart.items.length > 0) {
          setItems(normalizedCart.items);
          setRestaurantName(normalizedCart.restaurantName);
          setIsBackendCart(true);
        } else {
          setItems([]);
          setIsBackendCart(false);
        }
      } catch (error) {
        Alert.alert(
          'Cart update failed',
          error.response?.data?.message || 'Cannot update this cart item.'
        );
      } finally {
        setUpdatingItemId(null);
      }

      setAppliedVoucher(null);
      setPromoCode('');
      return;
    }

    const nextItems = items
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(item.quantity + change, 0) }
            : item
        )
        .filter((item) => item.quantity > 0);

    setItems(nextItems);
    setAppliedVoucher(null);
    setPromoCode('');
  };

  const updateQuantity = (itemId, change) => {
    if (updatingItemId) return;
    const currentItem = items.find((item) => item.id === itemId);

    if (change < 0 && currentItem?.quantity === 1) {
      setPendingRemoveItem(currentItem);
      return;
    }

    setUpdatingItemId(itemId);
    updateQuantityDirectly(itemId, change);
  };

  const closeRemoveConfirm = () => {
    setPendingRemoveItem(null);
  };

  const confirmRemoveItem = async () => {
    const itemToRemove = pendingRemoveItem;

    setPendingRemoveItem(null);

    if (!itemToRemove) {
      return;
    }

    await updateQuantityDirectly(itemToRemove.id, -1);
  };

  const handleAddAnotherItem = () => {
    Alert.alert('Add item', 'Please add foods from the restaurant screen.');
  };

  const handleApplyPromo = async () => {
    const normalizedCode = promoCode.trim().toUpperCase();

    if (!normalizedCode) {
      Alert.alert('Promo code', 'Please enter a promo code.');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Cart is empty', 'Please add at least one item before applying a voucher.');
      return;
    }

    setIsApplyingVoucher(true);

    try {
      const result = await validateVoucher(normalizedCode, totals.subtotal);

      setAppliedVoucher({
        code: result.voucher.code,
        title: result.voucher.title,
        discountAmount: result.discountAmount,
      });
      setPromoCode(result.voucher.code);
      Alert.alert('Voucher applied', `${result.voucher.code} has been applied to your cart.`);
    } catch (error) {
      setAppliedVoucher(null);
      Alert.alert(
        'Voucher unavailable',
        error.response?.data?.message || 'This voucher cannot be applied.'
      );
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Cart is empty', 'Please add at least one item before checkout.');
      return;
    }

    navigation.navigate('Checkout', {
      cart: {
        items,
        restaurantName,
        totals,
        isBackendCart,
        voucherCode: appliedVoucher?.code || '',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Text style={styles.headerIcon}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.brand}>Epicurean</Text>
          <View style={styles.bagIcon}>
            <View style={styles.bagHandle} />
            <View style={styles.bagBody} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Your Cart</Text>
          <Text style={styles.subtitle}>
            {totals.itemCount} items from {restaurantName}
          </Text>

          {isLoadingCart && (
            <View style={styles.apiNotice}>
              <ActivityIndicator size="small" color={RED} />
              <Text style={styles.apiNoticeText}>Loading your cart...</Text>
            </View>
          )}

          {!isLoadingCart && cartError ? (
            <Text style={styles.apiErrorText}>{cartError}</Text>
          ) : null}

          {!isLoadingCart && items.length === 0 ? (
            <View style={styles.emptyCartBox}>
              <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
              <Text style={styles.emptyCartText}>
                Items added from restaurants will appear here.
              </Text>
            </View>
          ) : null}

          {items.length > 0 && (
            <View style={styles.itemsList}>
            {items.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemDescription} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <View style={styles.itemBottom}>
                    <Text style={styles.itemPrice}>{formatMoney(item.price)}</Text>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={[styles.stepperButton, updatingItemId === item.id && { opacity: 0.5 }]}
                        onPress={() => updateQuantity(item.id, -1)}
                        disabled={updatingItemId === item.id}
                      >
                        <Text style={styles.stepperText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantity}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={[styles.stepperButton, updatingItemId === item.id && { opacity: 0.5 }]}
                        onPress={() => updateQuantity(item.id, 1)}
                        disabled={updatingItemId === item.id}
                      >
                        <Text style={styles.stepperText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
            </View>
          )}

          <TouchableOpacity style={styles.addItemButton} onPress={handleAddAnotherItem}>
            <Text style={styles.addItemText}>+ Add another item</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <View style={styles.promoHeader}>
              <Text style={styles.sectionLabel}>PROMOTIONS</Text>
              <TouchableOpacity
                disabled={items.length === 0}
                onPress={() =>
                  navigation.navigate('Vouchers', {
                    itemsAmount: totals.subtotal,
                    appliedVoucherCode: appliedVoucher?.code || '',
                  })
                }
              >
                <Text
                  style={[
                    styles.viewVoucherText,
                    items.length === 0 && styles.viewVoucherTextDisabled,
                  ]}
                >
                  View vouchers
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.promoRow}>
              <View style={styles.promoInputBox}>
                <Text style={styles.promoIcon}>%</Text>
                <TextInput
                  style={styles.promoInput}
                  placeholder="Add a promo code"
                  placeholderTextColor="#aa9a9a"
                  autoCapitalize="characters"
                  value={promoCode}
                  onChangeText={setPromoCode}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  (isApplyingVoucher || items.length === 0) && styles.applyButtonDisabled,
                ]}
                onPress={handleApplyPromo}
                disabled={isApplyingVoucher || items.length === 0}
              >
                {isApplyingVoucher ? (
                  <ActivityIndicator size="small" color={RED} />
                ) : (
                  <Text style={styles.applyText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
            {appliedVoucher && (
              <Text style={styles.appliedVoucherText}>
                Applied {appliedVoucher.code}: -{formatMoney(appliedVoucher.discountAmount)}
              </Text>
            )}
          </View>

          <View style={styles.receipt}>
            <Text style={styles.receiptLabel}>RECEIPT DETAILS</Text>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptText}>Subtotal</Text>
              <Text style={styles.receiptValue}>{formatMoney(totals.subtotal)}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptText}>Delivery fee</Text>
              <Text style={styles.receiptValue}>{formatMoney(totals.deliveryFee)}</Text>
            </View>
            {appliedVoucher && (
              <View style={styles.receiptRow}>
                <Text style={styles.discountText}>Voucher {appliedVoucher.code}</Text>
                <Text style={styles.discountText}>-{formatMoney(totals.discount)}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.receiptRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatMoney(totals.total)}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.checkoutBar}>
          <TouchableOpacity
            style={[styles.checkoutButton, items.length === 0 && styles.checkoutButtonDisabled]}
            onPress={handleCheckout}
            disabled={items.length === 0}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            <Text style={styles.checkoutTotal}>{formatMoney(totals.total)} -&gt;</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="fade"
          transparent
          visible={Boolean(pendingRemoveItem)}
          onRequestClose={closeRemoveConfirm}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.removeConfirmBox}>
              <Text style={styles.removeConfirmTitleLabel}>
                Do you want remove this item?
              </Text>
              <Text style={styles.removeConfirmTitle}>
                Do you want remove this item?
              </Text>
              <Text style={styles.hiddenText}>
                Do you want remove this item?
              </Text>
              <Text style={styles.removeConfirmItem} numberOfLines={1}>
                {pendingRemoveItem?.name}
              </Text>
              <View style={styles.removeConfirmActions}>
                <TouchableOpacity
                  style={[styles.removeConfirmButton, styles.removeConfirmNoButton]}
                  onPress={closeRemoveConfirm}
                >
                  <Text style={styles.removeConfirmNoLabel}>No</Text>
                  <Text style={styles.removeConfirmNoText}>No</Text>
                  <Text style={styles.removeConfirmNoText}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.removeConfirmButton, styles.removeConfirmYesButton]}
                  onPress={confirmRemoveItem}
                >
                  <Text style={styles.removeConfirmYesLabel}>Yes</Text>
                  <Text style={styles.removeConfirmYesText}>Yes</Text>
                  <Text style={styles.removeConfirmYesText}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingHorizontal: 24,
  },
  headerButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
  },
  headerIcon: {
    color: '#4d3333',
    fontSize: 26,
    lineHeight: 28,
  },
  brand: {
    color: RED,
    fontSize: 20,
    fontWeight: '800',
  },
  bagIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagHandle: {
    width: 10,
    height: 7,
    borderWidth: 2,
    borderColor: RED,
    borderBottomWidth: 0,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    marginBottom: -2,
  },
  bagBody: {
    width: 14,
    height: 16,
    borderRadius: 3,
    backgroundColor: RED,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 132,
  },
  title: {
    color: '#050505',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 16,
  },
  subtitle: {
    color: '#4d3333',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 28,
  },
  apiNotice: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: -14,
    marginBottom: 16,
  },
  apiNoticeText: {
    color: MUTED,
    fontSize: 12,
  },
  apiErrorText: {
    color: RED,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -14,
    marginBottom: 16,
  },
  emptyCartBox: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f3e7e6',
    paddingHorizontal: 22,
    marginBottom: 20,
  },
  emptyCartTitle: {
    color: '#120909',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptyCartText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  itemsList: {
    gap: 14,
  },
  cartItem: {
    minHeight: 108,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    shadowColor: '#4f1111',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  itemImage: {
    width: 74,
    height: 74,
    borderRadius: 7,
    backgroundColor: '#eee',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
  },
  itemName: {
    color: '#060606',
    fontSize: 16,
    fontWeight: '800',
  },
  itemDescription: {
    color: MUTED,
    fontSize: 12,
    marginTop: 5,
  },
  itemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 10,
  },
  itemPrice: {
    color: RED,
    fontSize: 18,
    fontWeight: '900',
  },
  stepper: {
    width: 92,
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    backgroundColor: '#fff6f4',
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 8,
  },
  stepperButton: {
    width: 24,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    color: RED,
    fontSize: 17,
  },
  quantity: {
    color: '#160808',
    fontSize: 15,
    fontWeight: '800',
  },
  addItemButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#f0c1bd',
    marginTop: 20,
    marginBottom: 36,
  },
  addItemText: {
    color: RED,
    fontSize: 16,
    fontWeight: '800',
  },
  section: {
    marginBottom: 38,
  },
  sectionLabel: {
    color: '#4e1a1e',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  viewVoucherText: {
    color: RED,
    fontSize: 11,
    fontWeight: '900',
  },
  viewVoucherTextDisabled: {
    color: '#bfa6a6',
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promoInputBox: {
    flex: 1,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#efd7d4',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  promoIcon: {
    color: RED,
    fontSize: 15,
    fontWeight: '900',
    marginRight: 9,
  },
  promoInput: {
    flex: 1,
    color: '#1b1010',
    fontSize: 14,
  },
  applyButton: {
    width: 82,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#fde5e2',
  },
  applyButtonDisabled: {
    opacity: 0.72,
  },
  applyText: {
    color: '#210c0c',
    fontSize: 15,
    fontWeight: '800',
  },
  appliedVoucherText: {
    color: RED,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 9,
  },
  receipt: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3e7e6',
  },
  receiptLabel: {
    color: '#4e1a1e',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 16,
  },
  receiptRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiptText: {
    color: '#301b1b',
    fontSize: 14,
  },
  receiptValue: {
    color: '#301b1b',
    fontSize: 14,
    fontWeight: '700',
  },
  discountText: {
    color: RED,
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1dfdd',
    marginVertical: 12,
  },
  totalLabel: {
    color: '#0d0808',
    fontSize: 16,
    fontWeight: '900',
  },
  totalValue: {
    color: RED,
    fontSize: 16,
    fontWeight: '900',
  },
  checkoutBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 22,
    backgroundColor: 'rgba(255, 247, 246, 0.96)',
    borderTopWidth: 1,
    borderTopColor: '#f7e9e8',
  },
  checkoutButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 9,
    backgroundColor: DARK_RED,
    paddingHorizontal: 20,
    shadowColor: DARK_RED,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
  },
  checkoutButtonDisabled: {
    opacity: 0.55,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  checkoutTotal: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 8, 8, 0.34)',
    paddingHorizontal: 26,
  },
  removeConfirmBox: {
    width: '100%',
    maxWidth: 360,
    minHeight: 138,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0d5d2',
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: '#4f1111',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  removeConfirmTitle: {
    display: 'none',
  },
  removeConfirmTitleLabel: {
    color: '#120909',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
    textAlign: 'center',
  },
  removeConfirmItem: {
    color: MUTED,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  removeConfirmActions: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  removeConfirmButton: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  removeConfirmNoButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
  },
  removeConfirmYesButton: {
    backgroundColor: DARK_RED,
  },
  removeConfirmNoText: {
    display: 'none',
  },
  removeConfirmNoLabel: {
    color: '#201010',
    fontSize: 15,
    fontWeight: '900',
  },
  removeConfirmYesText: {
    display: 'none',
  },
  removeConfirmYesLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  hiddenText: {
    display: 'none',
  },
});
