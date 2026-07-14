import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Platform,
} from 'react-native';

import api from '../../services/api';

const RED = '#B11226';
const LIGHT_BG = '#fffaf9';
const GRAY = '#888';

export default function ReviewScreen({ route, navigation }) {
  const { orderId, restaurantName = 'Artisan Tasting Menu' } = route.params || {};
  const [rating, setRating] = useState(4); // Default 4 stars like in mockup
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mock food image
  const foodImageUri = 'https://images.unsplash.com/photo-1547592180-85f173990554?w=150&q=80';

  const handleSubmit = async () => {
    if (!orderId) {
      Alert.alert('Error', 'Missing order information.');
      return;
    }
    setSubmitting(true);
    
    try {
      const response = await api.post('/customer/reviews', {
        orderId,
        rating,
        comment,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Thank you for your feedback! Your review has been submitted.', [
          { text: 'OK', onPress: () => navigation.navigate('OrderHistory') }
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit review.');
      }
    } catch (error) {
      console.error('Review submit error:', error);
      Alert.alert(
        'Submit Failed', 
        error.response?.data?.message || 'Could not connect to the server.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>{'<-'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Epicurean</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.headerEmoji}>👜</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Meal Info Card */}
        <View style={styles.mealCard}>
          <Image source={{ uri: foodImageUri }} style={styles.mealImage} />
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>{restaurantName}</Text>
            <Text style={styles.deliveryTime}>Delivered today at 7:30 PM</Text>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Rate your experience</Text>
          <Text style={styles.sectionSubtitle}>Tap a star to leave a rating</Text>
          
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.8}>
                <Text style={[styles.star, rating >= star ? styles.starFilled : styles.starOutline]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Comment Section */}
        <View style={styles.commentSection}>
          <Text style={styles.label}>Leave a review</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Share details of your culinary experience..."
            multiline
            numberOfLines={5}
            value={comment}
            onChangeText={setComment}
            placeholderTextColor="#a08582"
          />
        </View>

        {/* Upload Photos Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.label}>Add Photos</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={() => alert('Camera upload is not available in mock mode.')}>
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.uploadText}>Upload an image</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  backIcon: {
    fontSize: 20,
    color: RED,
  },
  headerEmoji: {
    fontSize: 20,
    color: RED,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: RED,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fde8eb',
    marginBottom: 30,
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 14,
    backgroundColor: '#eee',
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  deliveryTime: {
    fontSize: 13,
    color: GRAY,
    marginTop: 4,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: GRAY,
    marginTop: 6,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 36,
  },
  starFilled: {
    color: RED,
  },
  starOutline: {
    color: '#ebd6d8',
  },
  commentSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fde8eb',
    borderRadius: 12,
    padding: 14,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333',
  },
  uploadSection: {
    marginBottom: 35,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#b1122650',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#FFF0F2',
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 24,
    color: RED,
  },
  uploadText: {
    fontSize: 13,
    color: '#b11226aa',
    fontWeight: 'bold',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: RED,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
