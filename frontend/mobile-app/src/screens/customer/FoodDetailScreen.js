import React, { useState } from 'react';
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
} from 'react-native';

import { addItemToCart, clearCart } from '../../services/customerOrderApi';
import { clearLocalCartItems } from '../../services/localCartStorage';

const { width } = Dimensions.get('window');

const RED = '#B11226';
const LIGHT_BG = '#fffaf9';
const GRAY = '#888';

const FOOD_ITEM = {
  id: '66c000000000000000000005',
  name: 'Truffle Mushroom Risotto',
  price: 28.00,
  rating: 4.9,
  reviews: 124,
  tags: ['Vegetarian', 'Gluten-Free'],
  description: 'A masterful blend of creamy Arborio rice slowly simmered in a rich vegetable broth, infused with the earthy aroma of wild porcini mushrooms. Finished with delicate shavings of fresh black truffle, aged Parmigiano-Reggiano, and a drizzle of premium white truffle oil. A truly decadent experience that brings the essence of the Italian countryside to your palate.',
  image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80', // Replace with a risotto/pasta image
};

const PAIRINGS = [
  {
    id: 1,
    name: 'Barolo Reserve Glass',
    category: 'Red Wine',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=500&q=80',
  },
  {
    id: 2,
    name: 'Artisanal Garlic Bread',
    category: 'Sides',
    price: 8.00,
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&q=80',
  }
];

export default function FoodDetailScreen({ navigation, route }) {
  const passedItem = route.params?.item || {};
  
  const currentFood = {
    ...FOOD_ITEM,
    ...passedItem,
    // Ensure tags is always an array
    tags: passedItem.tags || FOOD_ITEM.tags,
  };

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleIncrease = () => setQuantity(q => q + 1);
  const handleDecrease = () => setQuantity(q => Math.max(1, q - 1));

  const handleAddToCart = async () => {
    try {
      await addItemToCart(currentFood.id || currentFood._id, quantity);
      await clearLocalCartItems();
      Alert.alert('Success', 'Added to cart');
      navigation.goBack();
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
                  await addItemToCart(currentFood.id || currentFood._id, quantity);
                  await clearLocalCartItems();
                  Alert.alert('Success', 'Added to cart');
                  navigation.goBack();
                } catch (replaceError) {
                  Alert.alert('Add to cart failed', replaceError.response?.data?.message || 'Cannot add this item to cart.');
                }
              },
            },
          ]
        );
        return;
      }
      Alert.alert('Error', message);
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
        <TouchableOpacity style={styles.headerIcon}>
          <Text style={{fontSize: 20}}>🛍️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Cover Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: currentFood.image }} style={styles.coverImage} />
          <TouchableOpacity 
            style={styles.heartButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Text style={{color: isFavorite ? RED : '#ccc', fontSize: 24, marginTop: -2}}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {/* Title & Rating */}
          <Text style={styles.foodName}>{currentFood.name}</Text>
          
          <View style={styles.priceRatingRow}>
            <Text style={styles.foodPrice}>${(currentFood.price || 0).toFixed(2)}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {currentFood.rating || 4.5} <Text style={styles.reviewText}>({currentFood.reviews || 0} reviews)</Text></Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {currentFood.tags.map((tag, idx) => (
              <View key={idx} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>About this dish</Text>
          <Text style={styles.description}>{currentFood.description || 'Delicious meal prepared with fresh ingredients.'}</Text>

          <View style={styles.divider} />

          {/* Quantity */}
          <View style={styles.quantityRow}>
            <Text style={styles.sectionTitleNoMargin}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity style={styles.qtyBtn} onPress={handleDecrease}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={handleIncrease}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Pair it with */}
          <Text style={styles.sectionTitle}>Pair it with</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pairingsScroll}>
          {PAIRINGS.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.pairingCard}
              onPress={() => navigation.push('FoodDetail', { item })}
            >
              <Image source={{ uri: item.image }} style={styles.pairingImage} />
              <View style={styles.pairingInfo}>
                <Text style={styles.pairingName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.pairingCategory}>{item.category}</Text>
                <View style={styles.pairingBottom}>
                  <Text style={styles.pairingPrice}>${item.price.toFixed(2)}</Text>
                  <TouchableOpacity style={styles.addButtonLite}>
                    <Text style={styles.addButtonLiteText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{height: 120}} />
      </ScrollView>

      {/* Add to Cart Bar */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartIcon}>🛍️</Text>
          <Text style={styles.addToCartText}>Add to Cart</Text>
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
  scrollContent: {
    paddingBottom: 0,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
  },
  heartButton: {
    position: 'absolute',
    bottom: -25,
    right: 25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  foodPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: RED,
  },
  ratingBadge: {
    backgroundColor: '#fbe8e8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  ratingText: {
    color: RED,
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewText: {
    fontWeight: 'normal',
    color: '#555',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 10,
  },
  tagText: {
    color: '#555',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
  },
  sectionTitleNoMargin: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 20,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  qtyBtnText: {
    fontSize: 20,
    color: '#222',
    fontWeight: 'bold',
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: 10,
  },
  pairingsScroll: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  pairingCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 10,
  },
  pairingImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#eee',
  },
  pairingInfo: {
    padding: 12,
  },
  pairingName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  pairingCategory: {
    fontSize: 12,
    color: GRAY,
    marginBottom: 10,
  },
  pairingBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pairingPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: RED,
  },
  addButtonLite: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fbe8e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonLiteText: {
    color: RED,
    fontSize: 20,
    marginTop: -2,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fffaf9',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addToCartButton: {
    backgroundColor: RED,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addToCartIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#fff',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
