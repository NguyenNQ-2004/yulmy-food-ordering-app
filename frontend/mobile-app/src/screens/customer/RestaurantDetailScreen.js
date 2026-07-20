import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { addItemToCart, clearCart, getMyCart, getFavorites, toggleFavorite } from '../../services/customerOrderApi';
import { clearLocalCartItems, loadLocalCartItems } from '../../services/localCartStorage';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const RED = '#B11226';
const LIGHT_BG = '#fffaf9';
const GRAY = '#888';

const CATEGORIES = ['Popular', 'Mains', 'Sides', 'Drinks', 'Desserts'];

const ALL_MENU_ITEMS = [
  {
    id: '66c000000000000000000002',
    name: 'Chicken Burger',
    description: 'Soft burger with crispy chicken and fresh vegetables.',
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
    tags: [],
    restaurantName: 'Yulmy Chicken'
  },
  {
    id: '66c000000000000000000001',
    name: 'Fried Chicken',
    description: 'Crispy and juicy fried chicken.',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80',
    tags: ['CRISPY'],
    restaurantName: 'Yulmy Chicken'
  },
  {
    id: '66c00000000000000000000f',
    name: 'Spicy Chicken Wings',
    description: 'Hot and spicy chicken wings served with ranch.',
    price: 6.00,
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&q=80',
    tags: ['SPICY'],
    restaurantName: 'Yulmy Chicken'
  },
  {
    id: '66c000000000000000000010',
    name: 'Chicken Nuggets',
    description: 'Crispy golden chicken nuggets, 10 pieces.',
    price: 4.00,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&q=80',
    tags: ['SNACK'],
    restaurantName: 'Yulmy Chicken'
  },
  {
    id: '66c000000000000000000003',
    name: 'Chicken Rice',
    description: 'Hainanese style chicken with fragrant rice.',
    price: 5.00,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
    tags: [],
    restaurantName: 'Com Ngon Corner'
  },
  {
    id: '66c000000000000000000004',
    name: 'Beef Noodle Soup',
    description: 'Traditional Pho with tender beef slices.',
    price: 6.00,
    image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=500&q=80',
    tags: ['HOT'],
    restaurantName: 'Noodle House'
  },
  {
    id: '66c000000000000000000006',
    name: 'Spicy Tuna Roll',
    description: 'Fresh tuna with spicy mayo and crispy tempura flakes.',
    price: 15.00,
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&q=80',
    tags: ['SPICY'],
    restaurantName: 'Akira Omakase'
  },
  {
    id: '66c00000000000000000000c',
    name: 'Masa Premium Sushi Set',
    description: 'Assorted premium sushi crafted by master chefs.',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80',
    tags: ['PREMIUM'],
    restaurantName: 'Akira Omakase'
  },
  {
    id: '66c00000000000000000000d',
    name: 'Margherita Pizza',
    description: 'Classic pizza with San Marzano tomatoes, mozzarella cheese, and fresh basil.',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80',
    tags: ['VEGETARIAN'],
    restaurantName: 'Lumina Osteria'
  },
  {
    id: '66c000000000000000000005',
    name: 'Truffle Mushroom Risotto',
    description: 'Creamy Arborio rice with wild porcini mushrooms and black truffle.',
    price: 28.00,
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500&q=80',
    tags: ['VEGETARIAN'],
    restaurantName: 'Lumina Osteria'
  },
  {
    id: '66c00000000000000000000b',
    name: 'Seared Scallops',
    description: 'Pan-seared scallops with cauliflower puree and herb oil.',
    price: 32.00,
    image: 'https://images.unsplash.com/photo-1599321955726-e048426594af?w=500&q=80',
    tags: ['SEAFOOD'],
    restaurantName: 'Lumina Osteria'
  },
  {
    id: '66c000000000000000000007',
    name: 'Vegan Buddha Bowl',
    description: 'Quinoa, roasted sweet potatoes, avocado, and tahini dressing.',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
    tags: ['VEGAN', 'HEALTHY'],
    restaurantName: 'Verdant Kitchen'
  },
  {
    id: '66c00000000000000000000a',
    name: 'Avocado Toast',
    description: 'Sourdough toast topped with smashed avocado and poached egg.',
    price: 11.00,
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=500&q=80',
    tags: ['VEGAN'],
    restaurantName: 'Verdant Kitchen'
  },
  {
    id: '66c000000000000000000008',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten center, served with vanilla ice cream.',
    price: 9.00,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
    tags: ['DESSERT'],
    restaurantName: 'Maison De Sucre'
  },
  {
    id: '66c000000000000000000009',
    name: 'Matcha Crepe',
    description: 'Delicate layers of crepe with matcha infused cream.',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1514849302-984523450ce4?w=500&q=80',
    tags: ['DESSERT'],
    restaurantName: 'Maison De Sucre'
  }
];

export default function RestaurantDetailScreen({ navigation, route }) {
  const { currentUser } = React.useContext(AuthContext);
  const passedRestaurant = route?.params?.restaurant;

  const currentRestaurant = passedRestaurant ? {
    id: passedRestaurant.id || passedRestaurant._id,
    name: passedRestaurant.name,
    description: passedRestaurant.description || `${passedRestaurant.category || 'Food'} \u2022 Perfect for your cravings.`,
    rating: passedRestaurant.rating || 4.8,
    time: passedRestaurant.time || passedRestaurant.deliveryTime || '30-45 min',
    delivery: passedRestaurant.delivery || 'Free delivery',
    coverImage: passedRestaurant.image || 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=80',
  } : {
    id: '66b000000000000000000004',
    name: 'Lumina Osteria',
    rating: 4.9,
    time: '35-45 min',
    delivery: '$2.99 Delivery',
    description: 'Hand-crafted regional Italian cuisine emphasizing seasonal, hyper-local ingredients.',
    coverImage: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80',
  };

  const [displayMenuItems, setDisplayMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Popular');
  const [cartCount, setCartCount] = useState(1);
  const [cartTotal, setCartTotal] = useState(18.00);
  const [addingItemId, setAddingItemId] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const refreshCartCount = async () => {
    if (!currentUser) {
      try {
        const storedItems = await loadLocalCartItems();
        const totalItems = storedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        const amount = storedItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
        setCartCount(totalItems);
        setCartTotal(amount);
      } catch (e) {
        console.log(e);
      }
      return;
    }
    try {
      const cart = await getMyCart();
      setCartCount(Number(cart?.totalItems || 0));
      setCartTotal(Number(cart?.totalAmount || 0));
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFoods = async () => {
    try {
      const response = await api.get(`/customer/restaurants/${currentRestaurant.id}/foods`);
      if (response.data.success) {
        // map backend id to match our frontend usage
        const backendFoods = response.data.data.map(f => ({
          ...f,
          id: f._id,
          tags: f.category ? [f.category] : [],
        }));
        setDisplayMenuItems(backendFoods);
      }
    } catch (error) {
      console.log('Error fetching foods:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      refreshCartCount();
      fetchFoods();
      
      const checkFavorite = async () => {
        try {
          const favs = await getFavorites();
          const isFav = (favs || []).some(f => f.restaurant && f.restaurant._id === currentRestaurant.id);
          setIsFavorite(isFav);
        } catch (error) {
          console.error(error);
        }
      };
      if (currentUser) {
        checkFavorite();
      }
    }, [currentRestaurant.id, currentUser])
  );

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      navigation.navigate('Auth');
      return;
    }
    try {
      const result = await toggleFavorite(null, currentRestaurant.id);
      setIsFavorite(result.isFavorite);
    } catch (error) {
      console.error(error);
    }
  };

  const addBackendCartItem = async (item) => {
    const cart = await addItemToCart(item.id || item._id, 1);
    setCartCount(Number(cart?.totalItems || 0));
    setCartTotal(Number(cart?.totalAmount || 0));
    await clearLocalCartItems();
  };

  const handleAddToCart = async (item) => {
    if (!currentUser) {
      navigation.navigate('Auth');
      return;
    }
    if (addingItemId) return;
    setAddingItemId(item.id || item._id);
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
                  Alert.alert('Add to cart failed', replaceError.response?.data?.message || 'Cannot add this item to cart.');
                }
              },
            },
          ]
        );
        return;
      }
      Alert.alert('Add to cart failed', message);
    } finally {
      setAddingItemId(null);
    }
  };

  const handleChatWithOwner = async () => {
    try {
      const response = await api.post('/chats', { restaurantId: currentRestaurant.id });
      if (response.data.success) {
        navigation.navigate('ChatDetail', { 
          chatId: response.data.data._id, 
          name: currentRestaurant.name 
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to owner.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <Text style={{fontSize: 20, color: '#222'}}>{'<-'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Epicurean</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity style={styles.headerIcon} onPress={handleToggleFavorite}>
            <Text style={[{fontSize: 20}, isFavorite && {color: RED}]}>{isFavorite ? '♥' : '♡'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerIcon, {marginLeft: 15}]} onPress={handleChatWithOwner}>
            <Text style={{fontSize: 20}}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerIcon, {marginLeft: 15}]} onPress={() => navigation.navigate('Cart')}>
            <Text style={{fontSize: 20}}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cover Image */}
        <Image source={{ uri: currentRestaurant.coverImage }} style={styles.coverImage} />

        {/* Restaurant Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Text style={styles.restaurantName}>{currentRestaurant.name}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {currentRestaurant.rating}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>🕒</Text>
            <Text style={styles.metaText}>{currentRestaurant.time}</Text>
            <Text style={[styles.metaIcon, {marginLeft: 15}]}>🛵</Text>
            <Text style={styles.metaText}>{currentRestaurant.delivery}</Text>
          </View>
          <Text style={styles.description}>{currentRestaurant.description}</Text>
          <TouchableOpacity style={styles.chatOwnerButton} onPress={handleChatWithOwner}>
            <Text style={styles.chatOwnerIcon}>💬</Text>
            <Text style={styles.chatOwnerText}>Message Owner</Text>
          </TouchableOpacity>
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

        {/* Menu Items */}
        <View style={styles.menuList}>
          {displayMenuItems.map((item, index) => (
            <TouchableOpacity key={item.id} style={styles.menuItemCard} onPress={() => navigation.navigate('FoodDetail', { item })}>
              <Image source={{ uri: item.image }} style={styles.menuItemImage} />
              <View style={styles.menuItemInfo}>
                <View style={styles.menuItemNameRow}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  {item.tags.map(tag => (
                    <View key={tag} style={styles.tagBadge}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.menuItemDesc} numberOfLines={2}>{item.description}</Text>
                
                <View style={styles.menuItemBottom}>
                  <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                  <TouchableOpacity 
                    style={[
                      index === 0 ? styles.addButtonDark : styles.addButtonLite,
                      addingItemId === item.id && { opacity: 0.5 }
                    ]}
                    onPress={() => handleAddToCart(item)}
                    disabled={addingItemId === item.id}
                  >
                    <Text style={index === 0 ? styles.addButtonDarkText : styles.addButtonLiteText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{height: 100}} />
      </ScrollView>

      {/* Floating View Cart Button */}
      {cartCount > 0 && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity style={styles.floatingCartButton} onPress={() => navigation.navigate('Cart')}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
            <Text style={styles.viewCartText}>View Cart</Text>
            <Text style={styles.cartTotalText}>${cartTotal.toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: LIGHT_BG,
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
  coverImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#eee',
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  ratingBadge: {
    backgroundColor: '#fbe8e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: RED,
    fontWeight: 'bold',
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  metaIcon: {
    fontSize: 12,
    color: GRAY,
    marginRight: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#444',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  chatOwnerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fbe8e8',
    paddingVertical: 10,
    borderRadius: 8,
  },
  chatOwnerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  chatOwnerText: {
    color: RED,
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoriesScroll: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  categoryPillActive: {
    backgroundColor: '#9a0d17',
  },
  categoryText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  menuList: {
    paddingHorizontal: 20,
  },
  menuItemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },
  menuItemImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#eee',
  },
  menuItemInfo: {
    padding: 15,
  },
  menuItemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 10,
  },
  tagBadge: {
    backgroundColor: '#fbe8e8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    color: '#9a0d17',
    fontSize: 10,
    fontWeight: 'bold',
  },
  menuItemDesc: {
    fontSize: 13,
    color: GRAY,
    marginBottom: 15,
    lineHeight: 18,
  },
  menuItemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  addButtonDark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#B11226',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDarkText: {
    color: '#fff',
    fontSize: 20,
    marginTop: -2,
  },
  addButtonLite: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fbe8e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonLiteText: {
    color: '#B11226',
    fontSize: 20,
    marginTop: -2,
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
  },
  floatingCartButton: {
    backgroundColor: '#B11226',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#B11226',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  cartBadge: {
    backgroundColor: '#df5867',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  viewCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartTotalText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
