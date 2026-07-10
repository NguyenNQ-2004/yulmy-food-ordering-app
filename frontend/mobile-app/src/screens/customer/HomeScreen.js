import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthContext } from '../../context/AuthContext';
import { addItemToCart, clearCart, getMyCart } from '../../services/customerOrderApi';
import { clearLocalCartItems, loadLocalCartItems } from '../../services/localCartStorage';

const RED = '#B11226';
const LIGHT_BG = '#fffaf9';
const GRAY = '#888';

const CATEGORIES = ['Featured', 'Vegan', 'Gluten-Free', 'Sushi', 'Burger'];
const POPULAR_RESTAURANTS = [
  {
    id: 1,
    name: 'Masa Sushi',
    category: 'Japanese',
    price: '$$$$',
    rating: 4.9,
    time: '30-45 min',
    color: '#e8c9b8',
  },
  {
    id: 2,
    name: "L'Antica Pizzeria...",
    category: 'Italian',
    price: '$$',
    rating: 4.8,
    time: '20-30 min',
    color: '#e0c090',
  },
];

const RECOMMENDED = [
  {
    id: '66c000000000000000000002',
    name: 'Chicken Burger',
    restaurant: 'Yulmy Chicken',
    price: 5.5,
    color: '#f0d9db',
  },
  {
    id: '66c000000000000000000001',
    name: 'Fried Chicken',
    restaurant: 'Yulmy Chicken',
    price: 4.5,
    color: '#d9e5d6',
  },
  {
    id: '66c000000000000000000003',
    name: 'Chicken Rice',
    restaurant: 'Com Ngon Corner',
    price: 5,
    color: '#e6e6e6',
  },
  {
    id: '66c000000000000000000004',
    name: 'Beef Noodle Soup',
    restaurant: 'Noodle House',
    price: 6,
    color: '#ebd8c3',
  },
];

function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}

export default function HomeScreen({ navigation }) {
  const { currentUser, logout } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState('Featured');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [localCartItems, setLocalCartItems] = useState([]);

  const refreshCartCount = async () => {
    try {
      const cart = await getMyCart();
      setCartCount(Number(cart?.totalItems || 0));
      setLocalCartItems([]);
      await clearLocalCartItems();
    } catch (error) {
      const storedItems = await loadLocalCartItems();
      setLocalCartItems(storedItems);
      setCartCount(storedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const restoreCart = async () => {
      await refreshCartCount();

      if (!isMounted) {
        return;
      }
    };

    restoreCart();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refreshCartCount);

    return unsubscribe;
  }, [navigation]);

  const handleAvatarPress = () => {
    setShowProfileMenu((prev) => !prev);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
  };

  const handleOpenCart = () => {
    navigation.navigate('Cart');
  };

  const addBackendCartItem = async (item) => {
    const cart = await addItemToCart(item.id, 1);
    setCartCount(Number(cart?.totalItems || 0));
    setLocalCartItems([]);
    await clearLocalCartItems();
  };

  const handleAddToCart = async (item) => {
    try {
      await addBackendCartItem(item);
    } catch (error) {
      const message = error.response?.data?.message || 'Cannot add this item to cart.';

      if (message === 'Cart already contains items from another restaurant') {
        Alert.alert(
          'Replace cart?',
          'Your cart has items from another restaurant. Replace it with this item?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Replace',
              style: 'destructive',
              onPress: async () => {
                try {
                  await clearCart();
                  await addBackendCartItem(item);
                } catch (replaceError) {
                  Alert.alert(
                    'Add to cart failed',
                    replaceError.response?.data?.message || 'Cannot add this item to cart.'
                  );
                }
              },
            },
          ]
        );
        return;
      }

      Alert.alert('Add to cart failed', message);
    }
  };

  const firstName = currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'Alex';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Text style={styles.backIcon}>{'<-'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Epicurean</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={handleOpenCart}>
          <Text style={styles.headerEmoji}>{'\uD83D\uDED2'}</Text>
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.greetingSection}>
          <View>
            <Text style={styles.deliveryText}>
              Delivering to <Text style={styles.deliveryLocation}>New York, NY</Text>
            </Text>
            <Text style={styles.greetingText}>Good Evening, {firstName}.</Text>
          </View>

          <View style={styles.avatarWrapper}>
            <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{firstName[0]}</Text>
              </View>
            </TouchableOpacity>

            {showProfileMenu && (
              <View style={styles.profileMenu}>
                <TouchableOpacity style={styles.profileMenuItem} onPress={handleLogout}>
                  <Text style={styles.profileMenuText}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>{'\uD83D\uDD0D'}</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search dishes, restaurants, or cuisines"
            placeholderTextColor={GRAY}
            onFocus={() => setShowProfileMenu(false)}
          />
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerOverlay}>
            <View style={styles.exclusiveTag}>
              <Text style={styles.exclusiveText}>EXCLUSIVE OFFER</Text>
            </View>
            <Text style={styles.bannerTitle}>The Truffle Experience</Text>
            <Text style={styles.bannerSubtitle}>Free delivery from Le Bernardin {'\u2192'}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => {
                  setActiveCategory(cat);
                  setShowProfileMenu(false);
                }}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat === 'Featured' ? '\u2605 Featured' : cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Restaurants</Text>
          <TouchableOpacity onPress={() => setShowProfileMenu(false)}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
          {POPULAR_RESTAURANTS.map((item) => (
            <View key={item.id} style={styles.restaurantCard}>
              <View style={[styles.restaurantImagePlaceholder, { backgroundColor: item.color }]}>
                <TouchableOpacity style={styles.heartIcon}>
                  <Text>{'\u2661'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <Text style={styles.restaurantMeta}>
                  {item.category} {'\u2022'} {item.price}
                </Text>
                <Text style={styles.restaurantRating}>
                  {'\u2605'} {item.rating} {'   '}
                  {'\u23F0'} {item.time}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.recommendedTitle}>Recommended for You</Text>
        <View style={styles.recommendedGrid}>
          {RECOMMENDED.map((item) => (
            <View key={item.id} style={styles.recommendedCard}>
              <View style={[styles.recommendedImagePlaceholder, { backgroundColor: item.color }]} />
              <View style={styles.recommendedInfo}>
                <Text style={styles.recommendedName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.recommendedRest}>{item.restaurant}</Text>
                <View style={styles.recommendedBottom}>
                  <Text style={styles.recommendedPrice}>{formatMoney(item.price)}</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setShowProfileMenu(false);
                      handleAddToCart(item);
                    }}
                  >
                    <Text style={styles.addButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navActive]}>{'\uD83C\uDFE0'}</Text>
          <Text style={[styles.navLabel, styles.navActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>{'\uD83D\uDD0D'}</Text>
          <Text style={styles.navLabel}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>{'\u2661'}</Text>
          <Text style={styles.navLabel}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>{'\uD83D\uDCCB'}</Text>
          <Text style={styles.navLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={handleAvatarPress}>
          <Text style={styles.navIcon}>{'\uD83D\uDC64'}</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: LIGHT_BG,
  },
  headerIcon: {
    padding: 5,
  },
  backIcon: {
    fontSize: 20,
    color: RED,
  },
  headerEmoji: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: RED,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: RED,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    position: 'relative',
    zIndex: 20,
    elevation: 20,
  },
  deliveryText: {
    fontSize: 14,
    color: GRAY,
    marginBottom: 5,
  },
  deliveryLocation: {
    fontWeight: 'bold',
    color: '#222',
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  avatarWrapper: {
    position: 'relative',
    zIndex: 30,
    elevation: 30,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileMenu: {
    position: 'absolute',
    top: 54,
    right: 0,
    minWidth: 110,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ece7e4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    zIndex: 40,
    elevation: 40,
  },
  profileMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileMenuText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6eff0',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
    position: 'relative',
    zIndex: 1,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  banner: {
    marginHorizontal: 20,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#2a2d34',
    marginBottom: 20,
    overflow: 'hidden',
  },
  bannerOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  exclusiveTag: {
    backgroundColor: RED,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  exclusiveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#ddd',
    fontSize: 12,
  },
  categoriesScroll: {
    paddingLeft: 20,
    marginBottom: 25,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  categoryPillActive: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  categoryText: {
    color: '#555',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  seeAll: {
    color: RED,
    fontWeight: '600',
  },
  horizontalList: {
    paddingLeft: 20,
    marginBottom: 15,
  },
  restaurantCard: {
    width: 240,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 10,
  },
  restaurantImagePlaceholder: {
    height: 130,
    backgroundColor: '#eee',
    position: 'relative',
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  restaurantMeta: {
    color: '#666',
    fontSize: 13,
    marginBottom: 6,
  },
  restaurantRating: {
    fontSize: 13,
    color: '#444',
    fontWeight: '600',
  },
  recommendedTitle: {
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 15,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  recommendedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  recommendedCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  recommendedImagePlaceholder: {
    height: 120,
    backgroundColor: '#eee',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  recommendedInfo: {
    padding: 12,
  },
  recommendedName: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    minHeight: 40,
  },
  recommendedRest: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  recommendedBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: RED,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -2,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 10,
    paddingBottom: 25,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 22,
    color: '#999',
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  navActive: {
    color: RED,
  },
});
