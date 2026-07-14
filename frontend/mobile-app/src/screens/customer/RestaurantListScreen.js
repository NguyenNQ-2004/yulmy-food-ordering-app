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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMyCart, getFavorites, toggleFavorite } from '../../services/customerOrderApi';
import { loadLocalCartItems } from '../../services/localCartStorage';

const RED = '#B11226';
const LIGHT_BG = '#fffaf9';
const GRAY = '#888';

const CATEGORIES = ['All', 'Italian', 'Japanese', 'Vegan', 'Desserts', 'Fast Food'];

const RESTAURANTS = [
  {
    id: '66b000000000000000000004',
    name: 'Lumina Osteria',
    description: 'Hand-crafted regional Italian cuisine emphasizing seasonal, hyper-local ingredients.',
    rating: 4.9,
    time: '35-45 min',
    category: 'Italian',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80',
  },
  {
    id: '66b000000000000000000005',
    name: 'Akira Omakase',
    description: 'An intimate, premium sushi experience curated daily by master chefs.',
    rating: 4.8,
    time: '40-55 min',
    category: 'Japanese',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80',
  },
  {
    id: '66b000000000000000000006',
    name: 'Verdant Kitchen',
    description: 'Elevated plant-based dining focused on organic, sustainable whole foods.',
    rating: 4.7,
    time: '25-35 min',
    category: 'Vegan',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
  },
  {
    id: '66b000000000000000000007',
    name: 'Maison De Sucre',
    description: 'Artisanal French pastries and bespoke desserts crafted with uncompromising technique.',
    rating: 4.9,
    time: '20-30 min',
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
  },
  {
    id: '66b000000000000000000001',
    name: 'Yulmy Chicken',
    description: 'Delicious fried chicken and burgers.',
    rating: 4.8,
    time: '20-30 min',
    category: 'Fast Food',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80',
  },
  {
    id: '66b000000000000000000002',
    name: 'Com Ngon Corner',
    description: 'Traditional Asian rice dishes.',
    rating: 4.6,
    time: '15-25 min',
    category: 'Fast Food',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80',
  },
  {
    id: '66b000000000000000000003',
    name: 'Noodle House',
    description: 'Authentic noodle soups.',
    rating: 4.9,
    time: '20-30 min',
    category: 'Fast Food',
    image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=500&q=80',
  }
];

export default function RestaurantListScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState([]);

  const refreshCartCount = async () => {
    try {
      const cart = await getMyCart();
      setCartCount(Number(cart?.totalItems || 0));
    } catch (error) {
      const storedItems = await loadLocalCartItems();
      setCartCount(storedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0));
    }
  };

  const refreshFavorites = async () => {
    try {
      const favs = await getFavorites();
      const favRestIds = (favs || []).filter(f => f.restaurant).map(f => f.restaurant._id);
      setFavoriteIds(favRestIds);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      refreshCartCount();
      refreshFavorites();
    }, [])
  );

  const handleToggleFav = async (restId) => {
    try {
      await toggleFavorite(null, restId);
      refreshFavorites();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredRestaurants = RESTAURANTS.filter(r => {
    const matchCategory = activeCategory === 'All' || r.category === activeCategory;
    const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <Text style={{fontSize: 20, color: '#222'}}>{'<-'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Epicurean</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Cart')}>
          <Text style={{fontSize: 20}}>🛒</Text>
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.pageTitle}>Explore Restaurants</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput 
            style={styles.searchInput}
            placeholder="Search cuisines, dishes, or restaurants"
            placeholderTextColor={GRAY}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {CATEGORIES.map((cat, idx) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity 
                key={idx} 
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Restaurant List */}
        <View style={styles.listContainer}>
          {filteredRestaurants.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card}
              onPress={() => navigation.navigate('RestaurantDetail', { restaurant: item })}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <TouchableOpacity 
                  style={styles.heartIcon}
                  onPress={() => handleToggleFav(item.id)}
                >
                   <Text style={{color: favoriteIds.includes(item.id) ? RED : '#ccc', fontSize: 20, marginTop: -2}}>
                     {favoriteIds.includes(item.id) ? '♥' : '♡'}
                   </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.infoContainer}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>★ {item.rating}</Text>
                  </View>
                </View>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaIcon}>🕒</Text>
                  <Text style={styles.metaText}>{item.time}</Text>
                  <Text style={[styles.metaIcon, {marginLeft: 15}]}>🍴</Text>
                  <Text style={styles.metaText}>{item.category}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{height: 100}} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
           <Text style={styles.navIcon}>🏠</Text>
           <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Search')}>
           <Text style={[styles.navIcon, {color: RED}]}>🔍</Text>
           <Text style={[styles.navLabel, {color: RED}]}>Search</Text>
           <View style={styles.activeDot} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Favorites')}>
          <Text style={styles.navIcon}>♥</Text>
          <Text style={styles.navLabel}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('OrderHistory')}>
           <Text style={styles.navIcon}>📋</Text>
           <Text style={styles.navLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerIcon: {
    padding: 5,
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
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
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
  categoriesScroll: {
    paddingLeft: 20,
    marginBottom: 25,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  categoryPillActive: {
    backgroundColor: '#9a0d17',
    borderColor: '#9a0d17',
  },
  categoryText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
  },
  heartIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContainer: {
    padding: 15,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: '#fbe8e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    color: RED,
    fontWeight: 'bold',
    fontSize: 12,
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 12,
    color: GRAY,
    marginRight: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#444',
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
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: RED,
    position: 'absolute',
    bottom: -8,
  },
});
