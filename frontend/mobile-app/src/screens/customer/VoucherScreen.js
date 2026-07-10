import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getActiveVouchers, validateVoucher } from '../../services/customerOrderApi';

const RED = '#B11226';
const DARK_RED = '#C71923';
const BG = '#fff7f6';
const CARD = '#fff';
const BORDER = '#f0d5d2';
const MUTED = '#6d3f3f';

const FILTERS = ['All Vouchers', 'Delivery', 'Discount'];

function formatMoney(value) {
  if (value >= 1000) {
    return `${Math.round(value).toLocaleString('vi-VN')} VND`;
  }

  return `$${value.toFixed(2)}`;
}

function getVoucherType(voucher) {
  if (voucher.code?.includes('SHIP')) {
    return 'delivery';
  }

  return voucher.discountType === 'percent' ? 'percent' : 'delivery';
}

function getVoucherDescription(voucher) {
  const discount =
    voucher.discountType === 'percent'
      ? `${voucher.discountValue}% off`
      : `${formatMoney(voucher.discountValue)} off`;
  const maxDiscount = voucher.maxDiscountAmount
    ? ` Cap at ${formatMoney(voucher.maxDiscountAmount)}.`
    : '';

  return `${discount}. Min spend ${formatMoney(voucher.minOrderAmount)}.${maxDiscount}`;
}

function getVoucherMeta(voucher) {
  const date = new Date(voucher.endDate);

  if (Number.isNaN(date.getTime())) {
    return 'ACTIVE VOUCHER';
  }

  return `VALID UNTIL ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).toUpperCase()}`;
}

export default function VoucherScreen({ navigation, route }) {
  const [activeFilter, setActiveFilter] = useState('All Vouchers');
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [applyingCode, setApplyingCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const itemsAmount = route?.params?.itemsAmount || 0;
  const appliedVoucherCode = route?.params?.appliedVoucherCode || '';

  const loadVouchers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const activeVouchers = await getActiveVouchers();
      setVouchers(activeVouchers);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 'Cannot load vouchers from backend.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  const filteredVouchers = useMemo(() => {
    if (activeFilter === 'Delivery') {
      return vouchers.filter((voucher) => getVoucherType(voucher) === 'delivery');
    }

    if (activeFilter === 'Discount') {
      return vouchers.filter((voucher) => getVoucherType(voucher) === 'percent');
    }

    return vouchers;
  }, [activeFilter, vouchers]);

  const handleApply = async (voucher) => {
    if (!itemsAmount) {
      Alert.alert('Voucher unavailable', 'Please open vouchers from your cart first.');
      return;
    }

    setApplyingCode(voucher.code);

    try {
      const result = await validateVoucher(voucher.code, itemsAmount);

      navigation.navigate(
        'Cart',
        {
          selectedVoucher: {
            code: result.voucher.code,
            title: result.voucher.title,
            discountAmount: result.discountAmount,
          },
        },
        { merge: true }
      );
    } catch (error) {
      Alert.alert(
        'Voucher unavailable',
        error.response?.data?.message || 'This voucher cannot be applied to the current order.'
      );
    } finally {
      setApplyingCode('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vouchers</Text>
          <View style={styles.bagIcon}>
            <View style={styles.bagHandle} />
            <View style={styles.bagBody} />
          </View>
        </View>

        <View style={styles.filterWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;

              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {isLoading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={RED} />
              <Text style={styles.loadingText}>Loading vouchers...</Text>
            </View>
          )}

          {!isLoading && errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {!isLoading && !errorMessage && filteredVouchers.length === 0 ? (
            <Text style={styles.errorText}>No vouchers available.</Text>
          ) : null}

          {filteredVouchers.map((voucher) => {
            const type = getVoucherType(voucher);
            const isApplying = applyingCode === voucher.code;
            const isApplied = appliedVoucherCode === voucher.code;

            return (
            <View
              key={voucher._id || voucher.code}
              style={[styles.voucherCard, isApplied && styles.voucherCardDisabled]}
            >
              <View style={[styles.iconBox, isApplied && styles.iconBoxDisabled]}>
                {type === 'delivery' && <DeliveryIcon disabled={isApplied} />}
                {type === 'percent' && <PercentIcon disabled={isApplied} />}
              </View>

              <Text style={[styles.voucherTitle, isApplied && styles.disabledText]}>
                {voucher.title}
              </Text>
              <Text style={[styles.voucherDescription, isApplied && styles.disabledText]}>
                {voucher.description || getVoucherDescription(voucher)}
              </Text>
              <Text style={[styles.voucherMeta, isApplied && styles.disabledText]}>
                {isApplied ? 'APPLIED' : getVoucherMeta(voucher)}
              </Text>

              <View style={styles.cardDivider} />

              <TouchableOpacity
                style={[
                  styles.applyButton,
                  (isApplying || isApplied) && styles.applyButtonDisabled,
                ]}
                onPress={() => handleApply(voucher)}
                disabled={isApplying || isApplied}
              >
                {isApplying ? (
                  <ActivityIndicator size="small" color={RED} />
                ) : (
                  <Text style={[styles.applyText, isApplied && styles.applyTextDisabled]}>
                    {isApplied ? 'Applied' : 'Apply'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function DeliveryIcon({ disabled }) {
  const color = disabled ? '#9d9d9d' : RED;

  return (
    <View style={styles.deliveryIcon}>
      <View style={[styles.truckBody, { borderColor: color }]} />
      <View style={[styles.truckCab, { borderColor: color }]} />
      <View style={[styles.truckWheelLeft, { backgroundColor: color }]} />
      <View style={[styles.truckWheelRight, { backgroundColor: color }]} />
    </View>
  );
}

function PercentIcon({ disabled }) {
  return (
    <Text style={[styles.percentIcon, disabled && styles.percentIconDisabled]}>%</Text>
  );
}

function DessertIcon({ disabled }) {
  const color = disabled ? '#9d9d9d' : RED;

  return (
    <View style={styles.dessertIcon}>
      <View style={[styles.dessertTop, { borderColor: color }]} />
      <View style={[styles.dessertBase, { borderColor: color }]} />
      <View style={[styles.dessertStem, { backgroundColor: color }]} />
    </View>
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
  backIcon: {
    color: '#4b3030',
    fontSize: 26,
    lineHeight: 28,
  },
  headerTitle: {
    color: RED,
    fontSize: 20,
    fontWeight: '900',
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
    borderColor: '#6d3c3c',
    borderBottomWidth: 0,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    marginBottom: -2,
  },
  bagBody: {
    width: 14,
    height: 16,
    borderWidth: 2,
    borderColor: '#6d3c3c',
    borderRadius: 3,
  },
  filterWrap: {
    height: 52,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f3e4e2',
    justifyContent: 'center',
  },
  filterContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    height: 32,
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
  },
  filterChipActive: {
    backgroundColor: DARK_RED,
    borderColor: DARK_RED,
  },
  filterText: {
    color: '#4b2424',
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '900',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  loadingBox: {
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: MUTED,
    fontSize: 13,
  },
  errorText: {
    color: RED,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  voucherCard: {
    minHeight: 222,
    backgroundColor: CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#eee0de',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
    shadowColor: '#5a1616',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  voucherCardDisabled: {
    opacity: 0.58,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 5,
    backgroundColor: '#fbd9d7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconBoxDisabled: {
    backgroundColor: '#e8e8e8',
  },
  voucherTitle: {
    color: '#070505',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
  },
  voucherDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 17,
    width: '94%',
  },
  voucherMeta: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 9,
  },
  disabledText: {
    color: '#8f8f8f',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f3e6e4',
    marginTop: 26,
    marginBottom: 14,
  },
  applyButton: {
    width: 74,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: RED,
    backgroundColor: '#fff',
  },
  applyButtonDisabled: {
    borderColor: '#d4d4d4',
  },
  applyText: {
    color: RED,
    fontSize: 12,
    fontWeight: '900',
  },
  applyTextDisabled: {
    color: '#9d9d9d',
  },
  deliveryIcon: {
    width: 28,
    height: 22,
    position: 'relative',
  },
  truckBody: {
    position: 'absolute',
    left: 1,
    top: 7,
    width: 16,
    height: 10,
    borderWidth: 2,
    borderRadius: 2,
  },
  truckCab: {
    position: 'absolute',
    right: 1,
    top: 10,
    width: 9,
    height: 7,
    borderWidth: 2,
    borderRadius: 2,
  },
  truckWheelLeft: {
    position: 'absolute',
    left: 5,
    bottom: 1,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  truckWheelRight: {
    position: 'absolute',
    right: 3,
    bottom: 1,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  percentIcon: {
    color: RED,
    fontSize: 28,
    fontWeight: '900',
  },
  percentIconDisabled: {
    color: '#9d9d9d',
  },
  dessertIcon: {
    width: 28,
    height: 24,
    position: 'relative',
  },
  dessertTop: {
    position: 'absolute',
    left: 8,
    top: 1,
    width: 12,
    height: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  dessertBase: {
    position: 'absolute',
    left: 4,
    bottom: 2,
    width: 20,
    height: 9,
    borderWidth: 2,
    borderRadius: 2,
  },
  dessertStem: {
    position: 'absolute',
    left: 13,
    top: 8,
    width: 2,
    height: 6,
  },
});
