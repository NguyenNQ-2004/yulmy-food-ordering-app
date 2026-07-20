import React, { useContext, useEffect, useMemo, useState } from 'react';
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

export default function AdminFoodFormScreen({ navigation, route }) {
  const { currentUser, confirmLogout } = useContext(AuthContext);
  const { foods, restaurants, foodCategories, addFood, updateFood } =
    useContext(AdminContext);

  const currentFood = useMemo(
    () => foods.find((food) => food.id === route.params?.foodId),
    [foods, route.params?.foodId]
  );

  const [name, setName] = useState(currentFood?.name || '');
  const [price, setPrice] = useState(currentFood?.price || '');
  const [description, setDescription] = useState(currentFood?.description || '');
  const [image, setImage] = useState(currentFood?.image || '');
  const [category, setCategory] = useState(
    currentFood?.category || foodCategories[0]
  );
  const [restaurantId, setRestaurantId] = useState(
    currentFood?.restaurantId || restaurants[0]?.id || ''
  );
  const [status, setStatus] = useState(currentFood?.status || 'live');
  const [rating, setRating] = useState(
    currentFood?.rating ? String(currentFood.rating) : '4.8'
  );
  const [saving, setSaving] = useState(false);

  const avatarLabel = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'AD';

  const selectedRestaurant = restaurants.find(
    (restaurant) => restaurant.id === restaurantId
  );

  const previewImage =
    image ||
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80';

  const screenTitle = currentFood ? 'Edit Food' : 'Add Food';

  useEffect(() => {
    if (!restaurantId && restaurants.length > 0) {
      setRestaurantId(currentFood?.restaurantId || restaurants[0].id);
    }
  }, [currentFood?.restaurantId, restaurantId, restaurants]);

  useEffect(() => {
    if (!category && foodCategories.length > 0) {
      setCategory(currentFood?.category || foodCategories[0]);
    }
  }, [category, currentFood?.category, foodCategories]);

  const handleLogout = () => {
    confirmLogout('Do you want to logout from admin portal?');
  };

  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a food name.');
      return;
    }

    if (!price.trim() || Number.isNaN(Number(price))) {
      Alert.alert('Invalid price', 'Please enter a valid price.');
      return;
    }

    if (!restaurantId) {
      Alert.alert('Missing restaurant', 'Please select a restaurant.');
      return;
    }

    const payload = {
      name: name.trim(),
      restaurantId,
      category,
      price: price.trim(),
      rating: Number.parseFloat(rating) || 4.8,
      status,
      description: description.trim(),
      image: image.trim() || previewImage,
    };

    try {
      setSaving(true);

      if (currentFood) {
        await updateFood(currentFood.id, payload);
        navigation.navigate('AdminFoods', {
          noticeTitle: 'Saved',
          noticeMessage: 'Food item updated successfully.',
          noticeType: 'success',
          noticeAt: Date.now(),
        });
        return;
      }

      await addFood(payload);
      navigation.navigate('AdminFoods', {
        noticeTitle: 'Created',
        noticeMessage: 'New food item has been added.',
        noticeType: 'success',
        noticeAt: Date.now(),
      });
    } catch (requestError) {
      Alert.alert(
        'Save Failed',
        requestError.response?.data?.message || 'Could not save this food.'
      );
    } finally {
      setSaving(false);
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

          <Text style={styles.screenTitle}>{screenTitle}</Text>
          <Text style={styles.screenSubtitle}>
            Configure food details, visibility, and menu presentation.
          </Text>

          {restaurants.length === 0 ? (
            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>No restaurants available</Text>
              <Text style={styles.warningText}>
                Create a restaurant first, then return here to create food.
              </Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Food Cover Photo</Text>
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
                <Text style={styles.toggleTitle}>Food Status</Text>
                <Text style={styles.toggleValue}>
                  {status === 'live' ? 'Live' : 'Inactive'}
                </Text>
              </View>

              <Switch
                value={status === 'live'}
                onValueChange={(enabled) => setStatus(enabled ? 'live' : 'inactive')}
                trackColor={{ false: '#e3dde0', true: '#d98b95' }}
                thumbColor={status === 'live' ? RED : '#ffffff'}
              />
            </View>

            <Text style={styles.inputLabel}>Food Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter food name"
              placeholderTextColor="#9a9aa5"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Restaurant</Text>
            <View style={styles.optionGroup}>
              {restaurants.map((restaurant) => {
                const isSelected = restaurant.id === restaurantId;

                return (
                  <TouchableOpacity
                    key={restaurant.id}
                    style={[
                      styles.optionPill,
                      isSelected && styles.optionPillActive,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setRestaurantId(restaurant.id)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextActive,
                      ]}
                    >
                      {restaurant.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.optionGroup}>
              {foodCategories.map((item) => {
                const isSelected = item === category;

                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.optionPill,
                      isSelected && styles.optionPillActive,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setCategory(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.inlineFields}>
              <View style={styles.inlineField}>
                <Text style={styles.inputLabel}>Price</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor="#9a9aa5"
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </View>

              <View style={styles.inlineField}>
                <Text style={styles.inputLabel}>Rating</Text>
                <TextInput
                  value={rating}
                  onChangeText={setRating}
                  placeholder="4.8"
                  placeholderTextColor="#9a9aa5"
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Restaurant Address</Text>
            <View style={styles.readonlyBox}>
              <Text style={styles.readonlyText}>
                {selectedRestaurant?.address || 'No restaurant selected'}
              </Text>
            </View>

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Write a short menu description"
              placeholderTextColor="#9a9aa5"
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (saving || restaurants.length === 0) && styles.saveButtonDisabled,
            ]}
            activeOpacity={0.9}
            disabled={saving || restaurants.length === 0}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>
              {saving
                ? 'Saving...'
                : currentFood
                  ? 'Update Food'
                  : 'Create Food'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <AdminBottomBar activeTab="foods" navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  root: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 132,
  },
  screenTitle: {
    color: TEXT,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
  },
  screenSubtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 18,
  },
  warningCard: {
    backgroundColor: '#fff3e8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f2d0b4',
    padding: 14,
    marginBottom: 16,
  },
  warningTitle: {
    color: '#8d4c0d',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  warningText: {
    color: '#9a6a3a',
    fontSize: 12,
    lineHeight: 18,
  },
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
  sectionLabel: {
    color: '#7f6e63',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 18,
    backgroundColor: '#eadfd8',
    marginBottom: 14,
  },
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
  toggleTitle: {
    color: '#7f6e63',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  toggleValue: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
  },
  inputLabel: {
    color: '#7f6e63',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
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
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  optionPill: {
    backgroundColor: '#fffdfb',
    borderWidth: 1,
    borderColor: '#ecd8d5',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  optionPillActive: {
    backgroundColor: RED,
    borderColor: RED,
  },
  optionText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
  },
  optionTextActive: {
    color: '#fff',
  },
  inlineFields: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineField: {
    flex: 1,
  },
  readonlyBox: {
    borderRadius: 13,
    backgroundColor: '#f7f3ee',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
  },
  readonlyText: {
    color: '#555762',
    fontSize: 13,
  },
  textArea: {
    minHeight: 110,
  },
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
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
