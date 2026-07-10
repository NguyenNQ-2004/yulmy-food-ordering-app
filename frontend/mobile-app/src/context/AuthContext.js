import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api, { setAuthToken } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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
        const [storedUser, storedToken] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('token'),
        ]);

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          setToken(storedToken);
          setAuthToken(storedToken);
        }
      } catch (error) {
        await AsyncStorage.multiRemove(['user', 'token']);
        setAuthToken(null);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

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
        }
      } catch (error) {
        await AsyncStorage.multiRemove(['user', 'token']);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const userData = response.data.data.user;
      const userToken = response.data.data.token;

      setToken(userToken);
      setAuthToken(userToken);

      await persistUserSession(userData, userToken);

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
    setAuthToken(null);

    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
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
        authLoading,
        login,
        logout,
        register,
        resetPassword,
        refreshCurrentUser,
        updatePreferences,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
