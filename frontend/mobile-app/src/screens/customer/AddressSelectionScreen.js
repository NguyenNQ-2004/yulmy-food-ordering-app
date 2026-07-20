import React, { useEffect, useState } from 'react';
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
const BORDER = '#efcecb';
const MUTED = '#6f3d3d';

const ADDRESSES = [
  {
    id: 'home',
    label: 'Home',
    receiverName: 'Nguyen Customer',
    phone: '0988888888',
    line1: '123 Culinary Lane, Apt 4B',
    line2: 'New York, NY 10001',
    note: 'Leave at the front desk.',
    isDefault: true,
  },
  {
    id: 'office',
    label: 'Office',
    receiverName: 'Nguyen Customer',
    phone: '0988888888',
    line1: '880 Innovation Drive, Floor 12',
    line2: 'New York, NY 10011',
    note: '',
    isDefault: false,
  },
];

const CHECKOUT_ADDRESS_STORAGE_KEY = 'checkout_delivery_address';
const CUSTOMER_ADDRESSES_STORAGE_KEY = 'customer_delivery_addresses';

const EMPTY_ADDRESS_FORM = {
  label: '',
  receiverName: '',
  phone: '',
  line1: '',
  line2: '',
  note: '',
};

export default function AddressSelectionScreen({ navigation, route }) {
  const [addresses, setAddresses] = useState(ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState(
    route?.params?.selectedAddressId || 'home'
  );
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [editingAddressId, setEditingAddressId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadAddresses = async () => {
      try {
        const savedAddresses = await AsyncStorage.getItem(CUSTOMER_ADDRESSES_STORAGE_KEY);
        const customAddresses = savedAddresses ? JSON.parse(savedAddresses) : [];

        if (isMounted) {
          setAddresses([...ADDRESSES, ...customAddresses]);
        }
      } catch (error) {
        console.warn('Cannot load delivery addresses:', error);
      }
    };

    loadAddresses();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateAddressForm = (field, value) => {
    setAddressForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const closeAddModal = () => {
    setIsAddModalVisible(false);
    setAddressForm(EMPTY_ADDRESS_FORM);
    setEditingAddressId(null);
  };

  const openEditModal = (address) => {
    setAddressForm({
      label: address.label,
      receiverName: address.receiverName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      note: address.note || '',
    });
    setEditingAddressId(address.id);
    setIsAddModalVisible(true);
  };

  const handleSelectAddress = async (address) => {
    setSelectedAddressId(address.id);

    try {
      await AsyncStorage.setItem(CHECKOUT_ADDRESS_STORAGE_KEY, JSON.stringify(address));
    } catch (error) {
      console.warn('Cannot save checkout address:', error);
    }

    navigation.navigate(
      'Checkout',
      {
        selectedAddress: address,
        selectedPaymentMethod: route?.params?.selectedPaymentMethod,
        cart: route?.params?.cart,
      },
      { merge: true }
    );
  };

  const handleSaveAddress = async () => {
    const label = addressForm.label.trim() || 'New Address';
    const receiverName = addressForm.receiverName.trim() || 'Nguyen Customer';
    const phone = addressForm.phone.trim() || '0988888888';
    const line1 = addressForm.line1.trim();
    const line2 = addressForm.line2.trim();

    if (!line1 || !line2) {
      return;
    }

    const newAddress = {
      id: editingAddressId || `address-${Date.now()}`,
      label,
      receiverName,
      phone,
      line1,
      line2,
      note: addressForm.note.trim(),
      isDefault: false,
    };

    let nextAddresses = [];
    let customAddresses = [];

    if (editingAddressId) {
      nextAddresses = addresses.map(addr => addr.id === editingAddressId ? newAddress : addr);
      customAddresses = nextAddresses.filter((address) => address.id.startsWith('address-'));
    } else {
      customAddresses = [...addresses.filter((address) => address.id.startsWith('address-')), newAddress];
      nextAddresses = [...ADDRESSES, ...customAddresses];
    }

    setAddresses(nextAddresses);
    closeAddModal();

    try {
      await AsyncStorage.setItem(
        CUSTOMER_ADDRESSES_STORAGE_KEY,
        JSON.stringify(customAddresses)
      );
    } catch (error) {
      console.warn('Cannot save delivery address:', error);
    }

    handleSelectAddress(newAddress);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>{'<'}</Text>
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
          <Text style={styles.title}>Select Delivery Address</Text>
          <Text style={styles.subtitle}>
            Choose an existing address or add a new one for your Epicurean delivery.
          </Text>

          <View style={styles.mapPreview}>
            <View style={styles.phoneFrame}>
              <View style={styles.phoneTopBar} />
              <Text style={styles.phoneTitle}>Select Address</Text>
              <View style={styles.mapCanvas}>
                <View style={[styles.mapLine, styles.mapLineOne]} />
                <View style={[styles.mapLine, styles.mapLineTwo]} />
                <View style={[styles.mapLine, styles.mapLineThree]} />
                <View style={styles.routeLine} />
                <View style={styles.mapPin}>
                  <View style={styles.mapPinDot} />
                </View>
              </View>
              <View style={styles.phoneAddress}>
                <Text style={styles.phoneAddressName}>123 Main St, New York, NY 10001</Text>
                <Text style={styles.phoneAddressMeta}>4.2 km away</Text>
              </View>
              <View style={styles.confirmMiniButton}>
                <Text style={styles.confirmMiniText}>CONFIRM LOCATION</Text>
              </View>
            </View>
          </View>

          <View style={styles.addressList}>
            {addresses.map((address) => {
              const isSelected = selectedAddressId === address.id;

              return (
                <TouchableOpacity
                  key={address.id}
                  activeOpacity={0.85}
                  style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                  onPress={() => handleSelectAddress(address)}
                >
                  <View style={styles.radioWrap}>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </View>

                  <View style={styles.addressContent}>
                    <View style={styles.addressHeader}>
                      <Text style={styles.addressLabel}>{address.label}</Text>
                      {address.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressLine}>{address.line1}</Text>
                    <Text style={styles.addressLine}>{address.line2}</Text>
                    {address.note ? (
                      <Text style={styles.noteText}>Note: {address.note}</Text>
                    ) : null}
                  </View>

                  <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(address)}>
                    <Text style={styles.editIcon}>✎</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalVisible(true)}>
            <Text style={styles.addPlus}>+</Text>
            <Text style={styles.addText}>Add New Address</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="fade"
          transparent
          visible={isAddModalVisible}
          onRequestClose={closeAddModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addressModal}>
              <Text style={styles.modalTitle}>{editingAddressId ? 'Edit Address' : 'Add New Address'}</Text>
              <TextInput
                style={styles.modalInput}
                value={addressForm.label}
                onChangeText={(value) => updateAddressForm('label', value)}
                placeholder="Label, e.g. Home"
                placeholderTextColor="#b79f9d"
              />
              <TextInput
                style={styles.modalInput}
                value={addressForm.receiverName}
                onChangeText={(value) => updateAddressForm('receiverName', value)}
                placeholder="Receiver name"
                placeholderTextColor="#b79f9d"
              />
              <TextInput
                style={styles.modalInput}
                value={addressForm.phone}
                onChangeText={(value) => updateAddressForm('phone', value)}
                placeholder="Phone number"
                placeholderTextColor="#b79f9d"
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.modalInput}
                value={addressForm.line1}
                onChangeText={(value) => updateAddressForm('line1', value)}
                placeholder="Street, apartment"
                placeholderTextColor="#b79f9d"
              />
              <TextInput
                style={styles.modalInput}
                value={addressForm.line2}
                onChangeText={(value) => updateAddressForm('line2', value)}
                placeholder="City, state, zip"
                placeholderTextColor="#b79f9d"
              />
              <TextInput
                style={[styles.modalInput, styles.modalNoteInput]}
                value={addressForm.note}
                onChangeText={(value) => updateAddressForm('note', value)}
                placeholder="Delivery note"
                placeholderTextColor="#b79f9d"
                multiline
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeAddModal}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
                  <Text style={styles.saveText}>Save Address</Text>
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
  backIcon: {
    color: '#4b3030',
    fontSize: 26,
    lineHeight: 28,
  },
  brand: {
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 118,
  },
  title: {
    color: '#090606',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    width: '90%',
    marginBottom: 28,
  },
  mapPreview: {
    height: 154,
    borderRadius: 6,
    backgroundColor: '#f7fbf7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  phoneFrame: {
    width: 78,
    height: 142,
    borderRadius: 10,
    backgroundColor: '#101010',
    padding: 4,
    alignItems: 'center',
  },
  phoneTopBar: {
    width: 26,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#222',
    marginTop: 2,
    marginBottom: 3,
  },
  phoneTitle: {
    color: '#222',
    fontSize: 5,
    fontWeight: '800',
    alignSelf: 'stretch',
    textAlign: 'center',
    backgroundColor: '#fff',
    paddingVertical: 2,
  },
  mapCanvas: {
    width: 68,
    height: 70,
    backgroundColor: '#e9ecec',
    overflow: 'hidden',
    position: 'relative',
  },
  mapLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#cfd4d4',
  },
  mapLineOne: {
    width: 100,
    top: 20,
    left: -18,
    transform: [{ rotate: '-24deg' }],
  },
  mapLineTwo: {
    width: 92,
    top: 40,
    left: -12,
    transform: [{ rotate: '21deg' }],
  },
  mapLineThree: {
    width: 94,
    top: 50,
    left: -24,
    transform: [{ rotate: '-8deg' }],
  },
  routeLine: {
    position: 'absolute',
    width: 35,
    height: 2,
    backgroundColor: '#aeb5b5',
    top: 38,
    left: 18,
    transform: [{ rotate: '-34deg' }],
  },
  mapPin: {
    position: 'absolute',
    top: 31,
    left: 38,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPinDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  phoneAddress: {
    width: 68,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 3,
  },
  phoneAddressName: {
    color: '#2b1b1b',
    fontSize: 4,
    fontWeight: '800',
  },
  phoneAddressMeta: {
    color: '#8b6d6d',
    fontSize: 4,
    marginTop: 2,
  },
  confirmMiniButton: {
    width: 62,
    height: 13,
    borderRadius: 2,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  confirmMiniText: {
    color: '#fff',
    fontSize: 4,
    fontWeight: '900',
  },
  addressList: {
    gap: 14,
  },
  addressCard: {
    minHeight: 84,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  addressCardSelected: {
    borderColor: BORDER,
  },
  radioWrap: {
    width: 22,
    paddingTop: 4,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0c2bf',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: RED,
    backgroundColor: RED,
  },
  radioDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  addressContent: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 8,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressLabel: {
    color: '#070505',
    fontSize: 16,
    fontWeight: '900',
    marginRight: 10,
  },
  defaultBadge: {
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffe6e3',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  defaultText: {
    color: RED,
    fontSize: 11,
    fontWeight: '800',
  },
  addressLine: {
    color: '#4d2d2e',
    fontSize: 12,
    lineHeight: 18,
  },
  noteText: {
    color: RED,
    fontSize: 12,
    marginTop: 8,
  },
  editButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  editIcon: {
    color: '#5b3334',
    fontSize: 20,
    fontWeight: '900',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: '#f4eeee',
  },
  addButton: {
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
  addPlus: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '500',
    marginRight: 10,
    lineHeight: 25,
  },
  addText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 10, 10, 0.34)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  addressModal: {
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
  modalNoteInput: {
    minHeight: 68,
    paddingTop: 10,
    textAlignVertical: 'top',
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
