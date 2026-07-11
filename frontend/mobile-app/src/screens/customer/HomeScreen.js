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
  Image,
  Platform,
  Modal,
} from 'react-native';

import { AuthContext } from '../../context/AuthContext';
import { addItemToCart, clearCart, getMyCart } from '../../services/customerOrderApi';
import { clearLocalCartItems, loadLocalCartItems } from '../../services/localCartStorage';

const RED = '#B11226';
const LIGHT_BG = '#fffaf9';
const GRAY = '#888';

const CATEGORIES = ['Featured', 'Vegan', 'Gluten-Free', 'Sushi', 'Burger'];
const POPULAR_RESTAURANTS = [
  { id: 1, name: 'Akira Omakase', category: 'Japanese', price: '$$$$', rating: 4.9, time: '30-45 min', color: '#e8c9b8', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80' },
  { id: 2, name: 'Lumina Osteria', category: 'Italian', price: '$$', rating: 4.8, time: '20-30 min', color: '#e0c090', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80' },
];

const RECOMMENDED = [
  {
    id: '66c000000000000000000002',
    name: 'Chicken Burger',
    restaurant: 'Yulmy Chicken',
    price: 5.5,
    color: '#f0d9db',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
    category: 'Burger'
  },
  {
    id: '66c000000000000000000001',
    name: 'Fried Chicken',
    restaurant: 'Yulmy Chicken',
    price: 4.5,
    color: '#d9e5d6',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80',
    category: 'Featured'
  },
  {
    id: '66c000000000000000000003',
    name: 'Chicken Rice',
    restaurant: 'Com Ngon Corner',
    price: 5,
    color: '#e6e6e6',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
    category: 'Featured'
  },
  {
    id: '66c000000000000000000004',
    name: 'Beef Noodle Soup',
    restaurant: 'Noodle House',
    price: 6,
    color: '#ebd8c3',
    image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=500&q=80',
    category: 'Gluten-Free'
  },
  { id: '66c000000000000000000005', name: 'Truffle Mushroom Risotto', restaurant: 'Lumina Osteria', price: 28.00, color: '#e8c9b8', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500&q=80', category: 'Vegan' },
  { id: '66c000000000000000000006', name: 'Spicy Tuna Roll', restaurant: 'Akira Omakase', price: 15.00, color: '#f0d9db', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&q=80', category: 'Sushi' },
  { id: '66c000000000000000000007', name: 'Vegan Buddha Bowl', restaurant: 'Verdant Kitchen', price: 12.00, color: '#d9e5d6', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80', category: 'Vegan' },
  { id: '66c000000000000000000008', name: 'Chocolate Lava Cake', restaurant: 'Maison De Sucre', price: 9.00, color: '#e6e6e6', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80', category: 'Dessert' },
  { id: '66c000000000000000000009', name: 'Matcha Crepe', restaurant: 'Maison De Sucre', price: 8.50, color: '#d9e5d6', image: 'https://images.unsplash.com/photo-1514849302-984523450ce4?w=500&q=80', category: 'Dessert' },
  { id: '66c00000000000000000000a', name: 'Avocado Toast', restaurant: 'Verdant Kitchen', price: 11.00, color: '#e8c9b8', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=500&q=80', category: 'Vegan' },
  { id: '66c00000000000000000000b', name: 'Seared Scallops', restaurant: 'Lumina Osteria', price: 32.00, color: '#ebd8c3', image: 'https://images.unsplash.com/photo-1599321955726-e048426594af?w=500&q=80', category: 'Featured' },
];

function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}

export default function HomeScreen({ navigation }) {
  const { currentUser, logout } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState('Featured');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [localCartItems, setLocalCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingItemId, setAddingItemId] = useState(null);

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
    await clearLocalCartItems();
  };

  const handleAddToCart = async (item) => {
    if (addingItemId) return;
    setAddingItemId(item.id);
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

  const filteredPopular = POPULAR_RESTAURANTS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'Featured' || 
      item.name.toLowerCase().includes(activeCategory.toLowerCase()) || 
      (item.category && item.category.toLowerCase().includes(activeCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  const filteredRecommended = RECOMMENDED.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.restaurant && item.restaurant.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'Featured' || 
      item.name.toLowerCase().includes(activeCategory.toLowerCase()) || 
      (item.restaurant && item.restaurant.toLowerCase().includes(activeCategory.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(activeCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

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
            value={searchQuery}
            onChangeText={setSearchQuery}
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
          <TouchableOpacity onPress={() => { setShowProfileMenu(false); navigation.navigate('RestaurantList'); }}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
          {filteredPopular.length > 0 ? filteredPopular.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.restaurantCard} 
              onPress={() => {
                setShowProfileMenu(false);
                navigation.navigate('RestaurantDetail', { restaurant: item });
              }}
            >
              <View style={[styles.restaurantImagePlaceholder, { backgroundColor: item.color, overflow: 'hidden' }]}>
                {item.image && <Image source={{uri: item.image}} style={StyleSheet.absoluteFillObject} />}
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
            </TouchableOpacity>
          )) : <Text style={{marginLeft: 20, color: GRAY}}>No restaurants found.</Text>}
        </ScrollView>

        <Text style={styles.recommendedTitle}>Recommended for You</Text>
        <View style={styles.recommendedGrid}>
          {filteredRecommended.length > 0 ? filteredRecommended.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.recommendedCard} 
              onPress={() => {
                setShowProfileMenu(false);
                navigation.navigate('FoodDetail', { item });
              }}
            >
               <View style={[styles.recommendedImagePlaceholder, {backgroundColor: item.color, overflow: 'hidden'}]}>
                 {item.image && <Image source={{uri: item.image}} style={{width: '100%', height: '100%'}} />}
               </View>
               <View style={styles.recommendedInfo}>
                 <Text style={styles.recommendedName} numberOfLines={2}>{item.name}</Text>
                 <Text style={styles.recommendedRest}>{item.restaurant}</Text>
                 <View style={styles.recommendedBottom}>
                   <Text style={styles.recommendedPrice}>{formatMoney(item.price)}</Text>
                   <TouchableOpacity 
                     style={[styles.addButton, addingItemId === item.id && { opacity: 0.5 }]} 
                     onPress={() => {
                       setShowProfileMenu(false);
                       handleAddToCart(item);
                     }}
                     disabled={addingItemId === item.id}
                   >
                     <Text style={styles.addButtonText}>+</Text>
                   </TouchableOpacity>
                 </View>
               </View>
            </TouchableOpacity>
          )) : <Text style={{marginLeft: 20, color: GRAY}}>No dishes found.</Text>}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navActive]}>{'\uD83C\uDFE0'}</Text>
          <Text style={[styles.navLabel, styles.navActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Search')}>
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

      {/* Custom Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to log out of Epicurean?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelModalButton]} 
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmModalButton]} 
                onPress={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmModalText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)',
      },
    }),
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)',
      },
    }),
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(39, 24, 22, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#271816',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#5b403d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0e5e3',
  },
  confirmModalButton: {
    backgroundColor: RED,
  },
  cancelModalText: {
    color: '#8f6f6c',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmModalText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
