import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState('Do you want to logout?');

  const persistUserSession = async (userData, userToken = token) => {
    setCurrentUser(userData);

    if (userToken) {
      await AsyncStorage.setItem('token', userToken);
    }

    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [savedUser, savedToken] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('token'),
        ]);

        if (savedUser && savedToken) {
          setCurrentUser(JSON.parse(savedUser));
          setToken(savedToken);
          api.setClientToken(savedToken);
        }
      } catch (error) {
        await AsyncStorage.multiRemove(['user', 'token']);
      }
    };

    restoreSession();

    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          setCurrentUser(null);
          setToken(null);
          api.setClientToken(null);
          await AsyncStorage.multiRemove(['user', 'token']);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const userData = response.data.data.user;
      const userToken = response.data.data.token;

      setCurrentUser(userData);
      setToken(userToken);
      api.setClientToken(userToken);

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', userToken);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    setToken(null);
    api.setClientToken(null);

    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
  };

  const confirmLogout = (message = 'Do you want to logout?') => {
    setLogoutMessage(message);
    setLogoutModalVisible(true);
  };

  const closeLogoutModal = () => {
    setLogoutModalVisible(false);
  };

  const handleConfirmLogout = async () => {
    setLogoutModalVisible(false);
    await logout();
  };

  const register = async (fullName, email, password, phone) => {
    try {
      const response = await api.post('/auth/register', {
        fullName,
        email,
        password,
        phone,
      });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  const resetPassword = async (email) => {
    try {
      const response = await api.post('/auth/reset-password', {
        email,
      });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || 'Password reset failed. Please try again.',
      };
    }
  };

  const refreshCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.data;
      await persistUserSession(userData);

      return {
        success: true,
        data: userData,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || 'Failed to refresh account information.',
      };
    }
  };

  const updatePreferences = async (payload) => {
    try {
      const response = await api.patch('/auth/preferences', payload);
      const userData = response.data.data;
      await persistUserSession(userData);

      return {
        success: true,
        data: userData,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || 'Failed to update preferences.',
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      return {
        success: true,
        message: response.data.message || 'Password updated successfully.',
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || 'Failed to change password.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        login,
        logout,
        confirmLogout,
        register,
        resetPassword,
        refreshCurrentUser,
        updatePreferences,
        changePassword,
      }}
    >
      {children}

      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeLogoutModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>{logoutMessage}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                activeOpacity={0.85}
                onPress={closeLogoutModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                activeOpacity={0.9}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.confirmButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(39, 24, 22, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#271816',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#5b403d',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#f0e5e3',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: '#B11226',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#8f6f6c',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
