import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getFavorites, toggleFavorite, addItemToCart } from '../../services/customerOrderApi';

const RED = '#B11226';
const LIGHT_BG = '#fffaf9';
const GRAY = '#888';
const LIGHT_GRAY = '#f0f0f0';

export default function FavoritesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Dishes');
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const data = await getFavorites();
      setFavorites(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFav = async (foodId, restaurantId) => {
    try {
      await toggleFavorite(foodId, restaurantId);
      fetchFavorites();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToCart = async (foodId) => {
    try {
      await addItemToCart(foodId, 1);
      Alert.alert('Success', 'Added to cart!');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add');
    }
  };

  const favoriteDishes = (favorites || []).filter((f) => f.food != null);
  const favoriteRestaurants = (favorites || []).filter((f) => f.restaurant != null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        <TouchableOpacity style={styles.searchIconBtn}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Dishes' && styles.activeTabButton]}
          onPress={() => setActiveTab('Dishes')}
        >
          <Text style={[styles.tabText, activeTab === 'Dishes' && styles.activeTabText]}>
            Dishes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Restaurants' && styles.activeTabButton]}
          onPress={() => setActiveTab('Restaurants')}
        >
          <Text style={[styles.tabText, activeTab === 'Restaurants' && styles.activeTabText]}>
            Restaurants
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color={RED} style={{ marginTop: 50 }} />
        ) : activeTab === 'Dishes' ? (
          favoriteDishes.length > 0 ? favoriteDishes.map((item) => {
            const food = item.food;
            if (!food) return null;
            return (
              <TouchableOpacity 
                key={item._id} 
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('FoodDetail', { item: food })}
              >
                <View style={styles.imageContainer}>
                  <Image source={{ uri: food.image }} style={styles.image} />
                  <TouchableOpacity 
                    style={styles.heartBtn}
                    onPress={() => handleToggleFav(food._id, null)}
                  >
                    <Text style={styles.heartIcon}>♥</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.cardInfo}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{food.name}</Text>
                    <Text style={styles.cardPrice}>${food.price}</Text>
                  </View>
                  
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {food.description}
                  </Text>
                  
                  <View style={styles.cardFooter}>
                    <Text style={styles.restaurantName}>{item.restaurant?.name || 'Restaurant'}</Text>
                    <TouchableOpacity 
                      style={styles.addBtn}
                      onPress={() => handleAddToCart(food._id)}
                    >
                      <Text style={styles.addBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No favorite dishes yet.</Text>
            </View>
          )
        ) : (
          favoriteRestaurants.length > 0 ? favoriteRestaurants.map((item) => {
            const rest = item.restaurant;
            if (!rest) return null;
            return (
              <TouchableOpacity 
                key={item._id} 
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('RestaurantDetail', { restaurant: rest })}
              >
                <View style={styles.imageContainer}>
                  <Image source={{ uri: rest.image || 'https://via.placeholder.com/300' }} style={styles.image} />
                  <TouchableOpacity 
                    style={styles.heartBtn}
                    onPress={() => handleToggleFav(null, rest._id)}
                  >
                    <Text style={styles.heartIcon}>♥</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{rest.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{rest.description}</Text>
                </View>
              </TouchableOpacity>
            );
          }) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No favorite restaurants yet.</Text>
            </View>
          )
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Search')}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navLabel}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navActiveIcon]}>♥</Text>
          <Text style={styles.navActiveText}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('OrderHistory')}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: RED,
  },
  searchIconBtn: {
    padding: 5,
  },
  searchIcon: {
    fontSize: 20,
    color: GRAY,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e5e3',
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 10,
    marginRight: 25,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: RED,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: GRAY,
  },
  activeTabText: {
    color: RED,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0e5e3',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      default: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heartIcon: {
    color: RED,
    fontSize: 18,
    marginTop: -2,
  },
  cardInfo: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: RED,
    marginLeft: 10,
  },
  cardDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addBtn: {
    width: 28,
    height: 28,
    backgroundColor: RED,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: GRAY,
    fontSize: 15,
  },
  bottomPadding: {
    height: 100,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0e5e3',
    paddingBottom: Platform.OS === 'ios' ? 0 : 6,
    paddingTop: 6,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 20,
    color: '#a08582',
  },
  navActiveIcon: {
    color: RED,
  },
  navActiveText: {
    color: RED,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  navLabel: {
    color: '#a08582',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
