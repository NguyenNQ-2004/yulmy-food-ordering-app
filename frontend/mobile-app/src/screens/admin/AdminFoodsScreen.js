import React, { useContext, useMemo, useState } from 'react';
import {
  Alert,
  Image,
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
const RED_SOFT = '#fbe8eb';
const BACKGROUND = '#f7f5f2';
const CARD = '#ffffff';
const TEXT = '#151515';
const MUTED = '#7b7b86';

const FILTERS = ['all', 'live', 'inactive'];

export default function AdminFoodsScreen({ navigation }) {
  const { currentUser, confirmLogout } = useContext(AuthContext);
  const { foods, deleteFood, error, loading } = useContext(AdminContext);
  const [keyword, setKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const avatarLabel = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : 'AD';

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesFilter =
        activeFilter === 'all' ? true : food.status === activeFilter;

      const searchText = keyword.trim().toLowerCase();
      const matchesSearch = !searchText
        ? true
        : [
            food.name,
            food.restaurantName,
            food.restaurantAddress,
            food.category,
          ]
            .join(' ')
            .toLowerCase()
            .includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, foods, keyword]);

  const handleLogout = () => {
    confirmLogout('Do you want to logout from admin portal?');
  };

  const handleDelete = (foodId, foodName) => {
    Alert.alert('Delete Food', `Delete "${foodName}" from the list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFood(foodId);
          } catch (requestError) {
            Alert.alert(
              'Delete Failed',
              requestError.response?.data?.message || 'Could not delete this food.'
            );
          }
        },
      },
    ]);
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
            onBackPress={() => navigation.navigate('AdminDashboard')}
          />

          <Text style={styles.screenTitle}>Food Management</Text>
          <Text style={styles.screenSubtitle}>
            Search, filter, edit, and control live menu items.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.searchBox}>
            <Text style={styles.searchPrefix}>Q</Text>
            <TextInput
              value={keyword}
              onChangeText={setKeyword}
              placeholder="Search foods or restaurants..."
              placeholderTextColor="#9a9aa5"
              style={styles.searchInput}
            />
          </View>

          <View style={styles.filterRow}>
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              const label =
                filter === 'all'
                  ? 'All'
                  : filter === 'live'
                    ? 'Active'
                    : 'Inactive';

              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  activeOpacity={0.85}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text
                    style={[styles.filterText, isActive && styles.filterTextActive]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {loading.foods && foods.length === 0 ? (
            <Text style={styles.helperText}>Loading foods...</Text>
          ) : null}

          {filteredFoods.map((food) => (
            <View key={food.id} style={styles.foodCard}>
              <Image source={{ uri: food.image }} style={styles.foodImage} />

              <View style={styles.foodBody}>
                <View style={styles.foodTopRow}>
                  <Text style={styles.foodName} numberOfLines={1}>
                    {food.name}
                  </Text>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation.navigate('AdminFoodForm', { foodId: food.id })
                      }
                    >
                      <Text style={styles.actionEdit}>ED</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      activeOpacity={0.85}
                      onPress={() => handleDelete(food.id, food.name)}
                    >
                      <Text style={styles.actionDelete}>DEL</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.foodRestaurant}>{food.restaurantName}</Text>
                <Text style={styles.foodAddress} numberOfLines={1}>
                  {food.restaurantAddress}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaPill}>
                    <Text style={styles.metaPillText}>{food.category}</Text>
                  </View>

                  <Text style={styles.ratingText}>* {food.rating.toFixed(1)}</Text>
                  <Text style={styles.priceText}>${food.price}</Text>

                  <View
                    style={[
                      styles.statusPill,
                      food.status === 'live'
                        ? styles.statusPillLive
                        : styles.statusPillInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        food.status === 'live'
                          ? styles.statusTextLive
                          : styles.statusTextInactive,
                      ]}
                    >
                      {food.status === 'live' ? 'LIVE' : 'OFF'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {filteredFoods.length === 0 && !loading.foods ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No foods found</Text>
              <Text style={styles.emptyText}>
                Try another keyword or switch the current filter.
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AdminFoodForm')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

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
    fontSize: 29,
    fontWeight: '800',
    marginBottom: 6,
  },
  screenSubtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  errorText: {
    color: RED,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
  },
  helperText: {
    color: MUTED,
    fontSize: 13,
    marginBottom: 12,
  },
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
  searchPrefix: {
    color: RED,
    fontSize: 13,
    fontWeight: '800',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: TEXT,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  filterPill: {
    backgroundColor: CARD,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ecd8d5',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  filterPillActive: {
    backgroundColor: RED,
    borderColor: RED,
  },
  filterText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#fff',
  },
  foodCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f1eee8',
    padding: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
    marginBottom: 14,
  },
  foodImage: {
    width: 82,
    height: 82,
    borderRadius: 14,
    backgroundColor: '#eadfd8',
  },
  foodBody: {
    flex: 1,
    marginLeft: 12,
  },
  foodTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  foodName: {
    flex: 1,
    color: TEXT,
    fontSize: 17,
    fontWeight: '800',
    paddingRight: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 2,
  },
  actionEdit: {
    color: '#5f6474',
    fontSize: 10,
    fontWeight: '800',
  },
  actionDelete: {
    color: RED,
    fontSize: 10,
    fontWeight: '800',
  },
  foodRestaurant: {
    color: '#373848',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  foodAddress: {
    color: MUTED,
    fontSize: 12,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    backgroundColor: '#f6f1ec',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaPillText: {
    color: '#7f6e63',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ratingText: {
    color: RED,
    fontSize: 12,
    fontWeight: '800',
  },
  priceText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '800',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusPillLive: {
    backgroundColor: RED_SOFT,
  },
  statusPillInactive: {
    backgroundColor: '#efeff2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextLive: {
    color: RED,
  },
  statusTextInactive: {
    color: '#6d7080',
  },
  emptyCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#f1eee8',
  },
  emptyTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptyText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
  },
  addButton: {
    position: 'absolute',
    right: 18,
    bottom: 100,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: RED,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 31,
    lineHeight: 31,
    marginTop: -2,
  },
});
