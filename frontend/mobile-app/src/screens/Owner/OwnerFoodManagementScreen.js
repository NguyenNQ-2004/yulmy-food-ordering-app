import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Header from '../../components/Header';
import BottomNavBar from '../../components/BottomNavBar';
import api from '../../services/api';

const RED = '#B11226';
const LIGHT_BG = '#fff8f7';
const CARD_BG = '#ffffff';
const TEXT_COLOR = '#271816';

const CATEGORIES = ['All', 'Chicken', 'Burger', 'Rice', 'Noodles', 'Drinks', 'Dessert'];

export default function OwnerFoodManagementScreen({ navigation }) {
  const [foods, setFoods] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const fetchFoods = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/owner/foods');
      setFoods(response.data.data);
    } catch (error) {
      console.error('Fetch foods error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFoods();
    }, [])
  );

  const handleDelete = (id, name) => {
    Alert.alert(
      'Delete Dish',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/owner/foods/${id}`);
              setFoods(prev => prev.filter(item => item._id !== id));
              Alert.alert('Success', 'Dish deleted successfully.');
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete.');
            }
          }
        }
      ]
    );
  };

  const filteredFoods = activeCategory === 'All'
    ? foods
    : foods.filter(item => item.category === activeCategory);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Manage Menu"
        onBack={() => navigation.navigate('OwnerDashboard')}
        rightIcon="🤖"
        onRightPress={() => navigation.navigate('AIFoodAssistant')}
      />

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map((cat, idx) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={RED} />
            <Text style={styles.emptyText}>Loading menu...</Text>
          </View>
        ) : filteredFoods.length > 0 ? (
          filteredFoods.map((item) => (
            <View key={item._id} style={styles.foodCard}>
              <Image source={{ uri: item.image }} style={styles.foodImage} />
              <View style={styles.foodInfo}>
                <View style={styles.foodHeader}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodPrice}>{item.price.toLocaleString()} VND</Text>
                </View>
                <Text style={styles.foodDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                
                <View style={styles.actionRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.category.toUpperCase()}</Text>
                  </View>
                  <View style={styles.buttons}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => navigation.navigate('AddEditFood', { food: item })}
                    >
                      <Text style={styles.btnText}>✏️ Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(item._id, item.name)}
                    >
                      <Text style={styles.btnText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No dishes found under this category.</Text>
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditFood')}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      <BottomNavBar navigation={navigation} activeRoute="OwnerFoodManagement" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e5e3',
  },
  categoryScroll: {
    paddingHorizontal: 20,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e4beb9',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  categoryPillActive: {
    backgroundColor: RED,
    borderColor: RED,
  },
  categoryText: {
    color: '#8f6f6c',
    fontWeight: '600',
    fontSize: 13,
  },
  categoryTextActive: {
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  foodCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0e5e3',
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  foodImage: {
    width: 100,
    height: '100%',
    minHeight: 120,
    resizeMode: 'cover',
  },
  foodInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_COLOR,
    flex: 1,
    marginRight: 8,
  },
  foodPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: RED,
  },
  foodDesc: {
    fontSize: 12,
    color: '#8f6f6c',
    marginVertical: 6,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  badge: {
    backgroundColor: '#fff0ee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#e4beb9',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: RED,
    letterSpacing: 0.5,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4beb9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_COLOR,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#8f6f6c',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: RED,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
    zIndex: 999,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
