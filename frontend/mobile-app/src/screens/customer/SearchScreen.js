import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { addItemToCart, clearCart, getMyCart } from '../../services/customerOrderApi';
import { clearLocalCartItems, loadLocalCartItems } from '../../services/localCartStorage';

const RED = '#B11226';
const LIGHT_BG = '#fffaf9';
const GRAY = '#888';

const RECENT_SEARCHES = ['Truffle Risotto', 'Vegan Sushi', 'Artisan Coffee'];
const POPULAR_KEYWORDS = ['Gluten-Free', 'Spicy', 'Desserts', 'Healthy', 'Seafood'];

const TRENDING_GRID = [
  { id: '66c000000000000000000009', name: 'Matcha Crepe', restaurant: 'Maison De Sucre', price: 8.5, image: 'https://images.unsplash.com/photo-1514849302-984523450ce4?w=500&q=80' },
  { id: '66c00000000000000000000a', name: 'Avocado Toast', restaurant: 'Verdant Kitchen', price: 11, image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=500&q=80' }
];

const TRENDING_FEATURED = {
  id: '66c00000000000000000000b',
  name: 'Seared Scallops',
  restaurant: 'Lumina Osteria',
  price: 32,
  image: 'https://images.unsplash.com/photo-1599321955726-e048426594af?w=500&q=80'
};

export default function SearchScreen({ navigation }) {
  const [recentSearches, setRecentSearches] = useState(['Healthy', 'Burger', 'Sushi']);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = async () => {
    try {
      const cart = await getMyCart();
      setCartCount(Number(cart?.totalItems || 0));
    } catch (error) {
      const storedItems = await loadLocalCartItems();
      setCartCount(storedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0));
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      refreshCartCount();
    }, [])
  );

  const handleAddToCart = async (item) => {
    try {
      const cart = await addItemToCart(item.id, 1);
      setCartCount(Number(cart?.totalItems || 0));
      await clearLocalCartItems();
      Alert.alert('Success', 'Item added to cart');
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
                  const cart = await addItemToCart(item.id, 1);
                  setCartCount(Number(cart?.totalItems || 0));
                  await clearLocalCartItems();
                  Alert.alert('Success', 'Item added to cart');
                } catch (replaceError) {
                  Alert.alert('Add to cart failed', replaceError.response?.data?.message || 'Cannot add this item to cart.');
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.headerEmoji}>🛒</Text>
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Search Bar Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput 
              style={styles.searchInput}
              placeholder="Dishes, cuisines, or ingredients..."
              placeholderTextColor={GRAY}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('RestaurantList')}>
            <Text style={styles.filterIcon}>☷</Text>
          </TouchableOpacity>
        </View>

        {/* Explore All Restaurants Button */}
        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => navigation.navigate('RestaurantList')}
        >
          <Text style={styles.exploreButtonText}>Explore All Restaurants</Text>
          <Text style={styles.exploreButtonArrow}>→</Text>
        </TouchableOpacity>

        {/* Recent Searches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          {RECENT_SEARCHES.map((item, index) => (
            <View key={index} style={styles.recentItem}>
              <View style={styles.recentLeft}>
                <Text style={styles.clockIcon}>🕒</Text>
                <Text style={styles.recentText}>{item}</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Popular Keywords */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Keywords</Text>
          <View style={styles.keywordsContainer}>
            {POPULAR_KEYWORDS.map((item, index) => (
              <TouchableOpacity key={index} style={styles.keywordPill}>
                <Text style={styles.keywordText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending Now */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          
          <View style={styles.trendingGrid}>
            {TRENDING_GRID.map((item) => (
              <TouchableOpacity key={item.id} style={styles.trendingCard} onPress={() => navigation.navigate('FoodDetail', { item })}>
                <Image source={{ uri: item.image }} style={styles.trendingImage} />
                <View style={styles.trendingInfo}>
                  <Text style={styles.trendingName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.trendingRest}>{item.restaurant}</Text>
                  <View style={styles.trendingBottom}>
                    <Text style={styles.trendingPrice}>${item.price}</Text>
                    <TouchableOpacity style={styles.addButtonLite} onPress={() => handleAddToCart(item)}>
                      <Text style={styles.addButtonLiteText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Featured Item */}
          <TouchableOpacity style={styles.featuredCard} onPress={() => navigation.navigate('FoodDetail', { item: TRENDING_FEATURED })}>
            <Image source={{ uri: TRENDING_FEATURED.image }} style={styles.featuredImage} />
            <View style={styles.featuredTag}>
              <Text style={styles.featuredTagText}>Featured</Text>
            </View>
            <View style={styles.featuredInfo}>
              <View style={{flex: 1}}>
                <Text style={styles.featuredName}>{TRENDING_FEATURED.name}</Text>
                <Text style={styles.trendingRest}>{TRENDING_FEATURED.restaurant}</Text>
              </View>
              <View style={styles.featuredBottom}>
                <Text style={styles.featuredPrice}>${TRENDING_FEATURED.price}</Text>
                <TouchableOpacity style={styles.addButtonDark} onPress={() => handleAddToCart(TRENDING_FEATURED)}>
                  <Text style={styles.addButtonDarkText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

        </View>

        <View style={{height: 100}} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
           <Text style={styles.navIcon}>🏠</Text>
           <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
           <Text style={[styles.navIcon, {color: RED}]}>🔍</Text>
           <Text style={[styles.navLabel, {color: RED}]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
           <Text style={styles.navIcon}>🤍</Text>
           <Text style={styles.navLabel}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
           <Text style={styles.navIcon}>📋</Text>
           <Text style={styles.navLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
           <Text style={styles.navIcon}>👤</Text>
           <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
  },
  headerIcon: {
    padding: 5,
  },
  headerEmoji: {
    fontSize: 20,
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
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 25,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    color: GRAY,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginLeft: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  filterIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  exploreButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fbe8e8',
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 25,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: RED,
  },
  exploreButtonArrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: RED,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    fontSize: 16,
    marginRight: 15,
    color: '#aaa',
  },
  recentText: {
    fontSize: 15,
    color: '#444',
  },
  closeIcon: {
    fontSize: 14,
    color: '#d0d0d0',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  keywordPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginRight: 10,
    marginBottom: 10,
  },
  keywordText: {
    color: '#444',
    fontSize: 14,
  },
  trendingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  trendingCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  trendingImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#eee',
  },
  trendingInfo: {
    padding: 12,
  },
  trendingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  trendingRest: {
    fontSize: 13,
    color: GRAY,
    marginBottom: 10,
  },
  trendingBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  addButtonLite: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f5dede',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonLiteText: {
    color: RED,
    fontSize: 18,
    marginTop: -2,
  },
  featuredCard: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  featuredImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#eee',
  },
  featuredTag: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  featuredTagText: {
    color: RED,
    fontWeight: 'bold',
    fontSize: 12,
  },
  featuredInfo: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  featuredBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 15,
  },
  addButtonDark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#730d17',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDarkText: {
    color: '#fff',
    fontSize: 20,
    marginTop: -2,
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
});
