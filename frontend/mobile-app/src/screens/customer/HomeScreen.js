import React, { useContext, useState } from 'react';
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

const RED = '#B11226';
const LIGHT_BG = '#fffaf9';
const GRAY = '#888';

const CATEGORIES = ['★ Featured', 'Vegan', 'Gluten-Free', 'Sushi', 'Burger'];
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
    id: 1,
    name: 'Wagyu Slider Trio',
    restaurant: "The Butcher's Cut",
    price: 28.0,
    color: '#f0d9db',
  },
  {
    id: 2,
    name: 'Heirloom Gazpacho',
    restaurant: 'Bistro Bleu',
    price: 16.5,
    color: '#d9e5d6',
  },
  {
    id: 3,
    name: 'Decadent Torta',
    restaurant: 'Patisserie Lumi',
    price: 14.0,
    color: '#e6e6e6',
  },
  {
    id: 4,
    name: 'Tonkotsu Ramen',
    restaurant: 'Kizuna',
    price: 22.0,
    color: '#ebd8c3',
  },
];

export default function HomeScreen({ navigation }) {
  const { currentUser, logout } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState('★ Featured');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

  const firstName = currentUser?.fullName
    ? currentUser.fullName.split(' ')[0]
    : 'Alex';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Text style={styles.headerArrow}>{'<-'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Epicurean</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Text style={styles.headerEmoji}>🛍️</Text>
          {cartCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.greetingSection}>
          <View>
            <Text style={styles.deliveryText}>
              Delivering to{' '}
              <Text style={styles.deliveryStrong}>New York, NY ⌄</Text>
            </Text>
            <Text style={styles.greetingText}>Good Evening, {firstName}.</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{firstName[0]}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartText}>Open Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search dishes, restaurants, or cuisines"
            placeholderTextColor={GRAY}
          />
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerOverlay}>
            <View style={styles.exclusiveTag}>
              <Text style={styles.exclusiveText}>EXCLUSIVE OFFER</Text>
            </View>
            <Text style={styles.bannerTitle}>The Truffle Experience</Text>
            <Text style={styles.bannerSubtitle}>
              Free delivery from Le Bernardin {'\u2192'}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;

            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive,
                ]}
                onPress={() => setActiveCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Restaurants</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
        >
          {POPULAR_RESTAURANTS.map((item) => (
            <View key={item.id} style={styles.restaurantCard}>
              <View
                style={[
                  styles.restaurantImagePlaceholder,
                  { backgroundColor: item.color },
                ]}
              >
                <TouchableOpacity style={styles.heartIcon}>
                  <Text>🤍</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <Text style={styles.restaurantMeta}>
                  {item.category} • {item.price}
                </Text>
                <Text style={styles.restaurantRating}>
                  ★ {item.rating}   🕒 {item.time}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.recommendedTitle}>Recommended for You</Text>
        <View style={styles.recommendedGrid}>
          {RECOMMENDED.map((item) => (
            <View key={item.id} style={styles.recommendedCard}>
              <View
                style={[
                  styles.recommendedImagePlaceholder,
                  { backgroundColor: item.color },
                ]}
              />
              <View style={styles.recommendedInfo}>
                <Text style={styles.recommendedName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.recommendedRest}>{item.restaurant}</Text>
                <View style={styles.recommendedBottom}>
                  <Text style={styles.recommendedPrice}>
                    ${item.price.toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddToCart}
                  >
                    <Text style={styles.addButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, { color: RED }]}>🏠</Text>
          <Text style={[styles.navLabel, { color: RED }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navLabel}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🤍</Text>
          <Text style={styles.navLabel}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
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
  headerArrow: {
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
  },
  deliveryText: {
    fontSize: 14,
    color: GRAY,
    marginBottom: 5,
  },
  deliveryStrong: {
    fontWeight: 'bold',
    color: '#222',
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
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
  cartButton: {
    borderWidth: 1,
    borderColor: RED,
    padding: 14,
    borderRadius: 12,
    marginTop: 6,
    marginHorizontal: 20,
  },
  cartText: {
    color: RED,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#333',
    padding: 14,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 15,
    marginHorizontal: 20,
  },
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 15,
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
  footerSpacer: {
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
});
