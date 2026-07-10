import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const RED = '#B11226';
const DARK_RED = '#C71923';
const BG = '#fff7f6';
const CARD = '#fff';
const SOFT_CARD = '#fff8f7';
const BORDER = '#f0cfcc';
const MUTED = '#6d4a4a';

const PAYMENT_METHODS = [
  {
    id: 'card',
    method: 'MOCK_PAYMENT',
    title: 'Credit Card',
    brand: 'VISA',
    maskedNumber: '•••• •••• •••• 4242',
    subtitle: 'Visa, Mastercard, Amex',
    checkoutSubtitle: 'Expires 12/25',
    icon: 'card',
  },
  {
    id: 'wallet',
    method: 'MOCK_PAYMENT',
    title: 'Digital Wallet',
    brand: 'WALLET',
    maskedNumber: 'Apple Pay',
    subtitle: 'Apple Pay, Google Pay',
    checkoutSubtitle: 'Digital wallet',
    icon: 'wallet',
  },
  {
    id: 'cod',
    method: 'COD',
    title: 'Cash on Delivery',
    brand: 'COD',
    maskedNumber: 'Cash on Delivery',
    subtitle: 'Pay when you receive',
    checkoutSubtitle: 'Pay when you receive',
    icon: 'cash',
  },
];

const CHECKOUT_PAYMENT_STORAGE_KEY = 'checkout_payment_method';
const CUSTOMER_PAYMENT_METHODS_STORAGE_KEY = 'customer_payment_methods';

const DEFAULT_CARD = {
  id: 'visa-4242',
  brand: 'VISA',
  maskedNumber: '**** **** **** 4242',
  checkoutSubtitle: 'Expires 12/25',
};

const PAYMENT_OPTIONS = [
  {
    id: 'card',
    method: 'MOCK_PAYMENT',
    title: 'Credit Card',
    subtitle: 'Visa, Mastercard, Amex',
    icon: 'card',
  },
  {
    id: 'wallet',
    method: 'MOCK_PAYMENT',
    title: 'Digital Wallet',
    subtitle: 'Apple Pay, Google Pay',
    checkoutSubtitle: 'Digital wallet',
    brand: 'WALLET',
    maskedNumber: 'Apple Pay',
    icon: 'wallet',
  },
  {
    id: 'cod',
    method: 'COD',
    title: 'Cash on Delivery',
    subtitle: 'Pay when you receive',
    checkoutSubtitle: 'Pay when you receive',
    brand: 'COD',
    maskedNumber: 'Cash on Delivery',
    icon: 'cash',
  },
];

const EMPTY_CARD_FORM = {
  cardholderName: '',
  cardNumber: '',
  expiry: '',
};

function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}

function normalizeSavedCard(card) {
  if (!card || !card.id || !card.maskedNumber) {
    return null;
  }

  return {
    id: card.id,
    brand: card.brand || 'VISA',
    maskedNumber: card.maskedNumber,
    checkoutSubtitle: card.checkoutSubtitle || 'Expires --/--',
  };
}

export default function PaymentMethodScreen({ navigation, route }) {
  const routePaymentMethodId = route?.params?.selectedPaymentMethodId || 'card';
  const [selectedMethod, setSelectedMethod] = useState(
    routePaymentMethodId === 'wallet' || routePaymentMethodId === 'cod' ? routePaymentMethodId : 'card'
  );
  const [savedCards, setSavedCards] = useState([DEFAULT_CARD]);
  const [selectedCardId, setSelectedCardId] = useState(
    route?.params?.selectedCardId ||
      (routePaymentMethodId !== 'wallet' && routePaymentMethodId !== 'cod'
        ? routePaymentMethodId
        : DEFAULT_CARD.id)
  );
  const [isAddCardVisible, setIsAddCardVisible] = useState(false);
  const [cardForm, setCardForm] = useState(EMPTY_CARD_FORM);
  const totalAmount = route?.params?.cart?.totals?.total ?? 142.5;

  useEffect(() => {
    let isMounted = true;

    const loadPaymentMethods = async () => {
      try {
        const savedMethods = await AsyncStorage.getItem(CUSTOMER_PAYMENT_METHODS_STORAGE_KEY);
        const customCards = savedMethods
          ? JSON.parse(savedMethods).map(normalizeSavedCard).filter(Boolean)
          : [];

        if (!isMounted) {
          return;
        }

        const nextCards = [DEFAULT_CARD, ...customCards];
        setSavedCards(nextCards);

        if (!nextCards.some((card) => card.id === selectedCardId)) {
          setSelectedCardId(DEFAULT_CARD.id);
        }
      } catch (error) {
        console.warn('Cannot load payment methods:', error);
      }
    };

    loadPaymentMethods();

    return () => {
      isMounted = false;
    };
  }, [selectedCardId]);

  const selectedCard =
    savedCards.find((card) => card.id === selectedCardId) || DEFAULT_CARD;

  const checkoutPaymentMethod = useMemo(() => {
    if (selectedMethod === 'card') {
      return {
        id: selectedCard.id,
        method: 'MOCK_PAYMENT',
        title: 'Credit Card',
        brand: selectedCard.brand,
        maskedNumber: selectedCard.maskedNumber,
        subtitle: selectedCard.checkoutSubtitle,
      };
    }

    const fallbackMethod =
      PAYMENT_OPTIONS.find((paymentOption) => paymentOption.id === selectedMethod) ||
      PAYMENT_OPTIONS[1];

    return {
      id: fallbackMethod.id,
      method: fallbackMethod.method,
      title: fallbackMethod.title,
      brand: fallbackMethod.brand,
      maskedNumber: fallbackMethod.maskedNumber,
      subtitle: fallbackMethod.checkoutSubtitle,
    };
  }, [selectedCard, selectedMethod]);

  const updateCardForm = (field, value) => {
    setCardForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const closeAddCard = () => {
    setIsAddCardVisible(false);
    setCardForm(EMPTY_CARD_FORM);
  };

  const handleSaveCard = async () => {
    const cardholderName = cardForm.cardholderName.trim();
    const cardNumber = cardForm.cardNumber.replace(/\D/g, '');
    const expiry = cardForm.expiry.trim();
    const last4 = cardNumber.slice(-4);

    if (!cardholderName || cardNumber.length < 12 || !expiry) {
      return;
    }

    const newCard = {
      id: `visa-${Date.now()}`,
      brand: 'VISA',
      maskedNumber: `**** **** **** ${last4}`,
      checkoutSubtitle: `Expires ${expiry}`,
    };
    const customCards = [
      ...savedCards.filter((card) => card.id !== DEFAULT_CARD.id),
      newCard,
    ];

    setSavedCards([DEFAULT_CARD, ...customCards]);
    setSelectedMethod('card');
    setSelectedCardId(newCard.id);
    closeAddCard();

    try {
      await AsyncStorage.setItem(
        CUSTOMER_PAYMENT_METHODS_STORAGE_KEY,
        JSON.stringify(customCards)
      );
    } catch (error) {
      console.warn('Cannot save payment method:', error);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      await AsyncStorage.setItem(
        CHECKOUT_PAYMENT_STORAGE_KEY,
        JSON.stringify(checkoutPaymentMethod)
      );
    } catch (error) {
      console.warn('Cannot save checkout payment method:', error);
    }

    navigation.navigate(
      'Checkout',
      {
        selectedAddress: route?.params?.selectedAddress,
        selectedPaymentMethod: checkoutPaymentMethod,
        cart: route?.params?.cart,
      },
      { merge: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.brand}>Epicurean</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Payment Method</Text>
          <Text style={styles.subtitle}>
            Choose how you'd like to securely complete your transaction.
          </Text>

          <View style={styles.totalCard}>
            <View>
              <Text style={styles.totalLabel}>Total Amount</Text>
            </View>
            <View style={styles.totalRight}>
              <Text style={styles.totalAmount}>{formatMoney(totalAmount)}</Text>
              <Text style={styles.totalMeta}>Includes taxes and fees</Text>
            </View>
          </View>

          <View style={styles.methods}>
            {PAYMENT_OPTIONS.map((method) => {
              const isSelected = selectedMethod === method.id;

              return (
                <View key={method.id}>
                  <TouchableOpacity
                    activeOpacity={0.86}
                    style={[styles.methodCard, isSelected && styles.methodCardSelected]}
                    onPress={() => setSelectedMethod(method.id)}
                  >
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>

                    <View style={styles.methodTextBox}>
                      <Text style={styles.methodTitle}>{method.title}</Text>
                      <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                    </View>

                    <View style={styles.methodIconBox}>
                      {method.icon === 'card' && <CardIcon />}
                      {method.icon === 'wallet' && <WalletIcon />}
                      {method.icon === 'cash' && <CashIcon />}
                    </View>
                  </TouchableOpacity>

                  {method.id === 'card' && isSelected && (
                    <View style={styles.savedCardBlock}>
                      {savedCards.map((card) => {
                        const isSelectedCard = selectedCardId === card.id;

                        return (
                          <TouchableOpacity
                            key={card.id}
                            style={[
                              styles.savedCard,
                              isSelectedCard && styles.savedCardSelected,
                            ]}
                            onPress={() => setSelectedCardId(card.id)}
                          >
                            <View style={styles.visaMini}>
                              <Text style={styles.visaMiniText}>{card.brand}</Text>
                            </View>
                            <View style={styles.savedCardInfo}>
                              <Text style={styles.savedCardNumber}>{card.maskedNumber}</Text>
                              <Text style={styles.savedCardMeta}>{card.checkoutSubtitle}</Text>
                            </View>
                            <View
                              style={[
                                styles.savedCheck,
                                isSelectedCard && styles.savedCheckSelected,
                              ]}
                            >
                              {isSelectedCard ? (
                                <Text style={styles.savedCheckText}>OK</Text>
                              ) : null}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                      <View style={[styles.savedCard, styles.hiddenLegacyCard]}>
                        <View style={styles.visaMini}>
                          <Text style={styles.visaMiniText}>VISA</Text>
                        </View>
                        <Text style={styles.savedCardNumber}>•••• 4242</Text>
                        <View style={styles.savedCheck}>
                          <Text style={styles.savedCheckText}>✓</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.addCardButton}
                        onPress={() => setIsAddCardVisible(true)}
                      >
                        <Text style={styles.addCardText}>+ Add New Card</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.bottomPanel}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
            <LockIcon />
            <Text style={styles.confirmText}>Confirm Payment</Text>
          </TouchableOpacity>
          <Text style={styles.secureText}>Payments are secure and encrypted</Text>
        </View>

        <Modal
          animationType="fade"
          transparent
          visible={isAddCardVisible}
          onRequestClose={closeAddCard}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.cardModal}>
              <Text style={styles.modalTitle}>Add Visa Card</Text>
              <TextInput
                style={styles.modalInput}
                value={cardForm.cardholderName}
                onChangeText={(value) => updateCardForm('cardholderName', value)}
                placeholder="Cardholder name"
                placeholderTextColor="#b79f9d"
              />
              <TextInput
                style={styles.modalInput}
                value={cardForm.cardNumber}
                onChangeText={(value) => updateCardForm('cardNumber', value)}
                placeholder="Card number"
                placeholderTextColor="#b79f9d"
                keyboardType="number-pad"
              />
              <TextInput
                style={styles.modalInput}
                value={cardForm.expiry}
                onChangeText={(value) => updateCardForm('expiry', value)}
                placeholder="Expiry, e.g. 12/28"
                placeholderTextColor="#b79f9d"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeAddCard}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveCard}>
                  <Text style={styles.saveText}>Save Card</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function CardIcon() {
  return (
    <View style={styles.cardIcon}>
      <View style={styles.cardIconLine} />
    </View>
  );
}

function WalletIcon() {
  return (
    <View style={styles.walletIcon}>
      <View style={styles.walletPocket}>
        <View style={styles.walletDot} />
      </View>
    </View>
  );
}

function CashIcon() {
  return (
    <View style={styles.cashIcon}>
      <View style={styles.cashCircle} />
    </View>
  );
}

function LockIcon() {
  return (
    <View style={styles.lockIcon}>
      <View style={styles.lockHandle} />
      <View style={styles.lockBody} />
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
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  backIcon: {
    color: RED,
    fontSize: 26,
    lineHeight: 28,
  },
  brand: {
    color: RED,
    fontSize: 20,
    fontWeight: '900',
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 140,
  },
  title: {
    color: '#050505',
    fontSize: 29,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#5d3a3a',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    alignSelf: 'center',
    width: '88%',
    marginBottom: 28,
  },
  totalCard: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD,
    borderRadius: 8,
    paddingHorizontal: 18,
    marginBottom: 28,
  },
  totalLabel: {
    color: '#120b0b',
    fontSize: 16,
    fontWeight: '900',
  },
  totalRight: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    color: RED,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 8,
  },
  totalMeta: {
    color: MUTED,
    fontSize: 11,
  },
  methods: {
    gap: 14,
  },
  methodCard: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SOFT_CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  methodCardSelected: {
    borderColor: RED,
    borderWidth: 1.5,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#f0bdb9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  radioSelected: {
    borderColor: RED,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED,
  },
  methodTextBox: {
    flex: 1,
    minWidth: 0,
  },
  methodTitle: {
    color: '#090606',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  methodSubtitle: {
    color: MUTED,
    fontSize: 12,
  },
  methodIconBox: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    width: 18,
    height: 14,
    borderWidth: 2,
    borderColor: '#513131',
    borderRadius: 2,
    justifyContent: 'center',
  },
  cardIconLine: {
    height: 2,
    backgroundColor: '#513131',
    marginHorizontal: 2,
  },
  walletIcon: {
    width: 18,
    height: 15,
    borderWidth: 2,
    borderColor: '#513131',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  walletPocket: {
    width: 10,
    height: 9,
    borderWidth: 2,
    borderColor: '#513131',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -4,
    backgroundColor: SOFT_CARD,
  },
  walletDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#513131',
  },
  cashIcon: {
    width: 20,
    height: 13,
    borderWidth: 2,
    borderColor: '#513131',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#513131',
  },
  savedCardBlock: {
    paddingLeft: 40,
    paddingRight: 14,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 10,
  },
  savedCard: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f3d6d3',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  savedCardSelected: {
    borderColor: RED,
  },
  hiddenLegacyCard: {
    display: 'none',
  },
  visaMini: {
    width: 42,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#fff0ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  visaMiniText: {
    color: '#532c2c',
    fontSize: 9,
    fontWeight: '900',
  },
  savedCardInfo: {
    flex: 1,
    minWidth: 0,
  },
  savedCardNumber: {
    color: '#150a0a',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 3,
  },
  savedCardMeta: {
    color: MUTED,
    fontSize: 11,
  },
  savedCheck: {
    minWidth: 24,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#d7b8b5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  savedCheckSelected: {
    borderColor: RED,
  },
  savedCheckText: {
    color: RED,
    fontSize: 8,
    fontWeight: '900',
    lineHeight: 10,
  },
  addCardButton: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  addCardText: {
    color: RED,
    fontSize: 11,
    fontWeight: '900',
  },
  bottomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: 'rgba(255, 247, 246, 0.97)',
  },
  confirmButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: DARK_RED,
    shadowColor: DARK_RED,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
  },
  lockIcon: {
    width: 18,
    height: 20,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 10,
  },
  lockHandle: {
    position: 'absolute',
    top: 1,
    width: 10,
    height: 10,
    borderWidth: 2,
    borderColor: '#fff',
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  lockBody: {
    width: 14,
    height: 12,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 2,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  secureText: {
    color: '#9a8787',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 10, 10, 0.34)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  cardModal: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  modalTitle: {
    color: '#080505',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
  },
  modalInput: {
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f2d8d5',
    backgroundColor: '#fffafa',
    color: '#1a0c0c',
    fontSize: 13,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: RED,
    fontSize: 13,
    fontWeight: '900',
  },
  saveButton: {
    flex: 1.25,
    height: 42,
    borderRadius: 8,
    backgroundColor: DARK_RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
});
