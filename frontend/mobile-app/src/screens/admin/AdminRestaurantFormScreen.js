import React, { useContext, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
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

const CATEGORIES = ['Fast Food', 'Japanese', 'Italian', 'Bakery', 'Healthy', 'Cafe'];

export default function AdminRestaurantFormScreen({ navigation, route }) {
  const { currentUser, logout } = useContext(AuthContext);
  const { restaurants, users, createRestaurant, updateRestaurant } =
    useContext(AdminContext);

  const currentRestaurant = useMemo(
    () => restaurants.find((item) => item.id === route.params?.restaurantId),
    [restaurants, route.params?.restaurantId]
  );

  const owners = users.filter((user) => user.role === 'restaurant_owner');

  const [name, setName] = useState(currentRestaurant?.name || '');
  const [address, setAddress] = useState(currentRestaurant?.address || '');
  const [image, setImage] = useState(currentRestaurant?.image || '');
  const [category, setCategory] = useState(currentRestaurant?.category || CATEGORIES[0]);
  const [ownerId, setOwnerId] = useState(
    currentRestaurant?.ownerId || owners[0]?.id || ''
  );
  const [rating, setRating] = useState(
    currentRestaurant?.rating ? String(currentRestaurant.rating) : '4.5'
  );
  const [deliveryTime, setDeliveryTime] = useState(
    currentRestaurant?.deliveryTime || '20-30 min'
  );
  const [status, setStatus] = useState(currentRestaurant?.status || 'active');

  const avatarLabel = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'AD';

  const previewImage =
    image ||
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80';

  const handleLogout = () => {
    Alert.alert('Logout', 'Do you want to logout from admin portal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim() || !address.trim()) {
      Alert.alert('Missing data', 'Please enter restaurant name and address.');
      return;
    }

    const payload = {
      ownerId,
      name: name.trim(),
      address: address.trim(),
      category,
      image: image.trim() || previewImage,
      rating: Number.parseFloat(rating) || 0,
      deliveryTime: deliveryTime.trim() || '20-30 min',
      status,
    };

    try {
      if (currentRestaurant) {
        await updateRestaurant(currentRestaurant.id, payload);
        Alert.alert('Saved', 'Restaurant updated successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      await createRestaurant(payload);
      Alert.alert('Created', 'Restaurant added successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (requestError) {
      Alert.alert(
        'Save Failed',
        requestError.response?.data?.message ||
          'Could not save this restaurant.'
      );
    }
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
            onBackPress={() => navigation.goBack()}
          />

          <Text style={styles.screenTitle}>
            {currentRestaurant ? 'Edit Restaurant' : 'Add Restaurant'}
          </Text>
          <Text style={styles.screenSubtitle}>
            Manage your establishment details and operational status.
          </Text>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Restaurant Cover Photo</Text>
            <Image source={{ uri: previewImage }} style={styles.previewImage} />

            <Text style={styles.inputLabel}>Image URL</Text>
            <TextInput
              value={image}
              onChangeText={setImage}
              placeholder="Paste image URL"
              placeholderTextColor="#9a9aa5"
              style={styles.input}
              autoCapitalize="none"
            />

            <View style={styles.toggleCard}>
              <View>
                <Text style={styles.toggleTitle}>Restaurant Status</Text>
                <Text style={styles.toggleValue}>
                  {status === 'active' ? 'Live' : 'Inactive'}
                </Text>
              </View>

              <Switch
                value={status === 'active'}
                onValueChange={(enabled) => setStatus(enabled ? 'active' : 'inactive')}
                trackColor={{ false: '#e3dde0', true: '#d98b95' }}
                thumbColor={status === 'active' ? RED : '#ffffff'}
              />
            </View>

            <Text style={styles.inputLabel}>Restaurant Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter restaurant name"
              placeholderTextColor="#9a9aa5"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.optionGroup}>
              {CATEGORIES.map((item) => {
                const isSelected = item === category;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.optionPill, isSelected && styles.optionPillActive]}
                    onPress={() => setCategory(item)}
                  >
                    <Text
                      style={[styles.optionText, isSelected && styles.optionTextActive]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Owner</Text>
            <View style={styles.optionGroup}>
              {owners.map((owner) => {
                const isSelected = owner.id === ownerId;
                return (
                  <TouchableOpacity
                    key={owner.id}
                    style={[styles.optionPill, isSelected && styles.optionPillActive]}
                    onPress={() => setOwnerId(owner.id)}
                  >
                    <Text
                      style={[styles.optionText, isSelected && styles.optionTextActive]}
                    >
                      {owner.fullName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.inlineFields}>
              <View style={styles.inlineField}>
                <Text style={styles.inputLabel}>Rating</Text>
                <TextInput
                  value={rating}
                  onChangeText={setRating}
                  placeholder="4.5"
                  placeholderTextColor="#9a9aa5"
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </View>

              <View style={styles.inlineField}>
                <Text style={styles.inputLabel}>Delivery Time</Text>
                <TextInput
                  value={deliveryTime}
                  onChangeText={setDeliveryTime}
                  placeholder="20-30 min"
                  placeholderTextColor="#9a9aa5"
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Full Address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Enter full address"
              placeholderTextColor="#9a9aa5"
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {currentRestaurant ? 'Update Restaurant' : 'Create Restaurant'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <AdminBottomBar activeTab="dashboard" navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  root: { flex: 1, backgroundColor: BACKGROUND },
  scrollContent: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 132 },
  screenTitle: { color: TEXT, fontSize: 30, fontWeight: '800', marginBottom: 6 },
  screenSubtitle: { color: MUTED, fontSize: 13, lineHeight: 18, marginBottom: 18 },
  card: {
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1eee8',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  sectionLabel: { color: '#7f6e63', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  previewImage: { width: '100%', height: 180, borderRadius: 18, backgroundColor: '#eadfd8', marginBottom: 14 },
  toggleCard: {
    backgroundColor: '#f6f3ef',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTitle: { color: '#7f6e63', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 },
  toggleValue: { color: TEXT, fontSize: 16, fontWeight: '700' },
  inputLabel: { color: '#7f6e63', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 },
  input: {
    backgroundColor: '#fffdfb',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#ecd8d5',
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: TEXT,
    fontSize: 14,
    marginBottom: 14,
  },
  optionGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  optionPill: {
    backgroundColor: '#fffdfb',
    borderWidth: 1,
    borderColor: '#ecd8d5',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  optionPillActive: { backgroundColor: RED, borderColor: RED },
  optionText: { color: MUTED, fontSize: 12, fontWeight: '700' },
  optionTextActive: { color: '#fff' },
  inlineFields: { flexDirection: 'row', gap: 12 },
  inlineField: { flex: 1 },
  textArea: { minHeight: 100 },
  saveButton: {
    backgroundColor: RED,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
});
