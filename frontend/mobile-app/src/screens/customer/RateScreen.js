import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { rateOrder } from '../../services/customerOrderApi';

const RED = '#B11226';
const LIGHT_BG = '#fffaf9';
const GRAY = '#888';
const LIGHT_GRAY = '#f2f2f2';

export default function RateScreen({ route, navigation }) {
  const { order } = route.params;
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setErrorMsg('');
    if (rating < 1 || rating > 5) {
      setErrorMsg('Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      setIsSubmitting(true);
      await rateOrder(order._id, rating, review);
      if (Platform.OS === 'web') {
        navigation.goBack();
      } else {
        Alert.alert('Success', 'Thank you for your review!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Rate order error:', error);
      const msg = error.response?.data?.message || 'Failed to submit review.';
      if (Platform.OS === 'web') {
        setErrorMsg(msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            activeOpacity={0.7}
          >
            <Text style={[styles.starIcon, rating >= star && styles.starIconActive]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Rate Your Order</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
              <Text style={styles.restaurantName}>{order.restaurant?.name || 'Restaurant'}</Text>
              <Text style={styles.orderCode}>Order: {order.orderCode}</Text>
              
              <Text style={styles.label}>How was your food?</Text>
              {renderStars()}
              <Text style={styles.ratingText}>{rating} out of 5 stars</Text>

              <Text style={styles.label}>Leave a review (optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="What did you like or dislike?"
                placeholderTextColor={GRAY}
                multiline
                numberOfLines={4}
                value={review}
                onChangeText={setReview}
              />
            </View>

            <View style={styles.footer}>
              {errorMsg ? <Text style={{ color: RED, marginBottom: 10, fontWeight: 'bold' }}>{errorMsg}</Text> : null}
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  innerContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#f2f2f2',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  orderCode: {
    fontSize: 14,
    color: GRAY,
    marginBottom: 40,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
    marginTop: 20,
    alignSelf: 'flex-start',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  starIcon: {
    fontSize: 48,
    color: LIGHT_GRAY,
  },
  starIconActive: {
    color: '#FFD700',
  },
  ratingText: {
    fontSize: 14,
    color: GRAY,
    marginTop: 10,
    marginBottom: 20,
  },
  textInput: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    padding: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#f2f2f2',
  },
  submitButton: {
    backgroundColor: RED,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
