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

const FILTERS = ['all', 'active', 'inactive'];

export default function AdminRestaurantsScreen({ navigation }) {
  const { currentUser, confirmLogout } = useContext(AuthContext);
  const { restaurants, deleteRestaurant, error, loading } = useContext(AdminContext);
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

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchesFilter =
        activeFilter === 'all' ? true : restaurant.status === activeFilter;

      const searchText = keyword.trim().toLowerCase();
      const matchesSearch = !searchText
        ? true
        : [
            restaurant.name,
            restaurant.address,
            restaurant.ownerName,
            restaurant.category,
          ]
            .join(' ')
            .toLowerCase()
            .includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, keyword, restaurants]);

  const handleLogout = () => {
    confirmLogout('Do you want to logout from admin portal?');
  };

  const handleDelete = (restaurantId, restaurantName) => {
    Alert.alert(
      'Delete Restaurant',
      `Delete "${restaurantName}" and its foods from the system?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRestaurant(restaurantId);
            } catch (requestError) {
              Alert.alert(
                'Delete Failed',
                requestError.response?.data?.message ||
                  'Could not delete this restaurant.'
              );
            }
          },
        },
      ]
    );
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

          <Text style={styles.screenTitle}>Restaurant Management</Text>
          <Text style={styles.screenSubtitle}>
            Manage restaurant visibility, owners, and catalog sources.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.searchBox}>
            <Text style={styles.searchPrefix}>Q</Text>
            <TextInput
              value={keyword}
              onChangeText={setKeyword}
              placeholder="Search restaurants..."
              placeholderTextColor="#9a9aa5"
              style={styles.searchInput}
            />
          </View>

          <View style={styles.filterRow}>
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              const label = filter.charAt(0).toUpperCase() + filter.slice(1);

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

          {loading.restaurants && restaurants.length === 0 ? (
            <Text style={styles.helperText}>Loading restaurants...</Text>
          ) : null}

          {filteredRestaurants.map((restaurant) => (
            <View key={restaurant.id} style={styles.card}>
              <Image source={{ uri: restaurant.image }} style={styles.cardImage} />
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {restaurant.name}
                  </Text>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        navigation.navigate('AdminRestaurantForm', {
                          restaurantId: restaurant.id,
                        })
                      }
                    >
                      <Text style={styles.actionEdit}>ED</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDelete(restaurant.id, restaurant.name)}
                    >
                      <Text style={styles.actionDelete}>DEL</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.cardAddress} numberOfLines={1}>
                  {restaurant.address}
                </Text>
                <Text style={styles.cardOwner}>Owner: {restaurant.ownerName}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaPill}>
                    <Text style={styles.metaPillText}>{restaurant.category}</Text>
                  </View>
                  <Text style={styles.ratingText}>* {restaurant.rating.toFixed(1)}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      restaurant.status === 'active'
                        ? styles.statusPillLive
                        : styles.statusPillInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        restaurant.status === 'active'
                          ? styles.statusTextLive
                          : styles.statusTextInactive,
                      ]}
                    >
                      {restaurant.status === 'active' ? 'LIVE' : 'OFF'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {filteredRestaurants.length === 0 && !loading.restaurants ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No restaurants found</Text>
              <Text style={styles.emptyText}>
                Try another keyword or create a new restaurant.
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AdminRestaurantForm')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        <AdminBottomBar activeTab="dashboard" navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  root: { flex: 1, backgroundColor: BACKGROUND },
  scrollContent: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 132 },
  screenTitle: { color: TEXT, fontSize: 29, fontWeight: '800', marginBottom: 6 },
  screenSubtitle: { color: MUTED, fontSize: 13, lineHeight: 18, marginBottom: 16 },
  errorText: { color: RED, fontSize: 12, fontWeight: '700', marginBottom: 12 },
  helperText: { color: MUTED, fontSize: 13, marginBottom: 12 },
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
  searchPrefix: { color: RED, fontSize: 13, fontWeight: '800', marginRight: 10 },
  searchInput: { flex: 1, color: TEXT, fontSize: 14 },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  filterPill: {
    backgroundColor: CARD,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ecd8d5',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  filterPillActive: { backgroundColor: RED, borderColor: RED },
  filterText: { color: MUTED, fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: '#fff' },
  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f1eee8',
    padding: 12,
    flexDirection: 'row',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  cardImage: { width: 82, height: 82, borderRadius: 14, backgroundColor: '#eadfd8' },
  cardBody: { flex: 1, marginLeft: 12 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: { flex: 1, color: TEXT, fontSize: 17, fontWeight: '800', paddingRight: 8 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionButton: { paddingVertical: 2 },
  actionEdit: { color: '#5f6474', fontSize: 10, fontWeight: '800' },
  actionDelete: { color: RED, fontSize: 10, fontWeight: '800' },
  cardAddress: { color: MUTED, fontSize: 12, marginBottom: 4 },
  cardOwner: { color: '#373848', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  metaPill: {
    backgroundColor: '#f6f1ec',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaPillText: { color: '#7f6e63', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  ratingText: { color: RED, fontSize: 12, fontWeight: '800' },
  statusPill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  statusPillLive: { backgroundColor: RED_SOFT },
  statusPillInactive: { backgroundColor: '#efeff2' },
  statusText: { fontSize: 10, fontWeight: '800' },
  statusTextLive: { color: RED },
  statusTextInactive: { color: '#6d7080' },
  emptyCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#f1eee8',
  },
  emptyTitle: { color: TEXT, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  emptyText: { color: MUTED, fontSize: 13, lineHeight: 18 },
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
  addButtonText: { color: '#fff', fontSize: 31, lineHeight: 31, marginTop: -2 },
});
