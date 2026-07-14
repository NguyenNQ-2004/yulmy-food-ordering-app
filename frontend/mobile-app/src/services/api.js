import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Injected by app.config.js from EXPO_PUBLIC_API_URL. Localhost fallback keeps
// web dev and the jest suite working when no env/extra is present.
let API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000/api';

// For physical devices or emulator, dynamically use the dev server IP
if (__DEV__ && Platform.OS !== 'web' && Constants.expoConfig?.hostUri) {
  const host = Constants.expoConfig.hostUri.split(':')[0];
  API_URL = `http://${host}:5000/api`;
} else if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
  // For web platform, dynamically use the current host's IP/domain
  API_URL = `http://${window.location.hostname}:5000/api`;
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

let authToken = null;
api.setClientToken = (token) => {
  authToken = token;
};

// Request interceptor: attach JWT token automatically
api.interceptors.request.use(
  async (config) => {
    try {
      const token = authToken || await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // AsyncStorage error — proceed without token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — could trigger logout here
      console.warn('Unauthorized request — token may be expired.');
    }
    return Promise.reject(error);
  }
);

export default api;
