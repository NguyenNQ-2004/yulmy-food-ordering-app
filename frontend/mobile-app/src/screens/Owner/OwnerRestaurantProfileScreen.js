import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Switch,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';

import Header from '../../components/Header';
import BottomNavBar from '../../components/BottomNavBar';

const RED = '#B11226';
const LIGHT_BG = '#fff8f7';
const CARD_BG = '#ffffff';
const TEXT_COLOR = '#271816';
const INPUT_BG = '#ffe9e6';

export default function OwnerRestaurantProfileScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const [isLive, setIsLive] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await api.get('/owner/restaurant');
        const r = response.data.data;
        setName(r.name || '');
        setCategory(r.category || '');
        setAddress(r.address || '');
        setPhone(r.phone || '');
        setHours(r.hours || '');
        setDescription(r.description || '');
        setImageUri(r.image || '');
        setIsLive(r.status === 'active');
      } catch (error) {
        console.error('Fetch restaurant error:', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurant();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.put('/owner/restaurant', {
        name, category, address, phone, hours, description,
        image: imageUri,
        status: isLive ? 'active' : 'inactive',
      });
      Alert.alert('Success', 'Restaurant profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Restaurant Profile"
        onBack={() => navigation.goBack()}
        rightIcon="💾"
        onRightPress={handleSave}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Cover Photo */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.coverImage} />
          <TouchableOpacity style={styles.uploadOverlay} onPress={() => Alert.alert('Upload Photo', 'Photo picker placeholder')}>
            <Text style={styles.uploadText}>📸 Change Cover Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Live Status Toggle */}
        <View style={styles.statusCard}>
          <View>
            <Text style={styles.statusTitle}>Restaurant Status</Text>
            <Text style={styles.statusSubtitle}>{isLive ? 'Currently open and accepting orders' : 'Closed for orders'}</Text>
          </View>
          <Switch
            value={isLive}
            onValueChange={setIsLive}
            trackColor={{ false: '#767577', true: RED + '50' }}
            thumbColor={isLive ? RED : '#f4f3f4'}
          />
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <Text style={styles.inputLabel}>Restaurant Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Epicurean Bistro"
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.inputLabel}>Cuisine / Categories</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Italian, Pasta, Pizza"
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.inputLabel}>Address</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Restaurant location"
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.inputLabel}>Opening Hours</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={hours}
              onChangeText={setHours}
              placeholder="e.g., 08:00 AM - 10:00 PM"
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.inputLabel}>Contact Phone</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Phone number"
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.inputLabel}>Description</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholder="Tell customers about your restaurant..."
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
            <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
      </KeyboardAvoidingView>

      <BottomNavBar navigation={navigation} activeRoute="OwnerRestaurantProfile" />

      {/* Custom Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to log out of Epicurean?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelModalButton]} 
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmModalButton]} 
                onPress={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmModalText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  imageContainer: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD_BG,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0e5e3',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#8f6f6c',
    marginTop: 2,
  },
  form: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f0e5e3',
  },
  inputLabel: {
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
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: RED,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  logoutButtonText: {
    color: RED,
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(39, 24, 22, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: TEXT_COLOR,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#5b403d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0e5e3',
  },
  confirmModalButton: {
    backgroundColor: RED,
  },
  cancelModalText: {
    color: '#8f6f6c',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmModalText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
