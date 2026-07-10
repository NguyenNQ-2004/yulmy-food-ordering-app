import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

import Header from '../../components/Header';
import api from '../../services/api';

const RED = '#B11226';
const LIGHT_BG = '#fff8f7';
const CARD_BG = '#ffffff';
const TEXT_COLOR = '#271816';
const INPUT_BG = '#ffe9e6';

export default function AddEditFoodScreen({ route, navigation }) {
  const editFood = route.params?.food;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Chicken');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');

  useEffect(() => {
    if (editFood) {
      setName(editFood.name);
      setPrice(editFood.price.toString());
      setCategory(editFood.category);
      setDescription(editFood.description);
      setImageUri(editFood.image);
    }
  }, [editFood]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !price || !description) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
      Alert.alert('Error', 'Please enter a valid price.');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name,
        price: priceNum,
        category,
        description,
        image: imageUri,
      };

      if (editFood?._id) {
        await api.put(`/owner/foods/${editFood._id}`, payload);
      } else {
        await api.post('/owner/foods', payload);
      }

      Alert.alert(
        'Success',
        `Dish "${name}" ${editFood ? 'updated' : 'added'} successfully!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save dish.');
    } finally {
      setIsSaving(false);
    }
  };

  const categories = ['Chicken', 'Burger', 'Rice', 'Noodles', 'Drinks', 'Dessert'];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={editFood ? 'Edit Dish' : 'Add New Dish'}
        onBack={() => navigation.goBack()}
        rightIcon="💾"
        onRightPress={handleSave}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dish Image */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.foodImage} />
          ) : (
            <View style={[styles.foodImage, styles.imagePlaceholder]}>
              <Text style={styles.imagePlaceholderText}>No photo yet</Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.changeImageBtn}
            onPress={() => Alert.alert('Upload Photo', 'Photo picker placeholder')}
          >
            <Text style={styles.changeImageText}>📸 Upload Dish Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Dish Name *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Crispy Chicken Fillet"
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.label}>Price (VND) *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="e.g., 45000"
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryPickerRow}>
            {categories.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryBtn, isSelected && styles.categoryBtnActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryBtnText, isSelected && styles.categoryBtnTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Description *</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholder="Describe the dish ingredients, taste, and serving size..."
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{editFood ? 'Update Dish' : 'Add to Menu'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
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
  scrollContent: {
    padding: 20,
  },
  imageContainer: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e4beb9',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    backgroundColor: INPUT_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    color: '#8f6f6c',
    fontSize: 13,
    fontWeight: '600',
  },
  changeImageBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  form: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f0e5e3',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_COLOR,
    marginBottom: 8,
    marginTop: 12,
  },
  inputContainer: {
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e4beb9',
  },
  input: {
    fontSize: 15,
    color: TEXT_COLOR,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4beb9',
    backgroundColor: '#fff',
  },
  categoryBtnActive: {
    backgroundColor: RED,
    borderColor: RED,
  },
  categoryBtnText: {
    fontSize: 12,
    color: '#8f6f6c',
    fontWeight: '600',
  },
  categoryBtnTextActive: {
    color: '#fff',
  },
  textAreaContainer: {
    height: 100,
    paddingVertical: 12,
  },
  textArea: {
    height: '100%',
  },
  saveButton: {
    backgroundColor: RED,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    ...Platform.select({
      ios: {
        shadowColor: RED,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
